"use client";

import React from "react";
import { GitBranch, BookOpen, Layers, Terminal, Sparkles, RefreshCw } from "lucide-react";

interface HeaderProps {
  onOpenTheoryModal: () => void;
  onResetDefaults?: () => void;
  currentDepth: number;
  skipSet: number[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTheoryModal,
  onResetDefaults,
  currentDepth,
  skipSet,
}) => {
  return (
    <header className="border-b border-[#1A2538] bg-[#0A0E17]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Context */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111928] border border-[#23324C] flex items-center justify-center text-emerald-400">
              <GitBranch className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-white font-mono">
                  Combinator<span className="text-emerald-400">X</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#162032] border border-[#22314D] text-slate-300">
                  v2.5.0
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-medium">
                  DMGT Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Neural Skip-Connection Topology Engine • Ordinary Generating Functions (OGFs) & Companion Matrix
              </p>
            </div>
          </div>
        </div>

        {/* Live System Diagnostics & Actions */}
        <div className="flex items-center space-x-3">
          {/* Active parameters pill */}
          <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono bg-[#0D1421] border border-[#1C273C] px-2.5 py-1 rounded-md text-slate-300">
            <span className="text-slate-500">Params:</span>
            <span className="text-emerald-400 font-semibold">n={currentDepth}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">S=[{skipSet.join(",")}]</span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-400">dim={Math.max(...skipSet)}</span>
          </div>

          {/* Theory Reference Button */}
          <button
            onClick={onOpenTheoryModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-[#131B2A] border border-[#23324C] text-slate-200 hover:text-white hover:border-slate-600 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Theory & Math Spec</span>
            <span className="sm:hidden">Spec</span>
          </button>

          {/* Reset Defaults Button */}
          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              title="Reset to ResNet-34 Standard (S=[1,2], n=34)"
              className="p-1.5 rounded-md bg-[#131B2A] border border-[#23324C] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
