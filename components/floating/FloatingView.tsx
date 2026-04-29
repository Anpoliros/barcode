/**
 * @file components/floating/FloatingView.tsx
 * @description 悬浮时钟主视图。负责配置持久化、菜单管理与字符串实例渲染。
 */
"use client";
import React, { startTransition, useEffect, useState } from "react";
import MenuBar from "../MenuBar";
import FloatingString from "./FloatingString";
import { AppConfig } from "../../config/app.config";
import { defaultConfig } from "../../config/defaults";
import { FloatingGroupConfig } from "../../config/floating.config";

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

const getColorEntries = (group: FloatingGroupConfig) => {
  const entries = Object.entries(group.colors || {});
  if (entries.length > 0) {
    return entries.map(([color, nodes]) => [color, Array.isArray(nodes) ? nodes : []] as [string, number[]]);
  }
  return [[group.color || "#ffffff", []] as [string, number[]]];
};

const buildColorMap = (entries: [string, number[]][]) =>
  entries.reduce<Record<string, number[]>>((acc, [color, nodes]) => {
    acc[color] = [...nodes];
    return acc;
  }, {});

const getOpacityEntries = (group: FloatingGroupConfig) => {
  const entries = Object.entries(group.opacities || {});
  if (entries.length > 0) {
    return entries.map(([opacity, nodes]) => [opacity, Array.isArray(nodes) ? nodes : []] as [string, number[]]);
  }
  return [["1", []] as [string, number[]]];
};

const buildOpacityMap = (entries: [string, number[]][]) =>
  entries.reduce<Record<string, number[]>>((acc, [opacity, nodes]) => {
    acc[opacity] = [...nodes];
    return acc;
  }, {});

const createFloatingGroupId = () => `float_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

export default function FloatingView() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if (config.app.wakeLock !== false && "wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // 忽略不支持或被拒绝的情况
      }
    };

    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      wakeLock?.release();
    };
  }, [config.app.wakeLock]);

  useEffect(() => {
    let cancelled = false;
    const saved = localStorage.getItem("floating_config");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        startTransition(() => {
          if (cancelled) return;
          setConfig(prev => ({
            ...prev,
            floating: { ...prev.floating, ...(parsed.floating || {}) },
            app: { ...prev.app, ...(parsed.app || {}) }
          }));
        });
      } catch {
        // 忽略损坏的本地配置
      }
    }

    startTransition(() => {
      if (!cancelled) {
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem("floating_config", JSON.stringify(newConfig));
  };

  const addFloatingGroup = () => {
    const newGroup: FloatingGroupConfig = {
      id: createFloatingGroupId(),
      name: `String ${(config.floating.groups?.length || 0) + 1}`,
      position: [0.1, 0.1],
      size: [0.8, 0.2],
      nodeDistribution: [0, 0.25, 0.5, 0.75, 1],
      timeFormat: "${HH}:${mm}",
      color: "#ffffff",
      colors: {
        "#94d3e2": [1, 3],
        "#fcef7a": [2, 4],
        "#ffffff": [],
      },
      opacities: {
        "0.5": [3],
        "1": [],
      },
      temperature: 0.5,
      fontFamily: "monospace",
      nodes: [],
    };
    saveConfig({
      ...config,
      floating: {
        ...config.floating,
        groups: [...(config.floating.groups || []), newGroup],
      },
    });
  };

  const updateGroup = (id: string, updates: Partial<FloatingGroupConfig>) => {
    const newGroups = (config.floating.groups || []).map(group =>
      group.id === id ? { ...group, ...updates } : group
    );
    saveConfig({ ...config, floating: { ...config.floating, groups: newGroups } });
  };

  const removeGroup = (id: string) => {
    const newGroups = (config.floating.groups || []).filter(group => group.id !== id);
    saveConfig({ ...config, floating: { ...config.floating, groups: newGroups } });
    if (activeSubmenu === id) setActiveSubmenu(null);
    if (inlineEditId === id) setInlineEditId(null);
    if (editingNameId === id) setEditingNameId(null);
  };

  const copyGroup = (id: string) => {
    const group = (config.floating.groups || []).find(item => item.id === id);
    if (!group) return;
    const newGroup: FloatingGroupConfig = {
      ...group,
      id: createFloatingGroupId(),
      name: `${group.name || "String"} Copy`,
      position: [group.position[0] + 0.05, group.position[1] + 0.05],
    };
    saveConfig({
      ...config,
      floating: {
        ...config.floating,
        groups: [...(config.floating.groups || []), newGroup],
      },
    });
  };

  if (!hydrated) return null;

  const renderGroupSettings = (group: FloatingGroupConfig) => {
    const colorEntries = getColorEntries(group);
    const opacityEntries = getOpacityEntries(group);

    return (
      <div className="absolute left-[102%] top-0 z-50 w-[320px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl p-3 flex flex-col gap-1.5 font-sans rounded-2xl">
        <div className="flex justify-between items-center mb-1 px-1">
          <span className="font-bold text-lg">Floating Config</span>
        </div>

        <div className="flex flex-col gap-1.5 mt-1 overflow-visible">
          <div
            className="px-3 py-2 rounded-lg border bg-white shadow text-black border-white/50 cursor-pointer"
            onClick={() => {
              setInlineEditId(group.id);
              setMenuOpen(false);
            }}
          >
            <span className="font-medium text-sm">配置 {group.name || group.id}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">显示的字符串</span>
            <input
              type="text"
              value={group.timeFormat}
              onChange={e => updateGroup(group.id, { timeFormat: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-white/50 border border-black/20 rounded focus:outline-none focus:ring-1 focus:ring-black/20"
              placeholder="${HH}:${mm}"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">Node 分布</span>
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => updateGroup(group.id, { alignment: group.alignment === "auto" ? "manual" : "auto" })}
                className={`px-2 py-1 text-xs font-medium rounded border transition-all ${
                  group.alignment === "auto" ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10"
                }`}
              >
                Auto
              </button>
              <input
                type="text"
                value={group.nodeDistribution.join(", ")}
                onChange={e => updateGroup(group.id, { nodeDistribution: parseDistributionInput(e.target.value) })}
                className="flex-1 px-2 py-1.5 text-xs bg-white/50 border border-black/20 rounded focus:outline-none focus:ring-1 focus:ring-black/20"
                placeholder="0, 0.25, 0.5, 0.75, 1"
                disabled={group.alignment === "auto"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 border-t border-black/10">
            <span className="font-semibold text-sm">颜色</span>
            {colorEntries.map(([color, nodes], index) => {
              const isDefault = index === colorEntries.length - 1;
              return (
                <div key={`${group.id}-${color}-${index}`} className="grid grid-cols-[24px_minmax(0,88px)_minmax(0,1fr)] items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={e => {
                      const nextEntries = [...colorEntries];
                      nextEntries[index] = [e.target.value, nextEntries[index][1]];
                      updateGroup(group.id, {
                        color: nextEntries[nextEntries.length - 1]?.[0] || "#ffffff",
                        colors: buildColorMap(nextEntries),
                      });
                    }}
                    className="w-6 h-6 p-0 border-none cursor-pointer bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => {
                      const nextEntries = [...colorEntries];
                      nextEntries[index] = [e.target.value, nextEntries[index][1]];
                      updateGroup(group.id, {
                        color: nextEntries[nextEntries.length - 1]?.[0] || "#ffffff",
                        colors: buildColorMap(nextEntries),
                      });
                    }}
                    className="w-[92px] px-2 py-1 text-xs bg-white/50 border border-black/20 rounded font-mono"
                  />
                  <input
                    type="text"
                    value={nodes.join(", ")}
                    onChange={e => {
                      const nextEntries = [...colorEntries];
                      nextEntries[index] = [nextEntries[index][0], parseNodeIndexes(e.target.value)];
                      updateGroup(group.id, {
                        color: nextEntries[nextEntries.length - 1]?.[0] || "#ffffff",
                        colors: buildColorMap(nextEntries),
                      });
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-white/50 border border-black/20 rounded"
                    placeholder={isDefault ? "默认补位" : "1, 3"}
                    disabled={isDefault}
                  />
                </div>
              );
            })}
            <button
              onClick={() => {
                const nextEntries = [...colorEntries];
                const fallback = nextEntries.pop() || ["#ffffff", []];
                nextEntries.push(["#d8d8d8", []], fallback);
                updateGroup(group.id, {
                  color: fallback[0],
                  colors: buildColorMap(nextEntries),
                });
              }}
              className="w-full mt-1 border border-dashed border-black/20 hover:border-black/40 hover:bg-black/5 text-black/70 font-semibold py-2 rounded-xl text-sm transition-all"
            >
              添加颜色映射
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-black/10">
            <span className="font-semibold text-sm">外观与动画</span>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-xs text-black/60 shrink-0 w-12">漂浮强度</span>
              <input 
                type="range"
                min="0" max="1" step="0.1"
                value={group.temperature ?? 0.5}
                onChange={e => updateGroup(group.id, { temperature: parseFloat(e.target.value) })}
                className="flex-1 w-full"
              />
              <span className="font-medium text-xs text-black/60 shrink-0 w-6 text-right">{group.temperature ?? 0.5}</span>
            </div>

            <span className="font-medium text-xs text-black/60">不透明度映射</span>
            {opacityEntries.map(([opacity, nodes], index) => {
              const isDefault = index === opacityEntries.length - 1;
              return (
                <div key={`${group.id}-opacity-${index}`} className="grid grid-cols-[minmax(0,88px)_minmax(0,1fr)] items-center gap-2">
                  <input
                    type="number"
                    min="0" max="1" step="0.1"
                    value={opacity}
                    onChange={e => {
                      const nextEntries = [...opacityEntries];
                      nextEntries[index] = [e.target.value, nextEntries[index][1]];
                      updateGroup(group.id, {
                        opacities: buildOpacityMap(nextEntries),
                      });
                    }}
                    className="w-[92px] px-2 py-1 text-xs bg-white/50 border border-black/20 rounded font-mono"
                  />
                  <input
                    type="text"
                    value={nodes.join(", ")}
                    onChange={e => {
                      const nextEntries = [...opacityEntries];
                      nextEntries[index] = [nextEntries[index][0], parseNodeIndexes(e.target.value)];
                      updateGroup(group.id, {
                        opacities: buildOpacityMap(nextEntries),
                      });
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-white/50 border border-black/20 rounded"
                    placeholder={isDefault ? "默认补位" : "1, 3"}
                    disabled={isDefault}
                  />
                </div>
              );
            })}
            <button
              onClick={() => {
                const nextEntries = [...opacityEntries];
                const fallback = nextEntries.pop() || ["1", []];
                nextEntries.push(["0.5", []], fallback);
                updateGroup(group.id, {
                  opacities: buildOpacityMap(nextEntries),
                });
              }}
              className="w-full mt-1 border border-dashed border-black/20 hover:border-black/40 hover:bg-black/5 text-black/70 font-semibold py-2 rounded-xl text-sm transition-all"
            >
              添加不透明度映射
            </button>
          </div>

          <div className="flex gap-2 mt-2 border-t border-black/10 pt-2">
            <button onClick={() => copyGroup(group.id)} className="flex-1 bg-white/50 hover:bg-white rounded py-1.5 text-sm transition-all border border-black/10 shadow-sm font-semibold">Copy</button>
            <button onClick={() => removeGroup(group.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded py-1.5 text-sm transition-all border border-red-500/20 shadow-sm font-semibold">Delete</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden text-white transition-colors duration-1000"
      style={{
        backgroundColor: config.app.backgroundColor,
      }}
      onClick={() => {
        if (menuOpen) setMenuOpen(false);
        setActiveSubmenu(null);
        setInlineEditId(null);
        setEditingNameId(null);
      }}
    >
      <MenuBar
        open={menuOpen}
        onOpenChange={setMenuOpen}
        alignSubmenus={config.app.alignSubmenus ?? true}
        config={config}
        onConfigSave={saveConfig}
        tabs={[
          {
            id: "Floating",
            label: "Floating",
            content: (
              <div className="relative w-[300px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl p-3 flex flex-col gap-1.5 font-sans rounded-2xl">
                <div className="flex justify-between items-center mb-1 px-1">
                  <span className="font-bold text-lg">Floating Config</span>
                </div>

                <div className="flex flex-col gap-1.5 mt-1 overflow-visible">
                  <span className="text-xs font-bold text-black/40 ml-1 tracking-widest uppercase mb-1">Strings</span>

                  {(config.floating.groups || []).map((group, index) => {
                    const defaultColor = getColorEntries(group).slice(-1)[0]?.[0] || "#ffffff";

                    return (
                      <div key={group.id} className="relative">
                        <div
                          onClick={e => {
                            e.stopPropagation();
                            if (!editingNameId) setActiveSubmenu(activeSubmenu === group.id ? null : group.id);
                          }}
                          className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all border ${
                            activeSubmenu === group.id ? "bg-white shadow text-black border-white/50" : "bg-transparent hover:bg-black/5 border-transparent text-black/80"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 max-w-[85%] overflow-hidden">
                            <span className="w-2 h-2 rounded-full shadow-inner flex-shrink-0" style={{ backgroundColor: defaultColor }} />
                            {editingNameId === group.id ? (
                              <input
                                autoFocus
                                className="text-sm font-medium bg-black/5 w-full outline-none text-black px-1.5 py-1 rounded focus:ring-1 focus:ring-black/20"
                                value={group.name || `String ${index + 1}`}
                                onChange={e => updateGroup(group.id, { name: e.target.value })}
                                onBlur={() => setEditingNameId(null)}
                                onKeyDown={e => e.key === "Enter" && setEditingNameId(null)}
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <span
                                className="font-medium text-sm truncate select-none cursor-text w-full"
                                onDoubleClick={e => {
                                  e.stopPropagation();
                                  setEditingNameId(group.id);
                                }}
                              >
                                {group.name || `String ${index + 1}`}
                              </span>
                            )}
                          </div>
                          {!editingNameId && <span className="text-black/30 font-bold text-xs ml-1 cursor-pointer">›</span>}
                        </div>

                        {activeSubmenu === group.id && renderGroupSettings(group)}
                      </div>
                    );
                  })}

                  <button
                    onClick={addFloatingGroup}
                    className="w-full mt-2 border border-dashed border-black/20 hover:border-black/40 hover:bg-black/5 text-black/70 font-semibold py-2 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="text-lg leading-none">+</span> Add String
                  </button>
                </div>
              </div>
            ),
          },
        ]}
      />

      {(config.floating.groups || []).map(group => (
        // ---- 向 FloatingString 传入 group 配置数据，其中包括需要传递给 Node 的位置、颜色、字体等信息 ----
        <FloatingString
          key={group.id}
          group={group}
          updateGroup={updateGroup}
          onCopy={() => copyGroup(group.id)}
          onRemove={() => removeGroup(group.id)}
          isInlineEditing={inlineEditId === group.id}
          setInlineEditing={(state) => setInlineEditId(state ? group.id : null)}
        />
      ))}
    </div>
  );
}
