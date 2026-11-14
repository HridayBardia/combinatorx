"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Play,
  RotateCcw,
  BarChart2,
  Zap,
  Clock,
  Download,
  Copy,
  Check,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  countPathsMatrix,
  countPathsDFS,
  countPathsDP,
  BenchmarkDataPoint,
  exportBenchmarkCSV,
} from "@/lib/math-engine";

interface BenchmarkSuiteProps {
  skipSet: number[];
}

export const BenchmarkSuite: React.FC<BenchmarkSuiteProps> = ({ skipSet }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkDataPoint[]>([]);
  const [scaleType, setScaleType] = useState<"linear" | "log">("linear");
  const [maxBenchDepth, setMaxBenchDepth] = useState<number>(30);
  const [speedupFactor, setSpeedupFactor] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    setProgress(0);
    setBenchmarkData([]);
    setSpeedupFactor(null);

    const depths: number[] = [];
    for (let d = 5; d <= maxBenchDepth; d += 2) {
      depths.push(d);
    }
    if (depths[depths.length - 1] !== maxBenchDepth) {
      depths.push(maxBenchDepth);
    }

    const results: BenchmarkDataPoint[] = [];

    for (let i = 0; i < depths.length; i++) {
      const d = depths[i];
      setProgress(Math.round(((i + 1) / depths.length) * 100));

      // Yield event loop so UI stays snappy
      await new Promise((resolve) => setTimeout(resolve, 25));

      // 1. Matrix Exponentiation
      const matrixRes = countPathsMatrix(d, skipSet);

      // 2. Linear DP
      const dpRes = countPathsDP(d, skipSet);

      // 3. Naive DFS (only up to depth 32)
      let dfsTime: number | null = null;
      let dfsCalls: number | undefined = undefined;

      if (d <= 32) {
        const dfsRes = countPathsDFS(d, skipSet, 15_000_000, 2200);
        dfsTime = dfsRes.timedOut ? 2200 : Math.max(0.001, dfsRes.executionTimeMs);
        dfsCalls = dfsRes.recursiveCalls;
      }

      results.push({
        depth: d,
        matrixTimeMs: Number(matrixRes.executionTimeMs.toFixed(3)),
        dfsTimeMs: dfsTime !== null ? Number(dfsTime.toFixed(3)) : null,
        dpTimeMs: Number(dpRes.executionTimeMs.toFixed(3)),
        pathsCount: matrixRes.paths.toString(),
        dfsCallCount: dfsCalls,
      });

      setBenchmarkData([...results]);
    }

    // Maximum speedup multiplier
    const lastWithBoth = [...results].reverse().find((r) => r.dfsTimeMs !== null && r.matrixTimeMs > 0);
    if (lastWithBoth && lastWithBoth.dfsTimeMs) {
      const factor = Math.round(lastWithBoth.dfsTimeMs / Math.max(0.001, lastWithBoth.matrixTimeMs));
      setSpeedupFactor(factor);
    }

    setIsRunning(false);
  };

  const handleCopyCSV = () => {
    if (benchmarkData.length === 0) return;
    const csv = exportBenchmarkCSV(benchmarkData);
    navigator.clipboard.writeText(csv);
    setCopiedCSV(true);
    setTimeout(() => setCopiedCSV(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (benchmarkData.length === 0) return;
    const csv = exportBenchmarkCSV(benchmarkData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `combinatorx_benchmark_S_${skipSet.join("_")}_n_${maxBenchDepth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pro-card p-5 space-y-5">
      {/* Benchmark Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#1C273C] gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#111928] border border-[#23324C] text-emerald-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
              Comparative Algorithmic Benchmark Suite
            </h3>
            <p className="text-[11px] text-slate-400">
              Empirical runtime verification: O(k³ log n) Companion Matrix vs O(|S|ⁿ) Naive DFS
            </p>
          </div>
        </div>

        {/* Benchmarking Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scale Switcher */}
          <div className="flex items-center bg-[#090E17] border border-[#1C273C] p-0.5 rounded-md text-[11px] font-mono">
            <button
              onClick={() => setScaleType("linear")}
              className={`px-2 py-0.5 rounded transition-colors ${
                scaleType === "linear"
                  ? "bg-[#182337] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Linear Y
            </button>
            <button
              onClick={() => setScaleType("log")}
              className={`px-2 py-0.5 rounded transition-colors ${
                scaleType === "log"
                  ? "bg-[#182337] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Log₁₀ Y
            </button>
          </div>

          {/* Depth Range Dropdown */}
          <select
            value={maxBenchDepth}
            onChange={(e) => setMaxBenchDepth(parseInt(e.target.value, 10))}
            disabled={isRunning}
            className="bg-[#090E17] border border-[#1C273C] text-xs font-mono text-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500"
          >
            <option value={24}>Max n = 24 (Instant)</option>
            <option value={28}>Max n = 28 (Standard)</option>
            <option value={30}>Max n = 30 (Recommended)</option>
            <option value={34}>Max n = 34 (Heavy Stress)</option>
          </select>

          {/* CSV actions */}
          {benchmarkData.length > 0 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopyCSV}
                title="Copy Benchmark CSV to clipboard"
                className="p-1 rounded bg-[#131B2A] border border-[#23324C] text-slate-400 hover:text-white"
              >
                {copiedCSV ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadCSV}
                title="Download Benchmark CSV"
                className="p-1 rounded bg-[#131B2A] border border-[#23324C] text-slate-400 hover:text-white"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Execute Run Button */}
          <button
            onClick={runBenchmark}
            disabled={isRunning}
            className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
              isRunning
                ? "bg-emerald-950/60 border border-emerald-800 text-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold"
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-3 h-3 animate-spin" />
                <span>Benchmarking ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Execute Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Speedup KPI Callout */}
      {speedupFactor !== null && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-[#0A1A18] border border-emerald-500/50 text-emerald-300 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400 fill-current shrink-0" />
            <span>
              Empirical Result at depth n = {maxBenchDepth}:{" "}
              <strong className="text-white text-sm font-bold underline decoration-emerald-500">
                {speedupFactor.toLocaleString()}× Faster
              </strong>{" "}
              for OGF Companion Matrix vs Naive DFS!
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 sm:mt-0">
            Skip Set S = [{skipSet.join(", ")}]
          </span>
        </div>
      )}

      {/* Recharts Performance Line Chart */}
      <div className="h-72 w-full pt-1">
        {benchmarkData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border border-dashed border-[#1C273C] rounded-lg text-slate-500 space-y-2.5">
            <Clock className="w-7 h-7 text-slate-600" />
            <div className="text-xs font-mono font-semibold text-slate-300">
              Benchmark Suite Idle
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm text-center font-mono">
              Execute test to evaluate depths n = 5 to {maxBenchDepth} simultaneously.
            </p>
            <button
              onClick={runBenchmark}
              className="px-3 py-1.5 text-xs font-mono font-semibold rounded bg-[#131B2A] text-emerald-400 border border-emerald-500/40 hover:bg-emerald-950/60 transition-all"
            >
              Start Automated Test
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={benchmarkData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#182337" />
              <XAxis
                dataKey="depth"
                stroke="#475569"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                label={{
                  value: "Network Depth (n)",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                fontFamily="monospace"
                scale={scaleType === "log" ? "log" : "auto"}
                domain={scaleType === "log" ? [0.001, "auto"] : [0, "auto"]}
                tickLine={false}
                label={{
                  value: scaleType === "log" ? "Latency log₁₀(ms)" : "Latency (ms)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload as BenchmarkDataPoint;
                    return (
                      <div className="bg-[#0B101A]/95 border border-[#23324C] p-3 rounded-lg shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-md">
                        <div className="font-bold text-white border-b border-[#1C273C] pb-1">
                          Network Depth: n = {label}
                        </div>
                        <div className="text-emerald-400 flex items-center justify-between gap-5">
                          <span>Companion Matrix:</span>
                          <span className="font-semibold">
                            {dataPoint.matrixTimeMs < 0.01
                              ? "< 0.010 ms"
                              : `${dataPoint.matrixTimeMs} ms`}
                          </span>
                        </div>
                        <div className="text-rose-400 flex items-center justify-between gap-5">
                          <span>Naive DFS:</span>
                          <span className="font-semibold">
                            {dataPoint.dfsTimeMs !== null
                              ? `${dataPoint.dfsTimeMs} ms`
                              : "Skipped (depth > 32)"}
                          </span>
                        </div>
                        <div className="text-cyan-400 flex items-center justify-between gap-5">
                          <span>Dynamic Prog:</span>
                          <span className="font-semibold">{dataPoint.dpTimeMs} ms</span>
                        </div>
                        <div className="text-slate-400 text-[10px] border-t border-[#1C273C] pt-1">
                          Total Topologies: {Number(dataPoint.pathsCount).toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }}
              />
              <Line
                type="monotone"
                dataKey="dfsTimeMs"
                name="Naive DFS [O(|S|ⁿ)]"
                stroke="#F43F5E"
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: "#F43F5E" }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="matrixTimeMs"
                name="Companion Matrix [O(k³ log n)]"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: "#10B981" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="dpTimeMs"
                name="Linear DP [O(n · |S|)]"
                stroke="#06B6D4"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Table Toggle */}
      {benchmarkData.length > 0 && (
        <div className="space-y-3 pt-1 border-t border-[#1C273C]">
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center space-x-1.5 text-xs font-mono text-slate-300 hover:text-white"
          >
            <TableIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{showTable ? "Hide Raw Benchmark Telemetry Table" : "Show Raw Benchmark Telemetry Table"}</span>
            {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTable && (
            <div className="overflow-x-auto max-h-56 overflow-y-auto border border-[#1C273C] rounded-lg">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#090E17] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1C273C] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Depth (n)</th>
                    <th className="py-2 px-3">Matrix (ms)</th>
                    <th className="py-2 px-3">DFS (ms)</th>
                    <th className="py-2 px-3">DP (ms)</th>
                    <th className="py-2 px-3">Speedup Multiplier</th>
                    <th className="py-2 px-3">Total Topologies (aₙ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182337] bg-[#070B13] text-slate-300">
                  {benchmarkData.map((d) => {
                    const speedup =
                      d.dfsTimeMs !== null && d.matrixTimeMs > 0
                        ? Math.round(d.dfsTimeMs / Math.max(0.001, d.matrixTimeMs))
                        : null;
                    return (
                      <tr key={d.depth} className="hover:bg-[#0E1523]">
                        <td className="py-1.5 px-3 font-bold text-white">n = {d.depth}</td>
                        <td className="py-1.5 px-3 text-emerald-400">
                          {d.matrixTimeMs < 0.01 ? "< 0.010" : d.matrixTimeMs}
                        </td>
                        <td className="py-1.5 px-3 text-rose-400">
                          {d.dfsTimeMs !== null ? d.dfsTimeMs : "N/A (>32)"}
                        </td>
                        <td className="py-1.5 px-3 text-cyan-400">{d.dpTimeMs}</td>
                        <td className="py-1.5 px-3 font-semibold text-white">
                          {speedup ? `${speedup.toLocaleString()}×` : "—"}
                        </td>
                        <td className="py-1.5 px-3 text-slate-400 truncate max-w-[150px]">
                          {d.pathsCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
