"use client";

import React, { useState } from "react";
import {
  Sigma,
  Hash,
  Sparkles,
  Layers,
  Cpu,
  BookOpen,
  HelpCircle,
  Code,
  ArrowRight,
} from "lucide-react";
import { formatOGF, buildCompanionMatrix, computeDominantRoot } from "@/lib/math-engine";

interface MathBreakdownProps {
  skipSet: number[];
  depth: number;
}

export const MathBreakdown: React.FC<MathBreakdownProps> = ({ skipSet, depth }) => {
  const [activeTab, setActiveTab] = useState<"matrix" | "ogf" | "recurrence" | "deeplearning">("matrix");
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: bigint } | null>(null);

  const ogfInfo = formatOGF(skipSet);
  const { matrix, dim } = buildCompanionMatrix(skipSet);
  const dominantRoot = computeDominantRoot(skipSet);

  return (
    <div className="pro-card p-5 space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#1C273C] gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#111928] border border-[#23324C] text-indigo-400">
            <Sigma className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
              Discrete Mathematics & Graph Theory (DMGT) Spec
            </h3>
            <p className="text-[11px] text-slate-400">
              Rigorous algebraic formulation and characteristic polynomial decomposition
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#090E17] border border-[#1C273C] p-0.5 rounded-md text-[11px] font-mono">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "matrix"
                ? "bg-[#182337] text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Companion Matrix M
          </button>
          <button
            onClick={() => setActiveTab("ogf")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "ogf"
                ? "bg-[#182337] text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            OGF A(x)
          </button>
          <button
            onClick={() => setActiveTab("recurrence")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "recurrence"
                ? "bg-[#182337] text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Recurrence
          </button>
          <button
            onClick={() => setActiveTab("deeplearning")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "deeplearning"
                ? "bg-[#182337] text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            AI Architecture
          </button>
        </div>
      </div>

      {/* Tab 1: Companion Matrix (Interactive Inspector) */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-start gap-6 p-4 rounded-lg bg-[#070B13] border border-[#182337]">
            {/* Interactive Grid Matrix */}
            <div className="flex flex-col items-center mx-auto lg:mx-0">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-semibold">
                  Companion Matrix M ({dim} × {dim})
                </span>
                <span className="text-[9px] font-mono text-slate-500">Hover cell to inspect</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 font-mono text-xs bg-[#090E17] border border-[#1F2C44] p-3 rounded-lg shadow-inner">
                <span className="text-3xl text-slate-500 font-light select-none">[</span>
                <div className="grid gap-1">
                  {matrix.slice(0, Math.min(dim, 7)).map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1.5 justify-center">
                      {row.slice(0, Math.min(dim, 7)).map((cell, cIdx) => {
                        const isHovered =
                          hoveredCell?.r === rIdx && hoveredCell?.c === cIdx;
                        const isOne = cell === 1n;
                        return (
                          <div
                            key={cIdx}
                            onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx, val: cell })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-7 h-7 flex items-center justify-center rounded cursor-pointer transition-all text-xs font-mono font-bold ${
                              isHovered
                                ? "bg-emerald-400 text-slate-950 scale-110 shadow-md"
                                : isOne
                                ? rIdx === 0
                                  ? "bg-[#064E3B] border border-emerald-500/60 text-emerald-300"
                                  : "bg-[#1E1B4B] border border-indigo-500/60 text-indigo-300"
                                : "bg-[#0C121D] text-slate-600 border border-[#151F30]"
                            }`}
                          >
                            {cell.toString()}
                          </div>
                        );
                      })}
                      {dim > 7 && <span className="text-slate-500 self-center">…</span>}
                    </div>
                  ))}
                  {dim > 7 && <div className="text-slate-500 text-center">⋮</div>}
                </div>
                <span className="text-3xl text-slate-500 font-light select-none">]</span>
              </div>
            </div>

            {/* Matrix Logic & Hover Explanation */}
            <div className="flex-1 space-y-3 font-mono text-xs text-slate-300">
              <div className="text-white font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>State Transition Equation</span>
              </div>

              <div className="p-2.5 rounded bg-[#090E17] border border-[#182337] text-slate-300 text-[11px] leading-relaxed">
                <span className="text-indigo-400">vₙ</span> = [aₙ, aₙ₋₁, ..., aₙ₋ₖ₊₁]ᵀ = <span className="text-emerald-400">Mⁿ</span> · [1, 0, ..., 0]ᵀ
              </div>

              {/* Dynamic Cell Inspector Tooltip */}
              <div className="p-3 rounded-md bg-[#0D1524] border border-[#22324E] text-[11px]">
                {hoveredCell ? (
                  <div>
                    <div className="text-white font-semibold">
                      Inspecting Entry M[{hoveredCell.r}][{hoveredCell.c}] = {hoveredCell.val.toString()}:
                    </div>
                    <div className="text-slate-400 mt-1">
                      {hoveredCell.r === 0 ? (
                        hoveredCell.val === 1n ? (
                          <span className="text-emerald-300">
                            Row 0, Col {hoveredCell.c}: Forward hop size s = {hoveredCell.c + 1} is in skip set S. This weights the incoming path count from layer n - {hoveredCell.c + 1}.
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Row 0, Col {hoveredCell.c}: Hop size s = {hoveredCell.c + 1} is NOT in skip set S (transition blocked).
                          </span>
                        )
                      ) : hoveredCell.c === hoveredCell.r - 1 ? (
                        <span className="text-indigo-300">
                          Row {hoveredCell.r}, Col {hoveredCell.c}: Shift register entry. Maps previous state a_(t-{hoveredCell.c}) down to a_(t-{hoveredCell.r}).
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Inactive coordinate in companion matrix canonical form.
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 italic">
                    Hover over any cell in matrix M above to inspect its exact recurrence meaning and routing weight.
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By binary repeated squaring, evaluating depth <strong className="text-white">n = {depth}</strong> requires only <span className="text-emerald-400 font-bold">{Math.floor(Math.log2(depth || 1)) + 2}</span> matrix multiplications. Total paths a_{depth} is read directly from <span className="text-emerald-400">Mⁿ[0][0]</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ordinary Generating Function (OGF) */}
      {activeTab === "ogf" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#070B13] border border-[#182337] space-y-2 font-mono">
            <span className="text-[10px] uppercase text-indigo-400 tracking-wider font-semibold">
              Closed-Form Rational Generating Function
            </span>
            <div className="text-lg sm:text-xl font-bold text-white tracking-wide">
              {ogfInfo.rationalExpression}
            </div>
            <div className="text-xs text-slate-400 border-t border-[#182337] pt-2">
              Denominator polynomial: <span className="text-emerald-400 font-semibold">{ogfInfo.denominatorFormula}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-[#090E17] border border-[#182337] space-y-1.5">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Geometric Composition Law
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The sequence of allowed forward steps forms the atomic polynomial <span className="text-cyan-300">S(x) = ∑_{"{s∈S}"} xˢ</span>.
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Any valid routing topology is a composition of paths of length m ≥ 0. Summing all compositions yields the geometric series:
              </p>
              <div className="text-emerald-300 text-[11px] bg-[#070B13] p-1.5 rounded">
                A(x) = 1 + S(x) + S(x)² + ... = 1 / (1 - S(x))
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#090E17] border border-[#182337] space-y-1.5">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                Singularity & Asymptotic Dominance
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The poles of A(x) determine the asymptotic growth of the coefficients aₙ:
              </p>
              <div className="text-amber-300 text-[11px] bg-[#070B13] p-1.5 rounded">
                1 - ∑_{"{s∈S}"} xˢ = 0 &nbsp;⟹&nbsp; x₀ ≈ {(1 / dominantRoot).toFixed(5)}
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The dominant pole x₀ yields growth base <span className="text-white font-bold">ρ = 1/x₀ ≈ {dominantRoot.toFixed(4)}</span>, so <span className="text-emerald-300 font-semibold">aₙ ∼ C · ({dominantRoot.toFixed(3)})ⁿ</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Recurrence Relation */}
      {activeTab === "recurrence" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#070B13] border border-[#182337] font-mono space-y-2">
            <span className="text-[10px] uppercase text-cyan-400 tracking-wider font-semibold">
              Homogeneous Linear Recurrence Equation
            </span>
            <div className="text-base sm:text-lg font-bold text-white">
              aₙ = {skipSet.map((s) => `a_{n-${s}}`).join(" + ")}
            </div>
            <div className="text-xs text-slate-400 border-t border-[#182337] pt-2">
              Boundary initial conditions: <span className="text-emerald-400">a₀ = 1</span>, and <span className="text-rose-400">a_{"{< 0}"} = 0</span>.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-[#090E17] border border-[#182337] space-y-1.5">
              <span className="text-white font-bold">Combinatorial Partition</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Every valid pathway to layer n terminates with exactly one final skip hop s ∈ S originating from layer n - s.
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Because these final hop classes are mutually exclusive and exhaustive, the total count aₙ is the sum of reachable topologies to each predecessor.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#090E17] border border-[#182337] space-y-1.5">
              <span className="text-white font-bold">Characteristic Polynomial</span>
              <div className="text-cyan-300 text-[11px] bg-[#070B13] p-1.5 rounded">
                {ogfInfo.characteristicPolynomial}
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                By Binet&apos;s generalized theorem, aₙ has the exact closed-form solution:
                <span className="block text-white mt-1">aₙ = ∑_{"{i=1}"}^k cᵢ · (λᵢ)ⁿ</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Deep Learning Architecture Mapping */}
      {activeTab === "deeplearning" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#070B13] border border-[#182337] space-y-2">
            <div className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Direct Mapping to Modern Deep Neural Networks
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Skip connections revolutionized deep learning by transforming sequential computation pipelines into multi-scale path ensembles. This discrete math engine models the exact combinatorial capacity of those topologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#090E17] border border-[#182337] space-y-1">
              <span className="text-emerald-400 font-bold">ResNet-50 / 152</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Standard residual blocks (S = [1, 2]) yield the Fibonacci recurrence. A 50-layer ResNet implicitly forms over <strong className="text-white">20 billion</strong> gradient routing pathways, behaving like an ensemble of shallow networks (Veit et al., 2016).
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#090E17] border border-[#182337] space-y-1">
              <span className="text-cyan-400 font-bold">DenseNet Connectivity</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Multi-skip routing (S = [1, 2, 3, 4]) enables direct gradient shortcuts across 4 layers simultaneously, minimizing feature vanishing and enabling direct feature reuse across layers.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#090E17] border border-[#182337] space-y-1">
              <span className="text-indigo-400 font-bold">Transformer Streams</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                In modern LLMs (GPT-4, Gemini), attention heads and MLP layers read and write directly to an underlying residual stream, matching the combinatorial composition graph solved by this engine.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
