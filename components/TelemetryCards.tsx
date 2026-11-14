"use client";

import React, { useState } from "react";
import {
  Boxes,
  Clock,
  Code2,
  TrendingUp,
  Copy,
  Check,
  HelpCircle,
  Cpu,
  Layers,
} from "lucide-react";
import { CalculationResult, formatBigInt, computeDominantRoot } from "@/lib/math-engine";
import { AlgorithmType } from "@/lib/types";

interface TelemetryCardsProps {
  result: CalculationResult | null;
  depth: number;
  skipSet: number[];
  algorithm: AlgorithmType;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({
  result,
  depth,
  skipSet,
  algorithm,
}) => {
  const [copied, setCopied] = useState(false);
  const dominantRoot = computeDominantRoot(skipSet);

  if (!result) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="pro-card p-4 h-28 animate-pulse bg-[#0E1523]/60"
          />
        ))}
      </div>
    );
  }

  const rawPaths =
    result.algorithm === "dfs"
      ? BigInt(result.paths)
      : (result.paths as bigint);

  const formatted = formatBigInt(rawPaths);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawPaths.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDfsTimedOut = result.algorithm === "dfs" && result.timedOut;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Metric 1: Valid Topologies (a_n) */}
      <div className="pro-card pro-card-interactive p-4 relative group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <div className="flex items-center space-x-1.5">
            <Boxes className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Valid Topologies (aₙ)
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1A2538] transition-colors"
            title="Copy exact integer value to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="mt-1">
          <div
            className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white tabular-nums truncate"
            title={rawPaths.toString()}
          >
            {formatted.scientific}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>
              {formatted.digits > 12 ? (
                <span className="text-emerald-400 font-medium">
                  {formatted.digits.toLocaleString()} decimal digits
                </span>
              ) : (
                <span className="text-slate-400">Exact integer</span>
              )}
            </span>
            <span className="text-slate-500">Target n = {depth}</span>
          </div>
          {isDfsTimedOut && (
            <div className="mt-2 text-[10px] text-rose-400 bg-rose-950/40 border border-rose-900/40 rounded px-1.5 py-0.5 font-mono">
              DFS Safety Capped: execution budget exceeded
            </div>
          )}
        </div>
      </div>

      {/* Metric 2: Execution Latency */}
      <div className="pro-card pro-card-interactive p-4 relative group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Execution Latency
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#162032] border border-[#22314D] text-indigo-300">
            {result.algorithm === "matrix" ? "O(log n)" : result.algorithm === "dfs" ? "O(|S|ⁿ)" : "O(n)"}
          </span>
        </div>

        <div className="mt-1">
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-indigo-300 tabular-nums">
            {result.executionTimeMs < 0.01
              ? "< 0.010 ms"
              : `${result.executionTimeMs.toFixed(3)} ms`}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>
              {result.algorithm === "matrix" && (
                <span className="text-slate-300">
                  {result.matrixMultiplications} matrix mults
                </span>
              )}
              {result.algorithm === "dfs" && (
                <span className="text-slate-300">
                  {result.recursiveCalls.toLocaleString()} calls
                </span>
              )}
              {result.algorithm === "dp" && (
                <span className="text-slate-300">Table: {result.tableSize} states</span>
              )}
            </span>
            <span className="text-slate-500">
              {result.algorithm === "matrix" ? "Sub-millisecond" : "Evaluated"}
            </span>
          </div>
        </div>
      </div>

      {/* Metric 3: Complexity Class */}
      <div className="pro-card pro-card-interactive p-4 relative group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <div className="flex items-center space-x-1.5">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Complexity Class
            </span>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              algorithm === "matrix"
                ? "bg-emerald-950/60 border-emerald-800/40 text-emerald-400"
                : algorithm === "dfs"
                ? "bg-rose-950/60 border-rose-800/40 text-rose-400"
                : "bg-cyan-950/60 border-cyan-800/40 text-cyan-400"
            }`}
          >
            {algorithm === "matrix"
              ? "POLYNOMIAL / LOG"
              : algorithm === "dfs"
              ? "EXPONENTIAL"
              : "LINEAR"}
          </span>
        </div>

        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
            {algorithm === "matrix" && (
              <span className="text-emerald-400">O(k³ · log n)</span>
            )}
            {algorithm === "dfs" && (
              <span className="text-rose-400">O(|S|ⁿ)</span>
            )}
            {algorithm === "dp" && (
              <span className="text-cyan-400">O(n · |S|)</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>
              {algorithm === "matrix" && `k = ${Math.max(...skipSet)} (order)`}
              {algorithm === "dfs" && `|S| = ${skipSet.length} branching`}
              {algorithm === "dp" && `n = ${depth} iterations`}
            </span>
            <span className="text-slate-500">
              {algorithm === "matrix" ? "Binary Squaring" : "Recursion"}
            </span>
          </div>
        </div>
      </div>

      {/* Metric 4: Dominant Pole & Growth Rate (rho) */}
      <div className="pro-card pro-card-interactive p-4 relative group">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Growth Base (ρ)
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#162032] border border-[#22314D] text-amber-400">
            λ_max
          </span>
        </div>

        <div className="mt-1">
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-300 tabular-nums">
            ρ ≈ {dominantRoot.toFixed(4)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>
              aₙ ∼ C · ({dominantRoot.toFixed(3)})ⁿ
            </span>
            <span className="text-slate-500">Asymptotic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
