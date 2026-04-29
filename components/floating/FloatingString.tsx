/**
 * @file components/floating/FloatingString.tsx
 * @description Floating 单条字符串组件，负责渲染、拖拽缩放与双击快速配置。
 */
"use client";

import React, { useEffect, useRef, useState } from "react";
import FloatingNode from "./FloatingNode";
import { FloatingGroupConfig } from "../../config/floating.config";

interface FloatingStringProps {
  group: FloatingGroupConfig;
  updateGroup: (id: string, updates: Partial<FloatingGroupConfig>) => void;
  onCopy?: () => void;
  onRemove?: () => void;
  isInlineEditing: boolean;
  setInlineEditing: (state: boolean) => void;
}

type ColorEntry = [string, number[]];

const PRESET_COLORS = ["#94d3e2", "#fcef7a", "#ffffff", "#ff8d8d", "#9bf2b1"];

const parseDistributionInput = (value: string) =>
  value
    .split(",")
    .map((item) => Number.parseFloat(item.trim()))
    .filter((item) => Number.isFinite(item));

const parseNodeIndexes = (value: string) =>
  value
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isInteger(item) && item > 0);

const formatFloatingText = (format: string, now: Date) => {
  const tokens: Record<string, string> = {
    yyyy: String(now.getFullYear()),
    MM: String(now.getMonth() + 1).padStart(2, "0"),
    dd: String(now.getDate()).padStart(2, "0"),
    HH: String(now.getHours()).padStart(2, "0"),
    hh: String(now.getHours()).padStart(2, "0"),
    mm: String(now.getMinutes()).padStart(2, "0"),
    ss: String(now.getSeconds()).padStart(2, "0"),
  };

  const withTemplateTokens = format.replace(/\$\{(yyyy|MM|dd|HH|hh|mm|ss)\}/g, (_, token: string) => tokens[token] ?? "");
  return withTemplateTokens.replace(/yyyy|MM|dd|HH|hh|mm|ss/g, (token) => tokens[token] ?? token);
};

const getColorEntries = (group: FloatingGroupConfig): ColorEntry[] => {
  const entries = Object.entries(group.colors || {});
  if (entries.length > 0) {
    return entries.map(([color, nodes]) => [color, Array.isArray(nodes) ? nodes : []]);
  }
  return [[group.color || "#ffffff", []]];
};

const buildColorMap = (entries: ColorEntry[]) =>
  entries.reduce<Record<string, number[]>>((acc, [color, nodes]) => {
    acc[color] = [...nodes];
    return acc;
  }, {});

const getOpacityEntries = (group: FloatingGroupConfig): ColorEntry[] => {
  const entries = Object.entries(group.opacities || {});
  if (entries.length > 0) {
    return entries.map(([opacity, nodes]) => [opacity, Array.isArray(nodes) ? nodes : []]);
  }
  return [["1", []]]; // default opacity 1
};

const buildOpacityMap = (entries: ColorEntry[]) =>
  entries.reduce<Record<string, number[]>>((acc, [opacity, nodes]) => {
    acc[opacity] = [...nodes];
    return acc;
  }, {});

const getNodeOpacity = (entries: ColorEntry[], index: number) => {
  const nodeIndex = index + 1;
  let fallbackOpacity = entries[entries.length - 1]?.[0] || "1";

  entries.forEach(([opacity], entryIndex) => {
    if (entryIndex === entries.length - 1) {
      fallbackOpacity = opacity;
    }
  });

  for (let i = 0; i < entries.length - 1; i += 1) {
    const [opacity, nodes] = entries[i];
    if (nodes.includes(nodeIndex)) {
      return opacity;
    }
  }

  return fallbackOpacity;
};

const getNodeColor = (entries: ColorEntry[], index: number) => {
  const nodeIndex = index + 1;
  let fallbackColor = entries[entries.length - 1]?.[0] || "#ffffff";

  entries.forEach(([color], entryIndex) => {
    if (entryIndex === entries.length - 1) {
      fallbackColor = color;
    }
  });

  for (let i = 0; i < entries.length - 1; i += 1) {
    const [color, nodes] = entries[i];
    if (nodes.includes(nodeIndex)) {
      return color;
    }
  }

  return fallbackColor;
};

const FloatingString: React.FC<FloatingStringProps> = ({
  group,
  updateGroup,
  onCopy,
  onRemove,
  isInlineEditing,
  setInlineEditing,
}) => {
  const [timeChars, setTimeChars] = useState<string[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const output = formatFloatingText(group.timeFormat, new Date());
      setTimeChars(output.split(""));
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, [group.timeFormat]);

  const colorEntries = getColorEntries(group);
  const opacityEntries = getOpacityEntries(group);
  const dist = group.nodeDistribution || [];
  const isAuto = group.alignment !== "manual";
  const safeDist = timeChars.map((_, index) =>
    isAuto
      ? timeChars.length > 1 ? index / (timeChars.length - 1) : 0.5
      : (dist[index] !== undefined ? dist[index] : index / Math.max(1, timeChars.length - 1))
  );

  const isDragging = useRef(false);
  const dragStartInfo = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).dataset.resize) return;
    isDragging.current = true;
    dragStartInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: group.position[0],
      initialPosY: group.position[1],
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartInfo.current.startX;
    const dy = e.clientY - dragStartInfo.current.startY;

    updateGroup(group.id, {
      position: [
        dragStartInfo.current.initialPosX + dx / window.innerWidth,
        dragStartInfo.current.initialPosY + dy / window.innerHeight,
      ],
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const isResizing = useRef(false);
  const resizeStartInfo = useRef({ startX: 0, startY: 0, startW: 0, startH: 0 });

  const handleResizeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStartInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: group.size[0],
      startH: group.size[1],
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing.current) return;
    e.stopPropagation();

    const dx = e.clientX - resizeStartInfo.current.startX;
    const dy = e.clientY - resizeStartInfo.current.startY;

    let newW = resizeStartInfo.current.startW + dx / window.innerWidth;
    let newH = resizeStartInfo.current.startH + dy / window.innerHeight;

    if (group.lockAspectRatio) {
      const baseWidth = Math.max(resizeStartInfo.current.startW, 0.001);
      const scale = newW / baseWidth;
      newW = resizeStartInfo.current.startW * scale;
      newH = resizeStartInfo.current.startH * scale;
    }

    updateGroup(group.id, {
      size: [Math.max(0.05, newW), Math.max(0.05, newH)],
    });
  };

  const handleResizeUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing.current) return;
    isResizing.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const updateColorEntries = (entries: ColorEntry[]) => {
    updateGroup(group.id, {
      color: entries[entries.length - 1]?.[0] || "#ffffff",
      colors: buildColorMap(entries),
    });
  };

  const setColorAt = (index: number, color: string) => {
    const entries = getColorEntries(group);
    entries[index] = [color, entries[index]?.[1] || []];
    updateColorEntries(entries);
  };

  const setNodesAt = (index: number, value: string) => {
    const entries = getColorEntries(group);
    entries[index] = [entries[index]?.[0] || "#ffffff", parseNodeIndexes(value)];
    updateColorEntries(entries);
  };

  const addColorEntry = () => {
    const entries = getColorEntries(group);
    const fallback = entries.pop() || ["#ffffff", []];
    const nextColor = PRESET_COLORS.find((color) => !entries.some(([entryColor]) => entryColor === color) && fallback[0] !== color) || "#d8d8d8";
    updateColorEntries([...entries, [nextColor, []], fallback]);
  };

  const updateOpacityEntries = (entries: ColorEntry[]) => {
    updateGroup(group.id, {
      opacities: buildOpacityMap(entries),
    });
  };

  const setOpacityAt = (index: number, opacity: string) => {
    const entries = getOpacityEntries(group);
    entries[index] = [opacity, entries[index]?.[1] || []];
    updateOpacityEntries(entries);
  };

  const setOpacityNodesAt = (index: number, value: string) => {
    const entries = getOpacityEntries(group);
    entries[index] = [entries[index]?.[0] || "1", parseNodeIndexes(value)];
    updateOpacityEntries(entries);
  };

  const addOpacityEntry = () => {
    const entries = getOpacityEntries(group);
    const fallback = entries.pop() || ["1", []];
    updateOpacityEntries([...entries, ["0.5", []], fallback]);
  };

  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing group rounded z-10 hover:ring-1 hover:ring-white/20"
      style={{
        left: `${group.position[0] * 100}%`,
        top: `${group.position[1] * 100}%`,
        width: `${group.size[0] * 100}%`,
        height: `${group.size[1] * 100}%`,
        zIndex: isInlineEditing ? 40 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setInlineEditing(true);
      }}
    >
      {timeChars.map((char, index) => (
        <div
          key={`${group.id}-${index}-${char}`}
          className="absolute top-1/2 flex items-center justify-center pointer-events-none"
          // ---- 传入节点位置等布局参数 ----
          style={{
            left: `${safeDist[index] * 100}%`,
            transform: "translate(-50%, -50%)",
            color: getNodeColor(colorEntries, index),
            fontFamily: group.fontFamily || "monospace",
            fontSize: `${group.size[1] * 100}vh`,
          }}
        >
          {/* ---- 向 FloatingNode 传入颜色、字体等内容属性 ---- */}
          <FloatingNode
            char={char}
            opacity={Number(getNodeOpacity(opacityEntries, index))}
            temperature={group.temperature ?? 0.5}
            style={{
              color: getNodeColor(colorEntries, index),
              fontFamily: group.fontFamily || "monospace",
              fontSize: `${group.size[1] * 100}vh`,
            }}
          />
        </div>
      ))}

      <div
        data-resize="true"
        className="absolute bottom-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-100 cursor-se-resize flex items-end justify-end p-1 transition-opacity z-20"
        onPointerDown={handleResizeDown}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp}
        onPointerCancel={handleResizeUp}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/50 hover:text-white pointer-events-none"
        >
          <polyline points="22 12 22 22 12 22" />
          <line x1="12" y1="12" x2="22" y2="22" />
        </svg>
      </div>

      {isInlineEditing && (
        <div
          className="absolute top-0 left-[102%] bg-white/95 backdrop-blur-3xl p-3 rounded-xl shadow-2xl text-black flex flex-col gap-2.5 w-[280px] border border-black/5 cursor-default box-content"
          style={{ zIndex: 100 }}
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={group.timeFormat}
              onChange={(e) => updateGroup(group.id, { timeFormat: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-black/5 border-transparent rounded outline-none focus:ring-1 focus:ring-black/20"
              placeholder="${HH}:${mm}"
            />
            
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => updateGroup(group.id, { alignment: group.alignment === "auto" ? "manual" : "auto" })}
                className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded border transition-all ${
                  group.alignment === "auto" ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10 shadow-sm"
                }`}
              >
                Auto
              </button>
              <input
                type="text"
                value={(group.nodeDistribution || []).join(", ")}
                onChange={(e) => updateGroup(group.id, { nodeDistribution: parseDistributionInput(e.target.value) })}
                className="flex-1 px-2 py-1 text-xs bg-black/5 border-transparent rounded outline-none focus:ring-1 focus:ring-black/20"
                placeholder="0, 0.25, 0.5, 0.75, 1"
                disabled={group.alignment === "auto"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-black/5 pt-2">
            {colorEntries.map(([color, nodes], index) => {
              const isDefault = index === colorEntries.length - 1;
              return (
                <div key={`${color}-${index}`} className="grid grid-cols-[24px_minmax(0,92px)_minmax(0,1fr)] items-center gap-1.5">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColorAt(index, e.target.value)}
                    className="w-6 h-6 p-0 border-none cursor-pointer bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColorAt(index, e.target.value)}
                    className="w-[88px] px-2 py-1 text-xs bg-black/5 border-transparent rounded font-mono outline-none focus:ring-1 focus:ring-black/20"
                  />
                  <input
                    type="text"
                    value={nodes.join(", ")}
                    onChange={(e) => setNodesAt(index, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-black/5 border-transparent rounded outline-none focus:ring-1 focus:ring-black/20"
                    placeholder={isDefault ? "默认补位" : "1, 3"}
                    disabled={isDefault}
                  />
                </div>
              );
            })}
            <button
              onClick={addColorEntry}
              className="w-full py-1.5 text-xs font-medium rounded-lg border border-dashed border-black/15 text-black/70 hover:bg-black/5 transition-colors"
            >
              添加颜色映射
            </button>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-black/5 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-black/60 shrink-0">漂浮</span>
              <input 
                type="range"
                min="0" max="1" step="0.1"
                value={group.temperature ?? 0.5}
                onChange={(e) => updateGroup(group.id, { temperature: parseFloat(e.target.value) })}
                className="flex-1"
              />
            </div>
            {opacityEntries.map(([opacity, nodes], index) => {
              const isDefault = index === opacityEntries.length - 1;
              return (
                <div key={`opacity-${opacity}-${index}`} className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] items-center gap-1.5">
                  <input
                    type="number"
                    min="0" max="1" step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacityAt(index, e.target.value)}
                    className="w-[120px] px-2 py-1 text-xs bg-black/5 border-transparent rounded font-mono outline-none focus:ring-1 focus:ring-black/20"
                  />
                  <input
                    type="text"
                    value={nodes.join(", ")}
                    onChange={(e) => setOpacityNodesAt(index, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-black/5 border-transparent rounded outline-none focus:ring-1 focus:ring-black/20"
                    placeholder={isDefault ? "默认补位" : "1, 3"}
                    disabled={isDefault}
                  />
                </div>
              );
            })}
            <button
              onClick={addOpacityEntry}
              className="w-full py-1.5 text-xs font-medium rounded-lg border border-dashed border-black/15 text-black/70 hover:bg-black/5 transition-colors"
            >
              添加透明度映射
            </button>
          </div>

          <div className="flex gap-1 pt-1 border-t border-black/5">
            <button
              onClick={() => updateGroup(group.id, { lockAspectRatio: !(group.lockAspectRatio ?? true) })}
              className={`flex-1 py-1 text-xs font-medium rounded border transition-all ${
                group.lockAspectRatio ?? true ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10 shadow-sm"
              }`}
            >
              Lock
            </button>
            {onCopy && (
              <button
                onClick={() => {
                  onCopy();
                  setInlineEditing(false);
                }}
                className="flex-1 py-1 text-xs bg-white hover:bg-black/5 rounded text-black font-semibold border border-black/10 shadow-sm"
              >
                Copy
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => {
                  onRemove();
                  setInlineEditing(false);
                }}
                className="flex-1 py-1 text-xs bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold border border-red-200 shadow-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingString;
