/**
 * @file components/floating/FloatingString.tsx
 * @description Floating 单条字符串组件，负责渲染、拖拽缩放与双击快速配置。
 */
"use client";

import React, { useEffect, useRef, useState } from "react";
import FloatingNode, { type FloatingNodeStabilizationPulse } from "./FloatingNode";
import { FloatingGroupConfig } from "../../config/floating.config";

interface FloatingStringProps {
  group: FloatingGroupConfig;
  updateGroup: (id: string, updates: Partial<FloatingGroupConfig>) => void;
  onCopy?: () => void;
  onRemove?: () => void;
  isInlineEditing: boolean;
  setInlineEditing: (state: boolean) => void;
  isReminderActive?: boolean;
  reminderColors?: string[];
}

type ColorEntry = [string, number[]];
type ReminderPlan = {
  minuteKey: number;
  revealTimes: number[];
  slots: number[];
};

type DisplayState = {
  chars: string[];
  punchLetters: Record<number, number>;
  forceAutoDistribution: boolean;
};

const EMPTY_STABILIZATION_PULSE: FloatingNodeStabilizationPulse = {
  id: 0,
  direction: 0,
  strength: 0,
  distance: 0,
};

const STABILIZATION_RADIUS = 2;

const PRESET_COLORS = ["#94d3e2", "#fcef7a", "#ffffff", "#ff8d8d", "#9bf2b1"];
const REMINDER_WORD = "punch";
const REMINDER_FALLBACK_COLORS = ["#ff453a", "#ff6b5f", "#ff2d55", "#ff8a80", "#ffd1cc"];

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

const getAspectRatioEntries = (group: FloatingGroupConfig): ColorEntry[] => {
  const entries = Object.entries(group.aspectRatios || {});
  if (entries.length > 0) {
    return entries.map(([ratio, nodes]) => [ratio, Array.isArray(nodes) ? nodes : []]);
  }
  return [["1", []]]; // default aspectRatio 1
};

const buildAspectRatioMap = (entries: ColorEntry[]) =>
  entries.reduce<Record<string, number[]>>((acc, [ratio, nodes]) => {
    acc[ratio] = [...nodes];
    return acc;
  }, {});

const getVerticalOffsetEntries = (group: FloatingGroupConfig): ColorEntry[] => {
  const entries = Object.entries(group.verticalOffsets || {});
  if (entries.length > 0) {
    return entries.map(([offset, nodes]) => [offset, Array.isArray(nodes) ? nodes : []]);
  }
  return [["0", []]]; // default offset 0
};

const getZIndexEntries = (group: FloatingGroupConfig): ColorEntry[] => {
  const entries = Object.entries(group.zIndices || {});
  if (entries.length > 0) {
    return entries.map(([zIndex, nodes]) => [zIndex, Array.isArray(nodes) ? nodes : []]);
  }
  return [["0", []]]; // default zIndex 0
};

const buildZIndexMap = (entries: ColorEntry[]) =>
  entries.reduce<Record<string, number[]>>((acc, [zIndex, nodes]) => {
    acc[zIndex] = [...nodes];
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

const getNodeAspectRatio = (entries: ColorEntry[], index: number) => {
  const nodeIndex = index + 1;
  let fallbackRatio = entries[entries.length - 1]?.[0] || "1";

  entries.forEach(([ratio], entryIndex) => {
    if (entryIndex === entries.length - 1) {
      fallbackRatio = ratio;
    }
  });

  for (let i = 0; i < entries.length - 1; i += 1) {
    const [ratio, nodes] = entries[i];
    if (nodes.includes(nodeIndex)) {
      return ratio;
    }
  }

  return fallbackRatio;
};

const getNodeVerticalOffset = (entries: ColorEntry[], index: number) => {
  const nodeIndex = index + 1;
  let fallbackOffset = entries[entries.length - 1]?.[0] || "0";

  entries.forEach(([offset], entryIndex) => {
    if (entryIndex === entries.length - 1) {
      fallbackOffset = offset;
    }
  });

  for (let i = 0; i < entries.length - 1; i += 1) {
    const [offset, nodes] = entries[i];
    if (nodes.includes(nodeIndex)) {
      return offset;
    }
  }

  return fallbackOffset;
};

const getNodeZIndex = (entries: ColorEntry[], index: number) => {
  const nodeIndex = index + 1;
  let fallbackZIndex = entries[entries.length - 1]?.[0] || "0";

  entries.forEach(([zIndex], entryIndex) => {
    if (entryIndex === entries.length - 1) {
      fallbackZIndex = zIndex;
    }
  });

  for (let i = 0; i < entries.length - 1; i += 1) {
    const [zIndex, nodes] = entries[i];
    if (nodes.includes(nodeIndex)) {
      return zIndex;
    }
  }

  return fallbackZIndex;
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

const buildStabilizationPulses = (
  prevChars: string[],
  nextChars: string[],
  pulseId: number,
): FloatingNodeStabilizationPulse[] => {
  if (prevChars.length === 0 || prevChars.length !== nextChars.length) {
    return nextChars.map(() => EMPTY_STABILIZATION_PULSE);
  }

  const changedIndexSet = new Set<number>();

  prevChars.forEach((prevChar, index) => {
    if (nextChars[index] !== prevChar) {
      changedIndexSet.add(index);
    }
  });

  if (changedIndexSet.size === 0) {
    return nextChars.map(() => EMPTY_STABILIZATION_PULSE);
  }

  return nextChars.map((_, index) => {
    if (changedIndexSet.has(index)) {
      return EMPTY_STABILIZATION_PULSE;
    }

    let directionalForce = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    changedIndexSet.forEach((changedIndex) => {
      const distance = Math.abs(changedIndex - index);
      if (distance === 0 || distance > STABILIZATION_RADIUS) {
        return;
      }

      nearestDistance = Math.min(nearestDistance, distance);

      const attenuation = distance === 1 ? 1 : 0.45;
      directionalForce += Math.sign(changedIndex - index) * attenuation;
    });

    const strength = Math.min(1, Math.abs(directionalForce));
    if (strength <= 0 || !Number.isFinite(nearestDistance)) {
      return EMPTY_STABILIZATION_PULSE;
    }

    return {
      id: pulseId,
      direction: directionalForce > 0 ? 1 : -1,
      strength,
      distance: nearestDistance,
    };
  });
};

const createReminderPlan = (minuteKey: number, baseLength: number): ReminderPlan => {
  const finalReveal = 18 + Math.random() * 20;
  const earlyReveals = Array.from({ length: REMINDER_WORD.length - 1 }, () => 2 + Math.random() * Math.max(1, finalReveal - 4))
    .sort((a, b) => a - b);
  const slots = Array.from({ length: Math.max(baseLength, REMINDER_WORD.length) }, (_, index) => index)
    .sort(() => Math.random() - 0.5)
    .slice(0, REMINDER_WORD.length);

  return {
    minuteKey,
    revealTimes: [...earlyReveals, finalReveal],
    slots,
  };
};

const buildReminderDisplay = (baseChars: string[], now: Date, planRef: React.MutableRefObject<ReminderPlan | null>): DisplayState => {
  const minuteKey = Math.floor(now.getTime() / 60000);
  const baseLength = Math.max(baseChars.length, REMINDER_WORD.length);

  if (!planRef.current || planRef.current.minuteKey !== minuteKey || planRef.current.slots.length < REMINDER_WORD.length) {
    planRef.current = createReminderPlan(minuteKey, baseLength);
  }

  const plan = planRef.current;
  const elapsedSeconds = (now.getTime() - minuteKey * 60000) / 1000;
  const revealedCount = plan.revealTimes.filter((time) => elapsedSeconds >= time).length;

  if (revealedCount >= REMINDER_WORD.length) {
    return {
      chars: REMINDER_WORD.split(""),
      punchLetters: Object.fromEntries(REMINDER_WORD.split("").map((_, index) => [index, index])),
      forceAutoDistribution: true,
    };
  }

  const nextChars = [...baseChars];
  const punchLetters: Record<number, number> = {};

  for (let index = 0; index < revealedCount; index += 1) {
    const slot = plan.slots[index] ?? index;
    while (nextChars.length <= slot) {
      nextChars.push(" ");
    }
    nextChars[slot] = REMINDER_WORD[index];
    punchLetters[slot] = index;
  }

  return {
    chars: nextChars,
    punchLetters,
    forceAutoDistribution: revealedCount > 0,
  };
};

const FloatingString: React.FC<FloatingStringProps> = ({
  group,
  updateGroup,
  onCopy,
  onRemove,
  isInlineEditing,
  setInlineEditing,
  isReminderActive = false,
  reminderColors = REMINDER_FALLBACK_COLORS,
}) => {
  const [displayState, setDisplayState] = useState<DisplayState>({
    chars: [],
    punchLetters: {},
    forceAutoDistribution: false,
  });
  const [stabilizationPulses, setStabilizationPulses] = useState<FloatingNodeStabilizationPulse[]>([]);
  const pulseIdRef = useRef(0);
  const prevTimeCharsRef = useRef<string[]>([]);
  const reminderPlanRef = useRef<ReminderPlan | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const baseChars = formatFloatingText(group.timeFormat, now).split("");
      const nextDisplay = isReminderActive
        ? buildReminderDisplay(baseChars, now, reminderPlanRef)
        : { chars: baseChars, punchLetters: {}, forceAutoDistribution: false };
      const nextChars = nextDisplay.chars;
      const prevChars = prevTimeCharsRef.current;

      if (prevChars.length === 0) {
        setDisplayState(nextDisplay);
        setStabilizationPulses(nextChars.map(() => EMPTY_STABILIZATION_PULSE));
        prevTimeCharsRef.current = nextChars;
        return;
      }

      pulseIdRef.current += 1;
      setDisplayState(nextDisplay);
      setStabilizationPulses(buildStabilizationPulses(prevChars, nextChars, pulseIdRef.current));
      prevTimeCharsRef.current = nextChars;
    };

    updateTime();
    const interval = window.setInterval(updateTime, isReminderActive ? 500 : 1000);
    return () => window.clearInterval(interval);
  }, [group.timeFormat, isReminderActive]);

  const colorEntries = getColorEntries(group);
  const opacityEntries = getOpacityEntries(group);
  const aspectRatioEntries = getAspectRatioEntries(group);
  const verticalOffsetEntries = getVerticalOffsetEntries(group);
  const zIndexEntries = getZIndexEntries(group);
  const dist = group.nodeDistribution || [];
  const timeChars = displayState.chars;
  const isAuto = group.alignment !== "manual" || displayState.forceAutoDistribution;
  const safeDist = timeChars.map((_, index) =>
    isAuto
      ? timeChars.length > 1 ? index / (timeChars.length - 1) : 0.5
      : (dist[index] !== undefined ? dist[index] : index / Math.max(1, timeChars.length - 1))
  );
  const safeReminderColors = reminderColors.length > 0 ? reminderColors : REMINDER_FALLBACK_COLORS;
  const getDisplayColor = (index: number) => {
    const punchLetterIndex = displayState.punchLetters[index];
    if (punchLetterIndex !== undefined) {
      return safeReminderColors[punchLetterIndex % safeReminderColors.length];
    }
    return getNodeColor(colorEntries, index);
  };

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

  const updateAspectRatioEntries = (entries: ColorEntry[]) => {
    updateGroup(group.id, {
      aspectRatios: buildAspectRatioMap(entries),
    });
  };

  const setAspectRatioAt = (index: number, ratio: string) => {
    const entries = getAspectRatioEntries(group);
    entries[index] = [ratio, entries[index]?.[1] || []];
    updateAspectRatioEntries(entries);
  };

  const setAspectRatioNodesAt = (index: number, value: string) => {
    const entries = getAspectRatioEntries(group);
    entries[index] = [entries[index]?.[0] || "1", parseNodeIndexes(value)];
    updateAspectRatioEntries(entries);
  };

  const addAspectRatioEntry = () => {
    const entries = getAspectRatioEntries(group);
    const fallback = entries.pop() || ["1", []];
    updateAspectRatioEntries([...entries, ["1.5", []], fallback]);
  };

  const updateZIndexEntries = (entries: ColorEntry[]) => {
    updateGroup(group.id, {
      zIndices: buildZIndexMap(entries),
    });
  };

  const setZIndexAt = (index: number, zIndex: string) => {
    const entries = getZIndexEntries(group);
    entries[index] = [zIndex, entries[index]?.[1] || []];
    updateZIndexEntries(entries);
  };

  const setZIndexNodesAt = (index: number, value: string) => {
    const entries = getZIndexEntries(group);
    entries[index] = [entries[index]?.[0] || "0", parseNodeIndexes(value)];
    updateZIndexEntries(entries);
  };

  const addZIndexEntry = () => {
    const entries = getZIndexEntries(group);
    const fallback = entries.pop() || ["0", []];
    updateZIndexEntries([...entries, ["1", []], fallback]);
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
          key={`${group.id}-${index}`}
          className="absolute top-1/2 flex items-center justify-center pointer-events-none"
          // ---- 传入节点位置等布局参数 ----
          style={{
            left: `${safeDist[index] * 100}%`,
            transform: "translate(-50%, -50%)",
            color: getDisplayColor(index),
            fontFamily: group.fontFamily || "monospace",
            fontSize: `${group.size[1] * 100}vh`,
          }}
        >
          {/* ---- 向 FloatingNode 传入颜色、字体等内容属性 ---- */}
          <FloatingNode
            char={char}
            opacity={Number(getNodeOpacity(opacityEntries, index))}
            temperature={group.temperature ?? 0}
            aspectRatio={Number(getNodeAspectRatio(aspectRatioEntries, index))}
            verticalOffset={Number(getNodeVerticalOffset(verticalOffsetEntries, index))}
            zIndex={Number(getNodeZIndex(zIndexEntries, index))}
            animation={group.animation || "fly"}
            stabilizationPulse={stabilizationPulses[index] ?? EMPTY_STABILIZATION_PULSE}
            style={{
              color: getDisplayColor(index),
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
            
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-black/60 shrink-0">动画</span>
                <select
                    value={group.animation || "fly"}
                    onChange={(e) => updateGroup(group.id, { animation: e.target.value as "fly" | "fade" })}
                    className="flex-1 px-2 py-1 text-xs bg-black/5 border-transparent rounded outline-none focus:ring-1 focus:ring-black/20"
                >
                    <option value="fly">飞入/飞出</option>
                    <option value="fade">交叉淡入淡出</option>
                </select>
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

          <div className="flex flex-col gap-1.5 border-t border-black/5 pt-2">
            {aspectRatioEntries.map(([ratio, nodes], index) => {
              const isDefault = index === aspectRatioEntries.length - 1;
              return (
                <div key={`aspectRatio-${ratio}-${index}`} className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] items-center gap-1.5">
                  <input
                    type="number"
                    min="0.1" max="5" step="0.1"
                    value={ratio}
                    onChange={(e) => setAspectRatioAt(index, e.target.value)}
                    className="w-[120px] px-2 py-1 text-xs bg-black/5 border-transparent rounded font-mono outline-none focus:ring-1 focus:ring-black/20"
                  />
                  <input
                    type="text"
                    value={nodes.join(", ")}
                    onChange={(e) => setAspectRatioNodesAt(index, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-black/5 border-transparent rounded outline-none focus:ring-1 focus:ring-black/20"
                    placeholder={isDefault ? "默认补位" : "1, 3"}
                    disabled={isDefault}
                  />
                </div>
              );
            })}
            <button
              onClick={addAspectRatioEntry}
              className="w-full py-1.5 text-xs font-medium rounded-lg border border-dashed border-black/15 text-black/70 hover:bg-black/5 transition-colors"
            >
              添加长宽比映射
            </button>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-black/5 pt-2">
            {zIndexEntries.map(([zIndex, nodes], index) => {
              const isDefault = index === zIndexEntries.length - 1;
              return (
                <div key={`zIndex-${zIndex}-${index}`} className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] items-center gap-1.5">
                  <input
                    type="number"
                    min="-100" max="100" step="1"
                    value={zIndex}
                    onChange={(e) => setZIndexAt(index, e.target.value)}
                    className="w-[120px] px-2 py-1 text-xs bg-black/5 border-transparent rounded font-mono outline-none focus:ring-1 focus:ring-black/20"
                  />
                  <input
                    type="text"
                    value={nodes.join(", ")}
                    onChange={(e) => setZIndexNodesAt(index, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-black/5 border-transparent rounded outline-none focus:ring-1 focus:ring-black/20"
                    placeholder={isDefault ? "默认补位" : "1, 3"}
                    disabled={isDefault}
                  />
                </div>
              );
            })}
            <button
              onClick={addZIndexEntry}
              className="w-full py-1.5 text-xs font-medium rounded-lg border border-dashed border-black/15 text-black/70 hover:bg-black/5 transition-colors"
            >
              添加 zIndex 映射
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
