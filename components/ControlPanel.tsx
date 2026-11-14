"use client";

import React, { useState } from "react";
import {
  Sliders,
  Layers,
  Play,
  AlertTriangle,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Gauge,
  Cpu,
  ChevronRight,
  Info,
} from "lucide-react";
import { AlgorithmType, PRESETS, PresetConfig } from "@/lib/types";

interface ControlPanelProps {
  depth: number;
  setDepth: (depth: number) => void;
  skipSet: number[];
  setSkipSet: (skipSet: number[]) => void;
  algorithm: AlgorithmType;
  setAlgorithm: (alg: AlgorithmType) => void;
  onRunCalculation?: () => void;
  isCalculating?: boolean;
}

const COMMON_STEPS = [1, 2, 3, 4, 5, 6, 8];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  depth,
  setDepth,
  skipSet,
  setSkipSet,
  algorithm,
  setAlgorithm,
}) => {
  const [customStepInput, setCustomStepInput] = useState("");
  const [customDepthInput, setCustomDepthInput] = useState(depth.toString());

  const handleStepToggle = (step: number) => {
    let next: number[];
    if (skipSet.includes(step)) {
      if (skipSet.length === 1) return; // Prevent empty set
      next = skipSet.filter((s) => s !== step);
    } else {
      next = [...skipSet, step].sort((a, b) => a - b);
    }
    setSkipSet(next);
  };

  const handleAddCustomStep = () => {
    const parsed = parseInt(customStepInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50 && !skipSet.includes(parsed)) {
      const next = [...skipSet, parsed].sort((a, b) => a - b);
      setSkipSet(next);
      setCustomStepInput("");
    }
  };

  const applyPreset = (preset: PresetConfig) => {
    setSkipSet(preset.skipSet);
    setDepth(preset.depth);
    setCustomDepthInput(preset.depth.toString());
    if (preset.depth > 32 && algorithm === "dfs") {
      setAlgorithm("matrix");
    }
  };

  const isDfsDangerous = algorithm === "dfs" && depth > 28;

  return (
    <div className="pro-card p-5 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1C273C] pb-3.5">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
            Parameter Configuration Deck
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
          Reactive Engine
        </span>
      </div>

      {/* Preset Architectures Deck */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Neural Architecture Presets
          </label>
          <span className="text-[10px] text-slate-500 font-mono">Real-world AI models</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {PRESETS.map((preset) => {
            const isActive =
              depth === preset.depth &&
              skipSet.length === preset.skipSet.length &&
              preset.skipSet.every((s) => skipSet.includes(s));
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`text-left p-2.5 rounded-lg border transition-all ${
                  isActive
                    ? "bg-[#162035] border-indigo-500/70 text-indigo-200 shadow-sm"
                    : "bg-[#0B101A] border-[#1C273C] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-white truncate">
                    {preset.name}
                  </span>
                  <span className="text-[9px] font-mono px-1 rounded bg-[#101726] border border-[#22314D] text-indigo-300">
                    {preset.tag}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>S = [{preset.skipSet.join(",")}]</span>
                  <span className="text-slate-500">n = {preset.depth}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Depth Slider & Direct Input */}
      <div className="space-y-3 pt-1 border-t border-[#1C273C]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Network Depth <span className="font-mono text-emerald-400 lowercase">(n)</span>
          </label>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                const next = Math.max(1, depth - 5);
                setDepth(next);
                setCustomDepthInput(next.toString());
              }}
              className="px-1.5 py-0.5 text-[10px] font-mono bg-[#111928] border border-[#23324C] rounded text-slate-300 hover:text-white"
            >
              -5
            </button>
            <input
              type="number"
              min={1}
              max={50000}
              value={customDepthInput}
              onChange={(e) => {
                setCustomDepthInput(e.target.value);
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= 50000) {
                  setDepth(val);
                }
              }}
              className="w-20 px-2 py-1 text-right text-xs font-mono font-bold bg-[#090E17] border border-[#23324C] rounded text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                const next = Math.min(50000, depth + 5);
                setDepth(next);
                setCustomDepthInput(next.toString());
              }}
              className="px-1.5 py-0.5 text-[10px] font-mono bg-[#111928] border border-[#23324C] rounded text-slate-300 hover:text-white"
            >
              +5
            </button>
            <span className="text-xs text-slate-500 font-mono">layers</span>
          </div>
        </div>

        {/* Range slider for depths 1 to 100 */}
        <input
          type="range"
          min={1}
          max={100}
          value={Math.min(depth, 100)}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setDepth(val);
            setCustomDepthInput(val.toString());
          }}
          className="w-full h-1.5 bg-[#162032] rounded appearance-none cursor-pointer accent-emerald-500"
        />

        {/* Quick jump depth buttons */}
        <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
          <span className="text-slate-500">Scale presets:</span>
          <div className="flex gap-1">
            {[18, 34, 50, 101, 500, 1000, 10000].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDepth(d);
                  setCustomDepthInput(d.toString());
                  if (d > 32 && algorithm === "dfs") {
                    setAlgorithm("matrix");
                  }
                }}
                className={`px-1.5 py-0.5 rounded border transition-colors ${
                  depth === d
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-[#0B101A] border-[#1C273C] text-slate-400 hover:text-slate-200"
                }`}
              >
                {d >= 1000 ? `${d / 1000}k` : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Allowed Skip Steps (S) */}
      <div className="space-y-2.5 pt-1 border-t border-[#1C273C]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            Allowed Skip Sizes <span className="font-mono text-cyan-400">(S)</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            S = [{skipSet.join(", ")}]
          </span>
        </div>

        {/* Common Step Pills */}
        <div className="flex flex-wrap gap-1.5">
          {COMMON_STEPS.map((step) => {
            const isChecked = skipSet.includes(step);
            return (
              <button
                key={step}
                type="button"
                onClick={() => handleStepToggle(step)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-mono transition-all ${
                  isChecked
                    ? "bg-[#112433] border-cyan-500/70 text-cyan-300 font-semibold"
                    : "bg-[#0B101A] border-[#1C273C] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded flex items-center justify-center border text-[8px] ${
                    isChecked
                      ? "bg-cyan-500 border-cyan-400 text-slate-950"
                      : "border-slate-600 bg-slate-900"
                  }`}
                >
                  {isChecked && <Check className="w-2 h-2 stroke-[3]" />}
                </div>
                <span>+{step}</span>
              </button>
            );
          })}
        </div>

        {/* Add custom step input */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="number"
            min={1}
            max={30}
            placeholder="Custom skip step..."
            value={customStepInput}
            onChange={(e) => setCustomStepInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomStep()}
            className="flex-1 px-2.5 py-1 text-xs font-mono bg-[#090E17] border border-[#1C273C] rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAddCustomStep}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded bg-[#131B2A] hover:bg-[#1A2538] text-slate-200 border border-[#23324C]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Solver Engine Selection */}
      <div className="space-y-2.5 pt-1 border-t border-[#1C273C]">
        <label className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          Mathematical Solver Engine
        </label>

        <div className="grid grid-cols-1 gap-2">
          {/* Matrix Exponentiation Engine */}
          <button
            type="button"
            onClick={() => setAlgorithm("matrix")}
            className={`p-3 rounded-lg border text-left transition-all ${
              algorithm === "matrix"
                ? "bg-[#101D24] border-emerald-500/80 text-emerald-100"
                : "bg-[#0B101A] border-[#1C273C] text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                OGF Companion Matrix Exponentiation
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 font-bold">
                O(k³ log n)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Companion state matrix repeated binary squaring. Exact BigInt precision for arbitrary depths ($n = 10,000+$).
            </p>
          </button>

          {/* Dynamic Programming */}
          <button
            type="button"
            onClick={() => setAlgorithm("dp")}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              algorithm === "dp"
                ? "bg-[#0E1E2C] border-cyan-500/80 text-cyan-100"
                : "bg-[#0B101A] border-[#1C273C] text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                Linear Dynamic Programming (DP)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 font-bold">
                O(n · |S|)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Iterative state array memoization. High-speed verification baseline.
            </p>
          </button>

          {/* Naive DFS */}
          <button
            type="button"
            onClick={() => setAlgorithm("dfs")}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              algorithm === "dfs"
                ? "bg-[#25121B] border-rose-500/80 text-rose-100"
                : "bg-[#0B101A] border-[#1C273C] text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                Naive DFS Brute-Force Tree
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/70 border border-rose-800/50 text-rose-400 font-bold">
                O(|S|ⁿ)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Unmemoized recursive decision branching. Demonstrates explosive combinatorial growth.
            </p>
          </button>
        </div>

        {/* Warning Banner for DFS */}
        {isDfsDangerous && (
          <div className="flex items-start space-x-2 p-2.5 rounded-md bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="font-bold">Combinatorial Tree Warning:</span> At depth n={depth} with |S|={skipSet.length}, DFS branches ~{Math.pow(skipSet.length, depth).toExponential(1)} times. Safely capped at 2.5s or 20M calls.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
