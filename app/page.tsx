"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ControlPanel } from "@/components/ControlPanel";
import { TelemetryCards } from "@/components/TelemetryCards";
import { MathBreakdown } from "@/components/MathBreakdown";
import { VisualTopology } from "@/components/VisualTopology";
import { BenchmarkSuite } from "@/components/BenchmarkSuite";
import { TheoryModal } from "@/components/TheoryModal";
import {
  countPathsMatrix,
  countPathsDFS,
  countPathsDP,
  CalculationResult,
} from "@/lib/math-engine";
import { AlgorithmType, PRESETS } from "@/lib/types";
import { Terminal, ShieldCheck, Activity } from "lucide-react";

export default function Home() {
  const [depth, setDepth] = useState<number>(34);
  const [skipSet, setSkipSet] = useState<number[]>([1, 2]);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("matrix");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Core execution trigger
  const runCalculation = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      let res: CalculationResult;
      if (algorithm === "matrix") {
        res = countPathsMatrix(depth, skipSet);
      } else if (algorithm === "dfs") {
        res = countPathsDFS(depth, skipSet, 15_000_000, 2200);
      } else {
        res = countPathsDP(depth, skipSet);
      }
      setResult(res);
      setIsCalculating(false);
    }, 10);
  }, [depth, skipSet, algorithm]);

  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  const handleResetDefaults = () => {
    setDepth(34);
    setSkipSet([1, 2]);
    setAlgorithm("matrix");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080C14]">
      {/* Precision grid pattern background */}
      <div className="fixed inset-0 pointer-events-none workspace-grid z-0" />
      <div className="fixed inset-0 pointer-events-none workspace-radial z-0" />

      {/* Top Application Bar */}
      <Header
        onOpenTheoryModal={() => setIsTheoryOpen(true)}
        onResetDefaults={handleResetDefaults}
        currentDepth={depth}
        skipSet={skipSet}
      />

      {/* Main Engineering Dashboard */}
      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Top Telemetry KPI Bar */}
        <section aria-label="System Telemetry">
          <TelemetryCards
            result={result}
            depth={depth}
            skipSet={skipSet}
            algorithm={algorithm}
          />
        </section>

        {/* Primary Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Parameter Configuration Deck (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            <ControlPanel
              depth={depth}
              setDepth={setDepth}
              skipSet={skipSet}
              setSkipSet={setSkipSet}
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              onRunCalculation={runCalculation}
              isCalculating={isCalculating}
            />

            {/* Diagnostic Console Card */}
            <div className="pro-card p-3.5 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-[#1C273C] pb-2">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Engine State Diagnostics
                </span>
                <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>ONLINE</span>
                </span>
              </div>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recurrence Order (k):</span>
                  <span className="text-white font-semibold">{Math.max(...skipSet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Companion Matrix Size:</span>
                  <span className="text-white font-semibold">
                    {Math.max(...skipSet)} × {Math.max(...skipSet)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Floating-Point Drift:</span>
                  <span className="text-emerald-400 font-semibold">0.00% (Arbitrary BigInt)</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Visualizer & Mathematical Specs (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Visual Topology Explorer */}
            <section aria-label="Topology Visualizer">
              <VisualTopology depth={depth} skipSet={skipSet} />
            </section>

            {/* Mathematical Spec & Companion Matrix Inspector */}
            <section aria-label="Mathematical Model Spec">
              <MathBreakdown skipSet={skipSet} depth={depth} />
            </section>
          </div>
        </div>

        {/* Full-Width Benchmark Suite */}
        <section aria-label="Comparative Benchmark Suite">
          <BenchmarkSuite skipSet={skipSet} />
        </section>
      </main>

      {/* Lab Footer */}
      <footer className="border-t border-[#1C273C] bg-[#0A0E17] py-4 text-xs font-mono text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">CombinatorX</span>
            <span>•</span>
            <span>Discrete Mathematics & Graph Theory (DMGT) Laboratory</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Companion Matrix Exponentiation • Analytic Combinatorics • ResNet / Transformer Routing
          </div>
        </div>
      </footer>

      {/* Theoretical Reference Documentation Modal */}
      <TheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />
    </div>
  );
}
