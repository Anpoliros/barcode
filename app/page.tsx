"use client";

import { useEffect, useState } from "react";
import BarcodeNode from "../components/BarcodeNode";
import { AppConfig, BarcodeItemConfig } from "../config/config";
import { defaultConfig, defaultItem } from "../config/defaults";

// --- Main App ---
export default function Home() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [hydrated, setHydrated] = useState(false);

  // UI States
  const [triggerVisible, setTriggerVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Barcode" | "Timer" | "Reminder">("Barcode");
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);

  const [visualOrder, setVisualOrder] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Timer States
  const [timerMode, setTimerMode] = useState<'manual' | 'auto' | null>(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [autoPhase, setAutoPhase] = useState<'work' | 'wait'>('work');
  const [timeUp, setTimeUp] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flashToggle, setFlashToggle] = useState(false);

  // Reminder States
  const [hasPunched, setHasPunched] = useState(true);

  // Popup States
  const [popupType, setPopupType] = useState<'timer' | 'reminder' | null>(null);
  const [reminderInput, setReminderInput] = useState('');

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerMode && !timerPaused) {
      if (timerMode === 'manual' && timeUp) {
        return; // Don't count down if manual time is up
      }
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerMode === 'manual') {
              setTimeUp(true);
              return 0;
            } else {
              if (autoPhase === 'work') {
                setAutoPhase('wait');
                setTimeUp(true);
                return Math.round((config.timer?.autoWaitMinutes || 10) * 60);
              } else {
                setAutoPhase('work');
                setTimeUp(false);
                return Math.round((config.timer?.autoWorkMinutes || 40) * 60);
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerMode, timerPaused, autoPhase, timeUp, config.timer]);

  // Flash Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeUp) {
      interval = setInterval(() => {
        setFlashToggle(prev => !prev);
      }, (config.timer?.flashInterval || 1) * 1000);
    } else {
      setFlashToggle(false);
    }
    return () => clearInterval(interval);
  }, [timeUp, config.timer?.flashInterval]);

  // Reminder Logic
  useEffect(() => {
      const checkPunch = () => {
        const todayDateStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
        const now = new Date();

        if (!config.reminder?.refreshTime) return;

        // // 如果是周末（周六、周日），直接视为已打卡不提醒
        // if (now.getDay() === 0 || now.getDay() === 6) {
        //   setHasPunched(true);
        //   return;
        // }

        const [hours, minutes] = config.reminder.refreshTime.split(':').map(Number);
      const refreshDate = new Date();
      refreshDate.setHours(hours, minutes, 0, 0);

      // If last punched is not today, and we are past refresh time, or last punched is totally empty
      if (config.reminder.lastPunchedDate !== todayDateStr) {
        if (now >= refreshDate) setHasPunched(false);
        else setHasPunched(true);
      } else {
        setHasPunched(true);
      }
    };

    checkPunch();
    const intv = setInterval(checkPunch, 60000); // Check every minute
    return () => clearInterval(intv);
  }, [config.reminder?.refreshTime, config.reminder?.lastPunchedDate]);

  // Handle Double Click for popups
  const handleDoubleClick = () => {
    if (timeUp) setPopupType('timer');
    else if (!hasPunched) setPopupType('reminder');
  };

  const timerNodeConfig: BarcodeItemConfig = {
    ...defaultItem,
    id: 'timer_node',
    name: 'Countdown',
    timeFormat: 'HH:mm:ss',
    color: timeUp ? (Math.floor(Date.now() / 500) % 2 === 0 ? 'transparent' : config.timer?.timerColor || '#FF3B30') : (config.timer?.timerColor || '#FF3B30'),
    position: [0.5, 0.2] as [number, number],
    drag: true,
  };

  const getReminderColor = (baseColor: string) => {
    if (!hasPunched && config.reminder?.reminderColor) return config.reminder.reminderColor;
    if (timeUp && config.timer?.timerColor) return config.timer.timerColor;
    return baseColor;
  };

  const timerBarcodeConfig = config.timer?.barcodeConfig || {
    ...defaultItem,
    id: 'timer_node',
    name: 'Countdown',
    timeFormat: 'HH:mm:ss',
    position: [0.5, 0.2] as [number, number],
    drag: true,
  };

  const formatTimer = (totalSeconds: number) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${h}${m}${s}`;
  };

  // Wake Lock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) { }
    };
    requestWakeLock();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  // Hydration & Saving
  useEffect(() => {
    const saved = localStorage.getItem("barcode_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({
          ...prev,
          app: { ...prev.app, ...(parsed.app || {}) },
          mul: { items: parsed?.mul?.items || prev.mul.items },
          timer: { ...prev.timer, ...(parsed.timer || {}) },
          reminder: { ...prev.reminder, ...(parsed.reminder || {}) }
        }));
      } catch (e) { }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const items = config.mul.items || [];
    setVisualOrder(items.map(i => i.id));
  }, [hydrated, config.mul.items?.length]);

  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem("barcode_config", JSON.stringify(newConfig));
  };
  const updateApp = (key: keyof AppConfig["app"], value: any) => saveConfig({ ...config, app: { ...config.app, [key]: value } });

  // Helpers
  const addMulItem = () => {
    const newItem = { ...defaultItem, id: 'mul_' + Date.now(), drag: true };
    saveConfig({ ...config, mul: { ...config.mul, items: [...(config.mul.items || []), newItem] } });
  };
  const updateItem = (id: string, updates: Partial<BarcodeItemConfig>) => {
    const items = config.mul.items || [];
    const newItems = items.map(i => i.id === id ? { ...i, ...updates } : i);
    saveConfig({ ...config, mul: { ...config.mul, items: newItems } });
  };
  const removeMulItem = (id: string) => {
    const items = config.mul.items || [];
    const newItems = items.filter(i => i.id !== id);
    saveConfig({ ...config, mul: { ...config.mul, items: newItems } });
    if (activeSubmenu === id) setActiveSubmenu(null);
  };
  const copyMulItem = (id: string) => {
    const items = config.mul.items || [];
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newItem = { ...item, id: 'mul_' + Date.now(), position: [item.position[0] + 0.05, item.position[1] + 0.05] as [number, number] };
    saveConfig({ ...config, mul: { ...config.mul, items: [...items, newItem] } });
  };
  const bringToFront = (id: string) => {
    const maxZ = Math.max(0, ...(config.mul.items || []).map(i => i.zIndex || 10));
    updateItem(id, { zIndex: maxZ + 1 });
  };

  const startManual = () => {
    setTimerMode('manual');
    setTimerPaused(false);
    setTimeUp(false);
    setTimeRemaining(Math.round((config.timer?.durationMinutes || 30) * 60));
  };

  const startAuto = () => {
    setTimerMode('auto');
    setTimerPaused(false);
    setAutoPhase('work');
    setTimeUp(false);
    setTimeRemaining(Math.round((config.timer?.autoWorkMinutes || 40) * 60));
  };

  const stopTimer = () => {
    setTimerMode(null);
    setTimerPaused(false);
    setTimeUp(false);
    setTimeRemaining(0);
  };

  const resetTimerConfig = () => {
    saveConfig({ ...config, timer: { ...defaultConfig.timer, barcodeConfig: config.timer.barcodeConfig } });
    stopTimer();
  };

  // Autohide trigger
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setTriggerVisible(true);
      clearTimeout(timeout);
      if (!menuOpen) timeout = setTimeout(() => setTriggerVisible(false), 5000);
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("click", resetTimer);
    resetTimer(); // init
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearTimeout(timeout);
    };
  }, [menuOpen]);

  if (!hydrated) return null;

  const displayItems = (config.mul.items || []).slice().sort((a, b) => {
    const iA = visualOrder.indexOf(a.id);
    const iB = visualOrder.indexOf(b.id);
    return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
  });

  const renderItemSettings = (item: BarcodeItemConfig, isMUL: boolean = false) => {
    const wrapper = `flex flex-col gap-2 ${isMUL ? 'p-3 bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-2xl w-[280px] absolute left-[102%] top-0 z-50 text-black/80' : ''}`;
    const rowClass = `flex justify-between items-center py-1.5`;

    return (
      <div className={wrapper} onClick={e => e.stopPropagation()}>
        <div className={rowClass}>
          <span className="font-semibold text-sm">Color</span>
          <div className="flex gap-1.5 items-center">
            {['#000000', '#FF3B30', '#34C759', '#FFCC00', '#007AFF'].map(c => (
              <button key={c} onClick={() => updateItem(item.id, { color: c })} className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c }} />
            ))}
            <div className="flex items-center gap-1 ml-1">
              <input type="color" value={item.color} onChange={e => updateItem(item.id, { color: e.target.value })} className="w-5 h-5 p-0 border-none cursor-pointer bg-transparent" />
              <input type="text" value={item.color} onChange={e => updateItem(item.id, { color: e.target.value })} className="w-16 px-1.5 py-1 text-xs rounded border border-black/20 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Format</span>
          <input type="text" value={item.timeFormat} onChange={e => updateItem(item.id, { timeFormat: e.target.value })} className={`w-36 px-1.5 py-1 text-xs bg-white/50 border border-black/20 rounded focus:outline-none focus:ring-1 focus:ring-black/20`} />
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Font</span>
          <input type="text" value={item.font} onChange={e => updateItem(item.id, { font: e.target.value })} className={`w-36 px-1.5 py-1 text-xs bg-white/50 border border-black/20 rounded focus:outline-none focus:ring-1 focus:ring-black/20`} />
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Encoding</span>
          <select value={item.encoding} onChange={e => updateItem(item.id, { encoding: e.target.value })} className={`w-36 px-1 py-1 text-xs bg-white/50 border border-black/20 rounded focus:outline-none focus:ring-1 focus:ring-black/20`}>
            <option value="CODE128">CODE128</option>
            <option value="CODE39">CODE39</option>
            <option value="EAN13">EAN13</option>
            <option value="UPC">UPC-A</option>
            <option value="MSI">MSI</option>
          </select>
        </div>

        <hr className="border-black/5 my-1" />

        <div className={rowClass}>
          <span className="font-semibold text-sm">Label Radius</span>
          <input type="range" min="0" max="100" value={item.labelRadius ?? 24} onChange={e => updateItem(item.id, { labelRadius: Number(e.target.value) })} className="w-32 accent-zinc-800" />
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Padding</span>
          <input type="range" min="0" max="200" value={item.padding ?? 24} onChange={e => updateItem(item.id, { padding: Number(e.target.value) })} className="w-32 accent-zinc-800" />
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Lock Ratio</span>
          <input type="checkbox" checked={item.lockAspectRatio ?? true} onChange={e => updateItem(item.id, { lockAspectRatio: e.target.checked })} className="w-4 h-4 rounded cursor-pointer accent-zinc-800" />
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Background</span>
          <input type="checkbox" checked={item.showLabel} onChange={e => updateItem(item.id, { showLabel: e.target.checked })} className="w-4 h-4 rounded cursor-pointer accent-zinc-800" />
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Show Digits</span>
          <input type="checkbox" checked={item.showText} onChange={e => updateItem(item.id, { showText: e.target.checked })} className="w-4 h-4 rounded cursor-pointer accent-zinc-800" />
        </div>

        <div className={rowClass}>
          <span className="font-semibold text-sm">Enable Drag</span>
          <input type="checkbox" checked={item.drag} onChange={e => updateItem(item.id, { drag: e.target.checked })} className="w-4 h-4 rounded cursor-pointer accent-zinc-800" />
        </div>

        {isMUL && (
          <div className="flex gap-2 mt-2 border-t border-black/10 pt-2">
            <button onClick={() => copyMulItem(item.id)} className="flex-1 bg-white/50 hover:bg-white rounded py-1.5 text-sm transition-all border border-black/10 shadow-sm font-semibold">Copy</button>
            <button onClick={() => removeMulItem(item.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded py-1.5 text-sm transition-all border border-red-500/20 shadow-sm font-semibold">Delete</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden select-none"
      onClick={() => {
        if (menuOpen) setMenuOpen(false);
        setInlineEditId(null);
        setActiveSubmenu(null);
        setJsonEditorOpen(false);
        setEditingNameId(null);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* HUD Menu Component */}
      <div className="absolute top-4 left-4 z-[9999] flex items-start text-black" onClick={e => {
        e.stopPropagation();
        setActiveSubmenu(null);
        setJsonEditorOpen(false);
        setInlineEditId(null);
        setEditingNameId(null);
      }}>
        <div className="relative">
          {/* Main Trigger & Nav Pills */}
          <div className="h-10 mb-2">
            {triggerVisible && !menuOpen && (
              <button
                onClick={() => setMenuOpen(true)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all border border-white/20 shadow-xl"
              />
            )}
            {menuOpen && (
              <div className="flex bg-white/40 backdrop-blur-2xl border border-white/40 p-1 rounded-full shadow-2xl transition-all h-10 items-center">
                {['Barcode', 'Timer', 'Reminder'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === tab ? 'bg-white shadow text-black' : 'text-zinc-800 hover:bg-white/30'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Barcode Menu (Formerly MUL) */}
          {menuOpen && activeTab === 'Barcode' && (
            <div className="relative w-[300px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl p-3 flex flex-col gap-1.5 font-sans max-h-[80vh] rounded-2xl">
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="font-bold text-lg">Barcodes Config</span>
              </div>

              <button onClick={(e) => { e.stopPropagation(); setJsonText(JSON.stringify(config, null, 2)); setJsonEditorOpen(!jsonEditorOpen); }} className="w-full bg-black/5 hover:bg-black/10 rounded py-2 text-sm font-semibold transition-all mb-1">Edit Config JSON</button>

              <div className="flex flex-col gap-1.5 mt-1 overflow-visible">
                <span className="text-xs font-bold text-black/40 ml-1 tracking-widest uppercase mb-1">Barcodes</span>

                {displayItems.map((item, idx) => (
                  <div key={item.id}
                    className="relative"
                    draggable
                    onDragStart={e => { setDraggedId(item.id); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={e => {
                      e.preventDefault();
                      if (draggedId && draggedId !== item.id) {
                        setVisualOrder(prev => {
                          const arr = [...prev];
                          const dIdx = arr.indexOf(draggedId);
                          const tIdx = arr.indexOf(item.id);
                          if (dIdx > -1 && tIdx > -1) { arr.splice(dIdx, 1); arr.splice(tIdx, 0, draggedId); }
                          return arr;
                        });
                      }
                    }}
                    onDragEnd={() => setDraggedId(null)}
                  >
                    <div
                      onClick={(e) => { e.stopPropagation(); if (!editingNameId) setActiveSubmenu(activeSubmenu === item.id ? null : item.id); }}
                      className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all border ${activeSubmenu === item.id ? 'bg-white shadow text-black border-white/50' : 'bg-transparent hover:bg-black/5 border-transparent text-black/80'} ${draggedId === item.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 max-w-[85%] overflow-hidden">
                        <span className="w-2 h-2 rounded-full shadow-inner flex-shrink-0" style={{ backgroundColor: item.color }} />
                        {editingNameId === item.id ? (
                          <input
                            autoFocus
                            className="text-sm font-medium bg-black/5 w-full outline-none text-black px-1.5 py-1 rounded focus:ring-1 focus:ring-black/20"
                            value={item.name || `Barcode ${idx + 1}`}
                            onChange={e => updateItem(item.id, { name: e.target.value })}
                            onBlur={() => setEditingNameId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingNameId(null)}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="font-medium text-sm truncate select-none cursor-text w-full" onDoubleClick={e => { e.stopPropagation(); setEditingNameId(item.id); }}>
                            {item.name || `Barcode ${idx + 1}`}
                          </span>
                        )}
                      </div>
                      {!editingNameId && <span className="text-black/30 font-bold text-xs ml-1 cursor-pointer">›</span>}
                    </div>
                  </div>
                ))}

                <button onClick={addMulItem} className="w-full mt-2 border border-dashed border-black/20 hover:border-black/40 hover:bg-black/5 text-black/70 font-semibold py-2 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm">
                  <span className="text-lg leading-none">+</span> Add
                </button>
              </div>

              {/* Barcode Child Settings aligned to top of relative parent */}
              {activeSubmenu && activeTab === 'Barcode' && (
                renderItemSettings(config.mul.items.find(i => i.id === activeSubmenu)!, true)
              )}

              {/* JSON Editor Dropdown aligned to top of relative parent */}
              {jsonEditorOpen && (
                <div className="absolute left-[102%] top-0 w-[400px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-2xl p-2 flex flex-col font-sans z-50" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1.5 items-center mb-1.5 px-1 text-black/60">
                    <button onClick={() => navigator.clipboard.writeText(jsonText)} className="hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" title="Copy">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0014.172 2H10a2 2 0 00-2 2zm-4 4v12a2 2 0 002 2h4" /></svg>
                    </button>
                    <button onClick={() => {
                      const url = URL.createObjectURL(new Blob([jsonText], { type: 'application/json' }));
                      const a = document.createElement('a'); a.href = url; a.download = 'config.json'; a.click();
                    }} className="hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" title="Export">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M12 15V3m0 12l-4-4m4 4l4-4" /></svg>
                    </button>
                    <label className="cursor-pointer hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" title="Import">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M12 3v12m0-12l4 4m-4-4l-4 4" /></svg>
                      <input type="file" className="hidden" accept=".json" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = ev => setJsonText(ev.target?.result as string);
                          r.readAsText(file);
                        }
                      }} />
                    </label>
                    <div className="flex-1" />
                    <button onClick={() => setJsonEditorOpen(false)} className="hover:text-red-500 p-1 bg-red-50 hover:bg-red-100 text-red-400 rounded transition-colors" title="Cancel">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button onClick={() => { try { saveConfig(JSON.parse(jsonText)); setJsonEditorOpen(false); } catch { alert("Invalid JSON"); } }} className="hover:text-green-600 p-1 bg-green-50 hover:bg-green-100 text-green-500 rounded transition-colors" title="Confirm">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                    </button>
                  </div>
                  <textarea
                    className="w-full h-[400px] p-3 text-xs sm:text-sm font-mono bg-white/50 rounded-xl border border-black/10 outline-none resize-none focus:ring-1 focus:ring-black/20 text-black/80"
                    value={jsonText} onChange={e => setJsonText(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Timer Menu */}
          {menuOpen && activeTab === 'Timer' && (
            <div className="relative w-[300px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl p-3 flex flex-col gap-2 font-sans max-h-[80vh] overflow-y-auto rounded-2xl">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="font-bold text-lg">Timer Config</span>
                <button onClick={resetTimerConfig} className="px-3 py-1 rounded text-sm font-semibold bg-black/5 hover:bg-black/10 text-black/80 transition-colors">
                  Reset
                </button>
              </div>

              {/* Manual Section */}
              <div className="flex flex-col gap-2 bg-black/5 p-2 rounded-xl">
                <span className="font-bold text-sm">Manual</span>
                <div className="flex gap-1 items-center">
                  {[10, 20, 30, 40, 60].map(val => (
                    <button key={val}
                      onClick={() => saveConfig({ ...config, timer: { ...config.timer, durationMinutes: val } })}
                      className={`flex-1 py-1 rounded text-xs font-semibold border ${config.timer.durationMinutes === val ? 'bg-white shadow-sm border-black/10 text-black' : 'bg-transparent border-transparent text-black/60 hover:bg-black/5'}`}>
                      {val}
                    </button>
                  ))}
                  <input type="number" step="0.1" value={config.timer.durationMinutes} onChange={e => saveConfig({ ...config, timer: { ...config.timer, durationMinutes: Number(e.target.value) } })} className="w-12 px-1 py-1 text-xs bg-white border border-black/10 rounded outline-none flex-shrink-0 text-center" />
                </div>
                {timerMode === 'manual' ? (
                  <div className="flex gap-2">
                    <button onClick={() => setTimerPaused(!timerPaused)} className="flex-1 py-1.5 rounded-lg text-sm font-bold bg-yellow-500 hover:bg-yellow-600 text-white transition-colors">{timerPaused ? 'Resume' : 'Pause'}</button>
                    <button onClick={stopTimer} className="flex-1 py-1.5 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors">Stop</button>
                  </div>
                ) : (
                  <button onClick={startManual} className="w-full py-1.5 rounded-lg text-sm font-bold bg-green-500 hover:bg-green-600 text-white transition-colors">Start Manual</button>
                )}
              </div>

              {/* Auto Section */}
              <div className="flex flex-col gap-2 bg-black/5 p-2 rounded-xl">
                <span className="font-bold text-sm">Auto (Loop)</span>
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] uppercase font-bold text-black/40">Work (min)</span>
                    <input type="number" step="0.1" value={config.timer.autoWorkMinutes} onChange={e => saveConfig({ ...config, timer: { ...config.timer, autoWorkMinutes: Number(e.target.value) } })} className="w-full px-2 py-1 mt-0.5 text-xs bg-white border border-black/10 rounded outline-none" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] uppercase font-bold text-black/40">Wait (min)</span>
                    <input type="number" step="0.1" value={config.timer.autoWaitMinutes} onChange={e => saveConfig({ ...config, timer: { ...config.timer, autoWaitMinutes: Number(e.target.value) } })} className="w-full px-2 py-1 mt-0.5 text-xs bg-white border border-black/10 rounded outline-none" />
                  </div>
                </div>
                {timerMode === 'auto' ? (
                  <div className="flex gap-2">
                    <button onClick={() => setTimerPaused(!timerPaused)} className="flex-1 py-1.5 rounded-lg text-sm font-bold bg-yellow-500 hover:bg-yellow-600 text-white transition-colors">{timerPaused ? 'Resume' : 'Pause'}</button>
                    <button onClick={stopTimer} className="flex-1 py-1.5 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors">Stop</button>
                  </div>
                ) : (
                  <button onClick={startAuto} className="w-full py-1.5 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors">Start Auto</button>
                )}
              </div>

              {/* Global Config Section */}
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex flex-row gap-2 w-full">

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-[11px] truncate">Timer Color</span>
                    <div className="flex gap-1 items-center mt-1">
                      <input type="color" value={config.timer.timerColor} onChange={e => saveConfig({ ...config, timer: { ...config.timer, timerColor: e.target.value } })} className="w-5 h-5 p-0 border-none cursor-pointer bg-transparent shrink-0" />
                      <input type="text" value={config.timer.timerColor} onChange={e => saveConfig({ ...config, timer: { ...config.timer, timerColor: e.target.value } })} className="w-full min-w-0 px-1 py-1 text-xs bg-white/50 border border-black/20 rounded font-mono" />
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-[11px] truncate">Flash Color</span>
                    <div className="flex gap-1 items-center mt-1">
                      <input type="color" value={config.timer.flashColor || '#007AFF'} onChange={e => saveConfig({ ...config, timer: { ...config.timer, flashColor: e.target.value } })} className="w-5 h-5 p-0 border-none cursor-pointer bg-transparent shrink-0" />
                      <input type="text" value={config.timer.flashColor || '#007AFF'} onChange={e => saveConfig({ ...config, timer: { ...config.timer, flashColor: e.target.value } })} className="w-full min-w-0 px-1 py-1 text-xs bg-white/50 border border-black/20 rounded font-mono" />
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-[11px] truncate">Flash (sec)</span>
                    <input type="number" step="0.1" value={config.timer.flashInterval === undefined ? 1 : config.timer.flashInterval} onChange={e => saveConfig({ ...config, timer: { ...config.timer, flashInterval: Number(e.target.value) } })} className="w-full mt-1 px-1 py-1 text-xs bg-white/50 border border-black/20 rounded" />
                  </div>

                </div>
                <div>
                  <span className="font-semibold text-sm">Popup Text</span>
                  <textarea value={config.timer.popupText} onChange={e => saveConfig({ ...config, timer: { ...config.timer, popupText: e.target.value } })} className="w-full mt-1 px-2 py-1 text-sm bg-white/50 border border-black/20 rounded h-16 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Reminder Menu */}
          {menuOpen && activeTab === 'Reminder' && (
            <div className="relative w-[300px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl p-3 flex flex-col gap-2 font-sans max-h-[80vh] overflow-y-auto rounded-2xl">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="font-bold text-lg">Reminder Config</span>
                <button onClick={() => {
                  saveConfig({ ...config, reminder: { ...config.reminder, lastPunchedDate: "" } });
                  setHasPunched(false);
                }} className="px-3 py-1 rounded text-sm font-semibold bg-black/5 hover:bg-black/10 text-black/80 transition-colors">
                  Reset
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <span className="font-semibold text-sm">Refresh Time (HH:mm)</span>
                  <input type="time" value={config.reminder.refreshTime} onChange={e => saveConfig({ ...config, reminder: { ...config.reminder, refreshTime: e.target.value } })} className="w-full mt-1 px-2 py-1 text-sm bg-white/50 border border-black/20 rounded" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Reminder Color</span>
                  <div className="flex gap-2 items-center mt-1">
                    <input type="color" value={config.reminder.reminderColor} onChange={e => saveConfig({ ...config, reminder: { ...config.reminder, reminderColor: e.target.value } })} className="w-6 h-6 p-0 border-none cursor-pointer bg-transparent" />
                    <input type="text" value={config.reminder.reminderColor} onChange={e => saveConfig({ ...config, reminder: { ...config.reminder, reminderColor: e.target.value } })} className="flex-1 px-2 py-1 text-sm bg-white/50 border border-black/20 rounded font-mono" />
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-sm">Popup Text</span>
                  <textarea value={config.reminder.popupText} onChange={e => saveConfig({ ...config, reminder: { ...config.reminder, popupText: e.target.value } })} className="w-full mt-1 px-2 py-1 text-sm bg-white/50 border border-black/20 rounded h-16 resize-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render MUL Canvas */}
      {(config.mul.items || []).map((item) => (
        <BarcodeNode
          key={item.id}
          config={{ ...item, color: getReminderColor(item.color) }}
          onChange={updates => updateItem(item.id, updates)}
          onCopy={() => copyMulItem(item.id)}
          onRemove={() => removeMulItem(item.id)}
          onBringToFront={() => bringToFront(item.id)}
          isActive={activeSubmenu === item.id}
          isInlineEditing={inlineEditId === item.id}
          setInlineEditing={(state) => setInlineEditId(state ? item.id : null)}
          isSglMode={false}
        />
      ))}

      {/* Render Timer Canvas */}
      {timerMode && (
         <BarcodeNode
           key="timer_node"
           config={{
             ...timerBarcodeConfig, 
             color: timeUp ? (flashToggle ? (config.timer?.flashColor || '#007AFF') : (config.timer?.timerColor || '#FF3B30')) : (config.timer?.timerColor || '#FF3B30'),
             staticValue: timerPaused ? formatTimer(timeRemaining) : formatTimer(timeRemaining)
           }}
           onChange={(updates) => saveConfig({...config, timer: {...config.timer, barcodeConfig: {...timerBarcodeConfig, ...updates}}})}
          onCopy={() => { }}
          onRemove={() => { }}
          onBringToFront={() => { }}
          isActive={false}
          isInlineEditing={inlineEditId === 'timer_node'}
          setInlineEditing={(state) => setInlineEditId(state ? 'timer_node' : null)}
          isSglMode={false}
        />
      )}

      {/* Popups */}
      {popupType && (
        <div className="fixed top-20 left-10 p-5 bg-white shadow-2xl border border-black/10 rounded-2xl z-[99999] animate-in slide-in-from-top-10 fade-in w-80 text-black" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-3">{popupType === 'timer' ? 'Timer' : 'Reminder'}</h2>
          <p className="text-sm mb-4 text-black/80">{popupType === 'timer' ? config.timer?.popupText : config.reminder?.popupText}</p>

          {popupType === 'reminder' && (
            <input
              type="date"
              value={reminderInput}
              onChange={e => setReminderInput(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-black/20 rounded-lg text-sm bg-white text-black"
            />
          )}

          <button
            onClick={() => {
              if (popupType === 'timer') {
                setTimeUp(false);
                stopTimer();
                setPopupType(null);
              } else {
                const todayDateStr = new Date().toLocaleDateString('en-CA');
                if (reminderInput.trim() === todayDateStr) {
                  saveConfig({ ...config, reminder: { ...config.reminder, lastPunchedDate: todayDateStr } });
                  setHasPunched(true);
                  setPopupType(null);
                  setReminderInput('');
                } else {
                  alert("Incorrect date! Try again.");
                }
              }
            }}
            className="w-full py-2 bg-black text-white font-medium rounded-lg text-sm hover:bg-black/80 transition-colors"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
