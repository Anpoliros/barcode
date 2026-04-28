"use client";

import { useEffect, useState } from "react";
import MenuBar from "../MenuBar";
import BarcodeNode from "./BarcodeNode";
import { AppConfig } from "../../config/app.config";
import { BarcodeItemConfig } from "../../config/barcode.config";
import { defaultConfig, defaultItem } from "../../config/defaults";
import { useTimer } from "../../hooks/useTimer";
import { useReminder } from "../../hooks/useReminder";

// --- Main App ---
export default function BarcodeView() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [hydrated, setHydrated] = useState(false);

  // UI States
  const [menuOpen, setMenuOpen] = useState(false);

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);

  const [visualOrder, setVisualOrder] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Use Custom Hooks
  const timerHook = useTimer(config.timer);
  const { timerMode, timerPaused, timeUp, timeRemaining, flashToggle } = timerHook.state;
  const { setTimerPaused, setTimeUp, startManual, startAuto, stopTimer, formatTimer } = timerHook.actions;

  const reminderHook = useReminder(config.reminder);
  const { hasPunched } = reminderHook.state;
  const { setHasPunched } = reminderHook.actions;

  // Popup States
  const [popupType, setPopupType] = useState<'timer' | 'reminder' | null>(null);
  const [reminderInput, setReminderInput] = useState('');

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
          barcodes: { items: parsed?.barcodes?.items || prev.barcodes.items },
          timer: { ...prev.timer, ...(parsed.timer || {}) },
          reminder: { ...prev.reminder, ...(parsed.reminder || {}) }
        }));
      } catch (e) { }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const items = config.barcodes.items || [];
    setVisualOrder(items.map(i => i.id));
  }, [hydrated, config.barcodes.items?.length]);

  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem("barcode_config", JSON.stringify(newConfig));
  };
  const updateApp = (key: keyof AppConfig["app"], value: any) => saveConfig({ ...config, app: { ...config.app, [key]: value } });

  // Helpers
  const addBarcodeItem = () => {
    const newItem = { ...defaultItem, id: 'mul_' + Date.now(), drag: true };
    saveConfig({ ...config, barcodes: { ...config.barcodes, items: [...(config.barcodes.items || []), newItem] } });
  };
  const updateItem = (id: string, updates: Partial<BarcodeItemConfig>) => {
    const items = config.barcodes.items || [];
    const newItems = items.map(i => i.id === id ? { ...i, ...updates } : i);
    saveConfig({ ...config, barcodes: { ...config.barcodes, items: newItems } });
  };
  const removeBarcodeItem = (id: string) => {
    const items = config.barcodes.items || [];
    const newItems = items.filter(i => i.id !== id);
    saveConfig({ ...config, barcodes: { ...config.barcodes, items: newItems } });
    if (activeSubmenu === id) setActiveSubmenu(null);
  };
  const copyBarcodeItem = (id: string) => {
    const items = config.barcodes.items || [];
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newItem = { ...item, id: 'mul_' + Date.now(), position: [item.position[0] + 0.05, item.position[1] + 0.05] as [number, number] };
    saveConfig({ ...config, barcodes: { ...config.barcodes, items: [...items, newItem] } });
  };
  const bringToFront = (id: string) => {
    const maxZ = Math.max(0, ...(config.barcodes.items || []).map(i => i.zIndex || 10));
    updateItem(id, { zIndex: maxZ + 1 });
  };


  const resetTimerConfig = () => {
    saveConfig({ ...config, timer: { ...defaultConfig.timer, barcodeConfig: config.timer.barcodeConfig } });
    stopTimer();
  };

  if (!hydrated) return null;

  const displayItems = (config.barcodes.items || []).slice().sort((a, b) => {
    const iA = visualOrder.indexOf(a.id);
    const iB = visualOrder.indexOf(b.id);
    return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
  });

  const renderItemSettings = (item: BarcodeItemConfig) => {
    const wrapper = `flex flex-col gap-2 p-3 bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-2xl w-[280px] absolute left-[102%] top-0 z-50 text-black/80`;
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

        <div className="flex gap-2 mt-2 border-t border-black/10 pt-2">
          <button onClick={() => copyBarcodeItem(item.id)} className="flex-1 bg-white/50 hover:bg-white rounded py-1.5 text-sm transition-all border border-black/10 shadow-sm font-semibold">Copy</button>
          <button onClick={() => removeBarcodeItem(item.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded py-1.5 text-sm transition-all border border-red-500/20 shadow-sm font-semibold">Delete</button>
        </div>
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
        setEditingNameId(null);
      }}
      onDoubleClick={handleDoubleClick}
    >
      <MenuBar 
        open={menuOpen}
        onOpenChange={setMenuOpen}
        alignSubmenus={config.app.alignSubmenus ?? true}
        config={config}
        onConfigSave={saveConfig}
        tabs={[
          {
            id: 'Barcode',
            label: 'Barcode',
            content: (
              <div className="relative w-[300px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl p-3 flex flex-col gap-1.5 font-sans max-h-[80vh] rounded-2xl">
                <div className="flex justify-between items-center mb-1 px-1">
                  <span className="font-bold text-lg">Barcodes Config</span>
                </div>

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

                <button onClick={addBarcodeItem} className="w-full mt-2 border border-dashed border-black/20 hover:border-black/40 hover:bg-black/5 text-black/70 font-semibold py-2 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm">
                  <span className="text-lg leading-none">+</span> Add
                </button>
              </div>

              {/* Barcode Child Settings aligned to top of relative parent */}
              {activeSubmenu && (
                renderItemSettings(config.barcodes.items.find(i => i.id === activeSubmenu)!)
              )}
            </div>
          )},
          {
            id: 'Timer',
            label: 'Timer',
            content: (
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
          )},
          {
            id: 'Reminder',
            label: 'Reminder',
            content: (
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
        ]}
      />

      {/* Render MUL Canvas */}
      {(config.barcodes.items || []).map((item) => (
        <BarcodeNode
          key={item.id}
          config={{ ...item, color: getReminderColor(item.color) }}
          onChange={updates => updateItem(item.id, updates)}
          onCopy={() => copyBarcodeItem(item.id)}
          onRemove={() => removeBarcodeItem(item.id)}
          onBringToFront={() => bringToFront(item.id)}
          isActive={activeSubmenu === item.id}
          isInlineEditing={inlineEditId === item.id}
          setInlineEditing={(state) => setInlineEditId(state ? item.id : null)}
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
          isActive={false}
          isInlineEditing={inlineEditId === 'timer_node'}
          setInlineEditing={(state) => setInlineEditId(state ? 'timer_node' : null)}
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
