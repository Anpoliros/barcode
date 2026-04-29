/**
 * @file MenuBar.tsx
 * @description 通用的导航与控制菜单。提供各界面的菜单项扩展接口。
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { defaultConfig } from "../config/defaults";

export interface MenuTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface MenuBarProps {
  /**
   * 除 Mode 以外的额外表项
   */
  tabs?: MenuTab[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  alignSubmenus?: boolean;
  config?: any;
  onConfigSave?: (config: any) => void;
}

export default function MenuBar({ tabs = [], open, onOpenChange, alignSubmenus, config, onConfigSave }: MenuBarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const menuOpen = open !== undefined ? open : internalOpen;

  const setMenuOpen = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  const [triggerVisible, setTriggerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // JSON Config editor states
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  
  const [tabOffsets, setTabOffsets] = useState<{ [id: string]: number }>({});
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);

  // Update tab offsets when rendered
  useEffect(() => {
    if (menuOpen && tabsContainerRef.current) {
      const offsets: { [id: string]: number } = {};
      const containerLeft = tabsContainerRef.current.getBoundingClientRect().left;
      const buttons = tabsContainerRef.current.querySelectorAll("button[data-tab-id]");
      buttons.forEach((btn) => {
        const id = btn.getAttribute("data-tab-id");
        if (id) {
          const btnEl = btn as HTMLElement;
          offsets[id] = btnEl.offsetLeft;
        }
      });
      setTabOffsets(offsets);
    }
  }, [menuOpen, tabs]);

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

  useEffect(() => {
    if (open !== undefined && open !== internalOpen) {
      setInternalOpen(open);
    }
  }, [open, internalOpen]);

  useEffect(() => {
    if (!menuOpen) {
      setActiveTab(null);
    } else {
      if (!activeTab && tabs.length > 0) {
        setActiveTab("Mode");
      }
    }
  }, [menuOpen, tabs.length, activeTab]);

  const allTabs = [
    {
      id: "Mode",
      label: "Mode",
      content: (
        <div className="relative w-[300px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl p-3 flex flex-col gap-2 font-sans rounded-2xl text-black">
          <div className="px-1 mt-1 mb-1">
            <span className="text-xs font-bold text-black/40 tracking-widest uppercase">Modes</span>
          </div>
          <button
            onClick={() => router.push("/barcode")}
            className={`w-full py-2 px-3 rounded-lg text-left text-sm font-semibold transition-all ${
              pathname.includes("/barcode") ? "bg-white shadow text-black border border-white/50" : "bg-transparent hover:bg-black/5 border-transparent text-black/80"
            }`}
          >
            Barcode
          </button>
          <button
            onClick={() => router.push("/floating")}
            className={`w-full py-2 px-3 rounded-lg text-left text-sm font-semibold transition-all ${
              pathname.includes("/floating") ? "bg-white shadow text-black border border-white/50" : "bg-transparent hover:bg-black/5 border-transparent text-black/80"
            }`}
          >
            Floating
          </button>
          {config && onConfigSave && (
            <>
              <hr className="border-black/10 my-1" />
              <button onClick={(e) => { e.stopPropagation(); setJsonText(JSON.stringify(config, null, 2)); setJsonEditorOpen(!jsonEditorOpen); }} className="w-full bg-black/5 hover:bg-black/10 text-black/80 rounded py-2 px-3 text-left text-sm font-semibold transition-all">Edit Config</button>
              {jsonEditorOpen && (
                <div className="absolute left-[102%] top-0 w-[400px] bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-2xl p-2 flex flex-col font-sans z-50 text-black" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1.5 items-center mb-1.5 px-1 text-black/60">
                    <button onClick={() => setJsonText(JSON.stringify(config, null, 2))} className="hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" title="Refresh">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(jsonText)} className="hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" title="Copy">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0014.172 2H10a2 2 0 00-2 2zm-4 4v12a2 2 0 002 2h4" /></svg>
                    </button>
                    <button onClick={() => {
                      const url = URL.createObjectURL(new Blob([jsonText], { type: 'application/json' }));
                      const a = document.createElement('a'); a.href = url; a.download = 'config.json'; a.click();
                    }} className="hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" title="Export">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M12 3v12m0-12l4 4m-4-4l-4 4" /></svg>
                    </button>
                    <label className="cursor-pointer hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" title="Import">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M12 15V3m0 12l-4-4m4 4l4-4" /></svg>
                      <input type="file" className="hidden" accept=".json" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = ev => setJsonText(ev.target?.result as string);
                          r.readAsText(file);
                        }
                      }} />
                    </label>
                    <div className="relative">
                      <button 
                        onClick={() => setShowResetConfirm(!showResetConfirm)} 
                        className="hover:text-black p-1 bg-black/5 hover:bg-black/10 rounded" 
                        title="Reset to Default"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M10 8l6 4-6 4V8z" />
                        </svg>
                      </button>
                      {showResetConfirm && (
                        <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-3xl border border-black/10 shadow-xl rounded-lg p-2 flex flex-col gap-2 z-[60] w-32">
                          <span className="text-xs text-black/60 text-center font-semibold">Reset to Default?</span>
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => setShowResetConfirm(false)} className="px-2 py-1 bg-black/5 hover:bg-black/10 rounded text-xs font-semibold">Cancel</button>
                            <button onClick={() => {
                              setJsonText(JSON.stringify(defaultConfig, null, 2));
                              setShowResetConfirm(false);
                            }} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded text-xs font-semibold">Confirm</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => setJsonEditorOpen(false)} className="hover:text-red-500 p-1 bg-red-50 hover:bg-red-100 text-red-400 rounded transition-colors" title="Cancel">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button onClick={() => { try { onConfigSave(JSON.parse(jsonText)); setJsonEditorOpen(false); } catch { alert("Invalid JSON"); } }} className="hover:text-green-600 p-1 bg-green-50 hover:bg-green-100 text-green-500 rounded transition-colors" title="Confirm">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                    </button>
                  </div>
                  <textarea
                    className="w-full h-[400px] p-3 text-xs sm:text-sm font-mono bg-white/50 rounded-xl border border-black/10 outline-none resize-none focus:ring-1 focus:ring-black/20 text-black/80"
                    value={jsonText} onChange={e => setJsonText(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    ...tabs,
  ];

  const activeContent = allTabs.find((t) => t.id === activeTab)?.content;

  return (
    <div
      className="absolute top-4 left-4 z-[9999] flex items-start text-black"
      onClick={(e) => e.stopPropagation()}
    >
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
            <div ref={tabsContainerRef} className="flex bg-white/40 backdrop-blur-2xl border border-white/40 p-1 rounded-full shadow-2xl transition-all h-10 items-center relative">
              {allTabs.map((tab) => (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white shadow text-black"
                      : "text-zinc-800 hover:bg-white/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Content */}
        {menuOpen && activeTab && activeContent && (
          <div 
            className="mt-2 transition-all duration-200" 
            style={alignSubmenus && tabOffsets[activeTab] ? { transform: `translateX(${tabOffsets[activeTab]}px)` } : {}}
          >
            {activeContent}
          </div>
        )}
      </div>
    </div>
  );
}
