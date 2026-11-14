"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Table,
  Network,
  Maximize2,
  HelpCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { samplePaths, countPathsMatrix, getLayerProfiles, LayerProfile } from "@/lib/math-engine";

interface VisualTopologyProps {
  depth: number;
  skipSet: number[];
}

const STEP_STYLES: Record<number, { stroke: string; label: string; textClass: string }> = {
  1: { stroke: "#10B981", label: "+1 (Sequential)", textClass: "text-emerald-400" },
  2: { stroke: "#06B6D4", label: "+2 (Residual)", textClass: "text-cyan-400" },
  3: { stroke: "#6366F1", label: "+3 (Lookahead)", textClass: "text-indigo-400" },
  4: { stroke: "#F59E0B", label: "+4 (Multi-Skip)", textClass: "text-amber-400" },
  5: { stroke: "#F43F5E", label: "+5 (Long Skip)", textClass: "text-rose-400" },
  6: { stroke: "#A855F7", label: "+6 (Extended)", textClass: "text-purple-400" },
  7: { stroke: "#EC4899", label: "+7 (Deep Skip)", textClass: "text-pink-400" },
  8: { stroke: "#3B82F6", label: "+8 (Dilation)", textClass: "text-blue-400" },
};

export const VisualTopology: React.FC<VisualTopologyProps> = ({ depth, skipSet }) => {
  const [viewMode, setViewMode] = useState<"dag" | "table">("dag");
  const maxDisplayLayers = 14;
  const [windowOffset, setWindowOffset] = useState(0);
  const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Animation controller for signal flow
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Reset window offset when depth changes
  useEffect(() => {
    if (windowOffset + maxDisplayLayers > depth + 1) {
      setWindowOffset(Math.max(0, depth - maxDisplayLayers + 1));
    }
  }, [depth, maxDisplayLayers, windowOffset]);

  // Layers visible in current viewport window
  const visibleLayers = useMemo(() => {
    const list: number[] = [];
    const count = Math.min(depth + 1, maxDisplayLayers);
    for (let i = 0; i < count; i++) {
      const layerIdx = windowOffset + i;
      if (layerIdx <= depth) {
        list.push(layerIdx);
      }
    }
    return list;
  }, [depth, windowOffset, maxDisplayLayers]);

  // Sample valid paths for simulation
  const targetForPaths = Math.min(depth, 12);
  const samplePathList = useMemo(() => {
    return samplePaths(targetForPaths, skipSet, 8);
  }, [targetForPaths, skipSet]);

  const activePath = selectedPathIndex !== null ? samplePathList[selectedPathIndex] : null;

  // Signal propagation animation loop
  useEffect(() => {
    if (!isPlaying || !activePath || activePath.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1 >= activePath.length ? 0 : prev + 1));
    }, 700);
    return () => clearInterval(interval);
  }, [isPlaying, activePath]);

  // Precomputed layer profiles
  const layerProfiles: LayerProfile[] = useMemo(() => {
    return getLayerProfiles(Math.min(depth, 50), skipSet);
  }, [depth, skipSet]);

  // Precomputed path counts for visible nodes
  const layerPathCounts = useMemo(() => {
    const map: Record<number, string> = {};
    visibleLayers.forEach((layer) => {
      const res = countPathsMatrix(layer, skipSet);
      map[layer] = res.paths.toString();
    });
    return map;
  }, [visibleLayers, skipSet]);

  // SVG Geometry Layout
  const svgWidth = 960;
  const svgHeight = 290;
  const paddingX = 64;
  const nodeCount = visibleLayers.length;
  const stepX = nodeCount > 1 ? (svgWidth - 2 * paddingX) / (nodeCount - 1) : 0;
  const baselineY = svgHeight - 65;

  const nodePositions = useMemo(() => {
    const pos: Record<number, { x: number; y: number }> = {};
    visibleLayers.forEach((layer, idx) => {
      pos[layer] = {
        x: paddingX + idx * stepX,
        y: baselineY,
      };
    });
    return pos;
  }, [visibleLayers, stepX, baselineY, paddingX]);

  // Edge calculations with Bezier arcs
  const edges = useMemo(() => {
    const list: {
      from: number;
      to: number;
      step: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      arcHeight: number;
      isInPath: boolean;
      isActiveAnimated: boolean;
      isHighlightedByHover: boolean;
    }[] = [];

    visibleLayers.forEach((layer) => {
      skipSet.forEach((step) => {
        const target = layer + step;
        if (nodePositions[layer] && nodePositions[target]) {
          let isInPath = false;
          let isActiveAnimated = false;

          if (activePath) {
            for (let p = 0; p < activePath.length - 1; p++) {
              if (activePath[p] === layer && activePath[p + 1] === target) {
                isInPath = true;
                if (isPlaying && p === currentStepIndex - 1) {
                  isActiveAnimated = true;
                }
                break;
              }
            }
          }

          const isHighlightedByHover =
            hoveredNode !== null && (hoveredNode === layer || hoveredNode === target);

          // Arc elevation scaled by skip distance
          const arcHeight = 32 + step * 24;

          list.push({
            from: layer,
            to: target,
            step,
            x1: nodePositions[layer].x,
            y1: nodePositions[layer].y,
            x2: nodePositions[target].x,
            y2: nodePositions[target].y,
            arcHeight,
            isInPath,
            isActiveAnimated,
            isHighlightedByHover,
          });
        }
      });
    });

    return list;
  }, [visibleLayers, skipSet, nodePositions, activePath, isPlaying, currentStepIndex, hoveredNode]);

  return (
    <div className="pro-card p-5 space-y-5">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#1C273C] gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#111928] border border-[#23324C] text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
              Neural Skip-Connection Topology Explorer
            </h3>
            <p className="text-[11px] text-slate-400">
              Directed Acyclic Graph (DAG) representation of multi-hop forward signals
            </p>
          </div>
        </div>

        {/* View Switcher & Window Navigation */}
        <div className="flex items-center space-x-2">
          {/* View toggle */}
          <div className="flex items-center bg-[#090E17] border border-[#1C273C] p-0.5 rounded-md text-[11px] font-mono">
            <button
              onClick={() => setViewMode("dag")}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === "dag"
                  ? "bg-[#182337] text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              DAG Graph
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-[#182337] text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Layer Table
            </button>
          </div>

          {/* Depth Window Navigation */}
          {depth > maxDisplayLayers && (
            <div className="flex items-center space-x-1 text-[11px] font-mono bg-[#090E17] border border-[#1C273C] px-1.5 py-0.5 rounded-md">
              <button
                onClick={() => setWindowOffset(Math.max(0, windowOffset - 4))}
                disabled={windowOffset === 0}
                className="p-0.5 rounded hover:bg-[#1A2538] disabled:opacity-30 text-slate-300"
                title="Slide left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-400 text-[10px] px-1">
                L{windowOffset}–L{Math.min(depth, windowOffset + maxDisplayLayers - 1)}
              </span>
              <button
                onClick={() =>
                  setWindowOffset(
                    Math.min(depth - maxDisplayLayers + 1, windowOffset + 4)
                  )
                }
                disabled={windowOffset + maxDisplayLayers >= depth + 1}
                className="p-0.5 rounded hover:bg-[#1A2538] disabled:opacity-30 text-slate-300"
                title="Slide right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {viewMode === "dag" ? (
        <>
          {/* SVG Canvas Visualizer */}
          <div className="relative w-full overflow-x-auto bg-[#070B13] rounded-lg border border-[#182337] p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[750px] select-none"
            >
              <defs>
                {/* Arrow markers for each skip step */}
                {skipSet.map((step) => {
                  const style = STEP_STYLES[step] || { stroke: "#38bdf8" };
                  return (
                    <marker
                      key={`arrow-${step}`}
                      id={`arrow-${step}`}
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={style.stroke} />
                    </marker>
                  );
                })}
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Baseline connection rail */}
              <line
                x1={paddingX}
                y1={baselineY}
                x2={svgWidth - paddingX}
                y2={baselineY}
                stroke="#1E293B"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Skip-Connection Arcs */}
              {edges.map((edge, idx) => {
                const style = STEP_STYLES[edge.step] || { stroke: "#38bdf8" };
                const midX = (edge.x1 + edge.x2) / 2;
                const ctrlY = edge.y1 - edge.arcHeight;
                const pathD = `M ${edge.x1} ${edge.y1 - 12} Q ${midX} ${ctrlY} ${edge.x2} ${edge.y2 - 12}`;

                const isHighlighted =
                  edge.isActiveAnimated || edge.isInPath || edge.isHighlightedByHover;

                let strokeColor = style.stroke;
                let strokeWidth = edge.step === 1 ? "1.5" : "1.8";
                let strokeOpacity = "0.45";

                if (edge.isInPath) {
                  strokeColor = "#38BDF8";
                  strokeWidth = "2.8";
                  strokeOpacity = "1.0";
                } else if (edge.isHighlightedByHover) {
                  strokeWidth = "2.2";
                  strokeOpacity = "0.9";
                } else if (activePath) {
                  strokeOpacity = "0.15";
                }

                return (
                  <g key={`edge-${idx}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      markerEnd={
                        edge.isInPath
                          ? "url(#arrow-active)"
                          : `url(#arrow-${edge.step})`
                      }
                      className="transition-all duration-200"
                    />
                    {/* Step label on arc summit */}
                    {edge.x2 - edge.x1 > 70 && (
                      <text
                        x={midX}
                        y={ctrlY + 12}
                        fill={strokeColor}
                        fontSize="8.5"
                        fontFamily="monospace"
                        textAnchor="middle"
                        opacity={isHighlighted ? 1 : 0.5}
                      >
                        +{edge.step}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Layer Nodes */}
              {visibleLayers.map((layer) => {
                const pos = nodePositions[layer];
                if (!pos) return null;
                const isHovered = hoveredNode === layer;
                const isInput = layer === 0;
                const isTarget = layer === depth;
                const isInActivePath = activePath ? activePath.includes(layer) : false;
                const isCurrentAnimatedNode =
                  isPlaying && activePath && activePath[currentStepIndex] === layer;

                return (
                  <g
                    key={`node-${layer}`}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onMouseEnter={() => setHoveredNode(layer)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    {/* Halo on active / hover */}
                    {(isHovered || isCurrentAnimatedNode) && (
                      <circle
                        r="20"
                        fill="rgba(56, 189, 248, 0.15)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Core Layer Node Circle */}
                    <circle
                      r="13"
                      fill={
                        isInput
                          ? "#065F46"
                          : isTarget
                          ? "#3730A3"
                          : isInActivePath
                          ? "#0C4A6E"
                          : "#0F172A"
                      }
                      stroke={
                        isInput
                          ? "#10B981"
                          : isTarget
                          ? "#6366F1"
                          : isInActivePath
                          ? "#38BDF8"
                          : "#23324C"
                      }
                      strokeWidth={isHovered || isInActivePath ? "2" : "1.5"}
                    />

                    {/* Layer Index */}
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {layer}
                    </text>

                    {/* Layer Descriptor Tag */}
                    <text
                      y="24"
                      textAnchor="middle"
                      fill={isInput ? "#10B981" : isTarget ? "#818CF8" : "#64748B"}
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      {isInput ? "Input (L₀)" : isTarget ? "Output (Lₙ)" : `L${layer}`}
                    </text>

                    {/* Reachable path count */}
                    <text
                      y="35"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      a={layerPathCounts[layer] ?? "0"}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Node Tooltip Card */}
            {hoveredNode !== null && (
              <div className="absolute top-3 left-3 bg-[#0B101A]/95 border border-[#23324C] rounded-lg p-3 text-xs font-mono shadow-xl z-20 backdrop-blur-md">
                <div className="flex items-center space-x-2 text-white font-bold">
                  <span>Layer L{hoveredNode}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#162235] text-cyan-400">
                    {hoveredNode === 0
                      ? "Boundary Base State"
                      : hoveredNode === depth
                      ? "Final Classifier / Head"
                      : "Intermediate Residual Block"}
                  </span>
                </div>
                <div className="text-slate-300 mt-1">
                  Reachable Paths (a_{hoveredNode}):{" "}
                  <span className="text-emerald-400 font-bold">
                    {layerPathCounts[hoveredNode] || "0"}
                  </span>
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5">
                  Recurrence terms:{" "}
                  {skipSet
                    .filter((s) => hoveredNode - s >= 0)
                    .map((s) => `a_{${hoveredNode - s}}`)
                    .join(" + ") || "Base Case (1)"}
                </div>
              </div>
            )}
          </div>

          {/* Skip-Step Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1C273C] text-[11px] font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500">Arc Legend:</span>
              {skipSet.map((step) => {
                const style = STEP_STYLES[step] || { stroke: "#38bdf8", textClass: "text-sky-400" };
                return (
                  <div key={step} className="flex items-center space-x-1">
                    <span
                      className="w-2.5 h-1 rounded-full inline-block"
                      style={{ backgroundColor: style.stroke }}
                    />
                    <span className={style.textClass}>
                      +{step} {step === 1 ? "sequential" : "shortcut"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-slate-500">
              Viewing {visibleLayers.length} of {depth + 1} layers
            </div>
          </div>

          {/* Interactive Path Trajectory Simulator */}
          {samplePathList.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[#090E17] border border-[#1C273C] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Path Routing Simulator (Target Depth n = {targetForPaths})
                  </span>
                </div>

                {/* Animation controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      if (!isPlaying) setCurrentStepIndex(0);
                      setIsPlaying(!isPlaying);
                    }}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors border ${
                      isPlaying
                        ? "bg-amber-950/70 border-amber-800 text-amber-300"
                        : "bg-[#141E2F] border-[#22314D] text-slate-200 hover:text-white"
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlaying ? "Pause Flow" : "Animate Signal"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(0);
                    }}
                    className="p-1 rounded bg-[#141E2F] border border-[#22314D] text-slate-400 hover:text-white"
                    title="Reset animation"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sample path selection pills */}
              <div className="flex flex-wrap gap-1.5">
                {samplePathList.map((path, idx) => {
                  const isSelected = selectedPathIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPathIndex(isSelected ? null : idx);
                        setCurrentStepIndex(0);
                      }}
                      className={`px-2 py-1 rounded text-xs font-mono transition-all border ${
                        isSelected
                          ? "bg-[#112433] border-cyan-400 text-cyan-200 font-semibold"
                          : "bg-[#0B101A] border-[#1C273C] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-slate-500 mr-1">#{idx + 1}:</span>
                      {path.join(" → ")}
                    </button>
                  );
                })}
              </div>

              {/* Active path readout */}
              {activePath && (
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-[#0B1421] p-2 rounded border border-[#16273E]">
                  <div>
                    Active Path:{" "}
                    <span className="text-white font-bold">
                      {activePath
                        .map((layer, idx) =>
                          idx === 0 ? `L${layer}` : `(+${layer - activePath[idx - 1]}) → L${layer}`
                        )
                        .join(" ")}
                    </span>
                  </div>
                  {selectedPathIndex !== null && (
                    <button
                      onClick={() => setSelectedPathIndex(null)}
                      className="text-slate-500 hover:text-slate-300 underline text-[10px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Layer Profile Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border border-[#1C273C] rounded-lg">
            <thead className="bg-[#090E17] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1C273C]">
              <tr>
                <th className="py-2 px-3">Layer (Lᵢ)</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Reachable Paths (aᵢ)</th>
                <th className="py-2 px-3">In-Degree</th>
                <th className="py-2 px-3">Incoming Skip Connections</th>
                <th className="py-2 px-3">Outgoing Skips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182337] bg-[#070B13] text-slate-300">
              {layerProfiles.slice(0, Math.min(depth + 1, 25)).map((profile) => (
                <tr key={profile.layer} className="hover:bg-[#0E1523]">
                  <td className="py-2 px-3 font-bold text-white">L{profile.layer}</td>
                  <td className="py-2 px-3">
                    {profile.layer === 0 ? (
                      <span className="text-emerald-400">Input Layer</span>
                    ) : profile.layer === depth ? (
                      <span className="text-indigo-400">Target Output</span>
                    ) : (
                      <span className="text-slate-400">Residual Block</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-semibold text-cyan-300">
                    {profile.pathsToLayer.toString()}
                  </td>
                  <td className="py-2 px-3 text-slate-400">{profile.inDegree}</td>
                  <td className="py-2 px-3 text-slate-400">
                    {profile.incomingFrom.length > 0
                      ? profile.incomingFrom.map((l) => `L${l}`).join(", ")
                      : "None (Base)"}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {profile.outgoingTo.map((l) => `L${l}`).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {depth > 24 && (
            <div className="text-[10px] font-mono text-slate-500 text-center py-2">
              Showing first 25 layers of {depth + 1} total layers.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
