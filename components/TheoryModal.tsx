"use client";

import React from "react";
import { X, BookOpen, Sigma, Network, Cpu, ArrowRight } from "lucide-react";

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Theoretical Foundations: DMGT in Neural Skip Connections
              </h2>
              <p className="text-xs text-slate-400">
                Ordinary Generating Functions, Companion Matrices & Combinatorial Graph Ensembles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sigma className="w-4 h-4" />
            1. Combinatorial Routing Problem
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consider a feedforward neural network comprising layers indexed <code className="text-emerald-300 font-mono">0, 1, 2, ..., n</code>. Suppose activations can propagate forward through allowed step distances <code className="text-emerald-300 font-mono">S = {"{s₁, s₂, ..., sₖ}"}</code>. A valid routing topology is a composition of integer hops <code className="text-slate-200 font-mono">h₁ + h₂ + ... + h_m = n</code> where each <code className="text-cyan-300 font-mono">h_j ∈ S</code>.
          </p>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300">
            Recurrence: aₙ = ∑_{"{s ∈ S}"} a_{"{n - s}"}, &nbsp;&nbsp; with boundary a₀ = 1, a_{"{k < 0}"} = 0
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Network className="w-4 h-4" />
            2. Rational Ordinary Generating Function (OGF)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multiplying each recurrence term by <code className="text-indigo-300 font-mono">xⁿ</code> and summing over <code className="text-indigo-300 font-mono">n ≥ 1</code> transforms discrete compositions into an algebraic geometric series:
          </p>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
            A(x) = ∑_{"{n=0}"}^∞ aₙ xⁿ = 1 + ∑_{"{s ∈ S}"} xˢ A(x) &nbsp;⟹&nbsp; A(x) = 1 / (1 - ∑_{"{s ∈ S}"} xˢ)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            By finding the roots of the denominator polynomial (the characteristic equation), the dominant singularity governs the asymptotic rate <code className="text-amber-300 font-mono">aₙ ∼ C · ρⁿ</code>.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            3. O(k³ log n) Companion Matrix Exponentiation
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            While recursive tree search takes <code className="text-rose-400 font-mono">O(|S|ⁿ)</code> time and dynamic programming takes <code className="text-cyan-400 font-mono">O(n · |S|)</code> time, matrix exponentiation maps the state vector:
          </p>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
            vₙ = [aₙ, aₙ₋₁, ..., aₙ₋ₖ₊₁]ᵀ = Mⁿ · [1, 0, ..., 0]ᵀ
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Using binary repeated squaring, <code className="text-emerald-400 font-mono">Mⁿ</code> is evaluated in only <code className="text-emerald-400 font-mono">O(k³ · log n)</code> matrix operations. For depths like <code className="text-white font-mono">n = 10,000</code>, this executes in &lt;0.05 milliseconds using arbitrary-precision BigInt arithmetic.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors"
          >
            Close Theory Reference
          </button>
        </div>
      </div>
    </div>
  );
};

