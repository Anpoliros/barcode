"use client";

import { useEffect, useRef, useState, PointerEvent } from "react";
import JsBarcode from "jsbarcode";
import { BarcodeItemConfig } from "../../config/barcode.config";

export default function BarcodeNode({
  config,
  onChange,
  onCopy,
  onRemove,
  onBringToFront,
  isActive,
  isInlineEditing,
  setInlineEditing
}: {
  config: BarcodeItemConfig;
  onChange: (updates: Partial<BarcodeItemConfig>) => void;
  onCopy?: () => void;
  onRemove?: () => void;
  onBringToFront?: () => void;
  isActive: boolean;
  isInlineEditing: boolean;
  setInlineEditing: (state: boolean) => void;
}) {
  const [timeStr, setTimeStr] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  // Fallbacks
  const w = config.width || config.size * 2;
  const h = config.height || config.size;
  const rad = config.labelRadius ?? 24;
  const pad = config.padding ?? 24;
  const lock = config.lockAspectRatio ?? true;

  // Time Engine
  useEffect(() => {
    if (config.staticValue !== undefined) {
      setTimeStr(config.staticValue);
      return;
    }
    const updateTime = () => {
      const now = new Date();
      let formatted = config.timeFormat;
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const yyyy = String(now.getFullYear());
      const MM = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');

      formatted = formatted.replace(/hh/g, hh).replace(/mm/g, mm).replace(/ss/g, ss)
                           .replace(/yyyy/g, yyyy).replace(/MM/g, MM).replace(/dd/g, dd);
      setTimeStr(formatted);
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, [config.timeFormat, config.staticValue]);

  // Renderer
  useEffect(() => {
    if (timeStr && svgRef.current) {
      try {
        JsBarcode(svgRef.current, timeStr, {
          format: config.encoding,
          displayValue: config.showText,
          font: config.font,
          background: "transparent",
          lineColor: config.color,
          margin: 0
        });
        const svg = svgRef.current;
        const widthAttr = svg.getAttribute('width');
        const heightAttr = svg.getAttribute('height');
        if (widthAttr && heightAttr && !svg.getAttribute('viewBox')) {
          svg.setAttribute('viewBox', `0 0 ${widthAttr} ${heightAttr}`);
        }
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
      } catch (e) {}
    }
  }, [timeStr, config]);

  // Drag Engine
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPixel = useRef({ x: 0, y: 0 });
  const initPosRef = useRef<[number, number]>([0.5, 0.5]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!config.drag || !dragContainerRef.current) return;
    isDragging.current = true;
    dragStartPixel.current = { x: e.clientX, y: e.clientY };
    initPosRef.current = [...config.position];
    (e.target as Element).setPointerCapture(e.pointerId);
    if (onBringToFront) onBringToFront();
  };
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !dragContainerRef.current) return;
    const dx = e.clientX - dragStartPixel.current.x;
    const dy = e.clientY - dragStartPixel.current.y;
    dragContainerRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  };
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
    
    const dx = e.clientX - dragStartPixel.current.x;
    const dy = e.clientY - dragStartPixel.current.y;
    if (dragContainerRef.current) {
      dragContainerRef.current.style.transform = 'translate(-50%, -50%)';
    }
    onChange({ 
      position: [
        initPosRef.current[0] + dx / window.innerWidth, 
        initPosRef.current[1] + dy / window.innerHeight
      ] 
    });
  };

  // Resize Engine (Bottom-Right)
  const isResizing = useRef(false);
  const resizeStartPixel = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ w: 0, h: 0 });
  const resizeStartPos = useRef<[number, number]>([0, 0]);

  const handleResizeDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStartPixel.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { w, h };
    resizeStartPos.current = [...config.position];
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  
  const calculateNewSizeAndPos = (dx: number, dy: number) => {
    let newW = resizeStartSize.current.w + dx;
    let newH = resizeStartSize.current.h + dy;

    if (lock) {
      const scale = Math.max(newW / resizeStartSize.current.w, newH / resizeStartSize.current.h);
      newW = resizeStartSize.current.w * scale;
      newH = resizeStartSize.current.h * scale;
    }

    newW = Math.max(80, newW);
    newH = Math.max(40, newH);

    const widthDiff = newW - resizeStartSize.current.w;
    const heightDiff = newH - resizeStartSize.current.h;
    
    // adjust pos so that the top-left remains mathematically anchored
    const newPosX = resizeStartPos.current[0] + (widthDiff / 2) / window.innerWidth;
    const newPosY = resizeStartPos.current[1] + (heightDiff / 2) / window.innerHeight;

    return { newW, newH, newPosX, newPosY };
  };

  const handleResizeMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isResizing.current || !dragContainerRef.current) return;
    e.stopPropagation();
    const dx = e.clientX - resizeStartPixel.current.x;
    const dy = e.clientY - resizeStartPixel.current.y;
    
    const { newW, newH, newPosX, newPosY } = calculateNewSizeAndPos(dx, dy);

    dragContainerRef.current.style.width = `${newW}px`;
    dragContainerRef.current.style.height = `${newH}px`;
    dragContainerRef.current.style.left = `${newPosX * 100}%`;
    dragContainerRef.current.style.top = `${newPosY * 100}%`;
  };
  const handleResizeUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isResizing.current) return;
    isResizing.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);

    const dx = e.clientX - resizeStartPixel.current.x;
    const dy = e.clientY - resizeStartPixel.current.y;
    const { newW, newH, newPosX, newPosY } = calculateNewSizeAndPos(dx, dy);

    onChange({ width: newW, height: newH, position: [newPosX, newPosY] });
  };

  const currentZIndex = isActive || isInlineEditing ? Math.max(40, (config.zIndex || 10) + 10) : (config.zIndex || 10);

  return (
    <div 
      ref={dragContainerRef}
      className={`fixed flex flex-col justify-center items-center ${config.drag ? 'cursor-move' : ''} ${config.showLabel ? 'bg-white shadow-2xl' : ''} ${isActive ? 'ring-4 ring-red-500' : ''}`}
      style={{ 
        left: `${config.position[0] * 100}%`,
        top: `${config.position[1] * 100}%`,
        width: `${w}px`,
        height: `${h}px`,
        padding: config.showLabel ? `${pad}px` : '0',
        borderRadius: `${rad}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: currentZIndex,
        boxSizing: 'border-box'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setInlineEditing(true);
        if (onBringToFront) onBringToFront();
      }}
    >
      <svg 
        ref={svgRef} 
        style={{ width: '100%', height: '100%', objectFit: lock ? 'contain' : 'fill' }}
        preserveAspectRatio={lock ? "xMidYMid meet" : "none"}
        className={`pointer-events-none drop-shadow-sm ${!config.showLabel ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`}
      />

      <div 
        className="absolute bottom-0 right-0 w-8 h-8 z-20"
        style={{ cursor: 'se-resize' }}
        onPointerDown={handleResizeDown}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp}
      />

      {/* Inline Settings Modal */}
      {isInlineEditing && (
        <div 
          className="absolute top-0 left-[102%] bg-white/95 backdrop-blur-3xl p-3 rounded-xl shadow-2xl text-black flex flex-col gap-2.5 w-[250px] border border-black/5 cursor-default box-content"
          style={{ zIndex: 100 }}
          onPointerDown={e => e.stopPropagation()}
          onDoubleClick={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          {/* Row 1: colors */}
          <div className="flex justify-between items-center">
            <div className="flex gap-1.5 border p-1 rounded-full border-black/10">
              {['#000000', '#FF3B30', '#34C759', '#FFCC00', '#007AFF'].map(c => (
                <button key={c} onClick={() => onChange({ color: c })} className={`w-4 h-4 rounded-full shadow-sm ${config.color===c?'scale-110 ring-1 ring-black border border-white':'border border-black/10'}`} style={{backgroundColor: c}} />
              ))}
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <input type="color" value={config.color} onChange={e => onChange({ color: e.target.value })} className="w-5 h-5 p-0 border-none cursor-pointer bg-transparent" />
              <input type="text" value={config.color} onChange={e => onChange({ color: e.target.value })} className="w-16 px-1.5 py-1 text-xs bg-black/5 border-transparent rounded font-mono text-center outline-none focus:ring-1 focus:ring-black/20" />
            </div>
          </div>

          {/* Row 2: Text / Encoding */}
          <div className="flex gap-1.5">
            <input type="text" value={config.timeFormat} onChange={e => onChange({ timeFormat: e.target.value })} className="flex-1 px-2 py-1 text-xs bg-black/5 border-transparent rounded w-0 outline-none focus:ring-1 focus:ring-black/20" placeholder="Format" />
            <select value={config.encoding} onChange={e => onChange({ encoding: e.target.value })} className="flex-1 px-1 py-1 text-xs bg-black/5 border-transparent rounded w-0 outline-none focus:ring-1 focus:ring-black/20">
              <option value="CODE128">C128</option>
              <option value="CODE39">C39</option>
              <option value="EAN13">EAN13</option>
              <option value="UPC">UPC</option>
              <option value="MSI">MSI</option>
            </select>
          </div>

          {/* Row 3: label radius & padding */}
          <div className="flex flex-col gap-1.5 border-t border-black/5 pt-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-black/40 w-12">Radius</span>
              <input type="range" min="0" max="100" value={rad} onChange={e => onChange({ labelRadius: Number(e.target.value) })} className="flex-1 accent-black" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-black/40 w-12">Padding</span>
              <input type="range" min="0" max="200" value={pad} onChange={e => onChange({ padding: Number(e.target.value) })} className="flex-1 accent-black" />
            </div>
          </div>

          {/* Row 4: label digits lock toggles */}
          <div className="flex gap-1">
            <button onClick={() => onChange({ showLabel: !config.showLabel })} className={`flex-1 py-1 text-xs items-center justify-center font-medium rounded border transition-all ${config.showLabel ? 'bg-black text-white border-black' : 'bg-white text-black/60 border-black/10 shadow-sm'}`}>Label</button>
            <button onClick={() => onChange({ showText: !config.showText })} className={`flex-1 py-1 text-xs items-center justify-center font-medium rounded border transition-all ${config.showText ? 'bg-black text-white border-black' : 'bg-white text-black/60 border-black/10 shadow-sm'}`}>Digits</button>
            <button onClick={() => onChange({ lockAspectRatio: !lock })} className={`flex-1 py-1 text-xs items-center justify-center font-medium rounded border transition-all ${lock ? 'bg-black text-white border-black' : 'bg-white text-black/60 border-black/10 shadow-sm'}`}>Lock</button>
            <button onClick={() => onBringToFront && onBringToFront()} className="px-2 py-1 text-xs bg-white hover:bg-black/5 border border-black/10 rounded font-medium shadow-sm transition-all" title="Bring to Front">⬆</button>
          </div>

          {/* Row 5: copy delete */}
          {(onCopy || onRemove) && (
          <div className="flex gap-1 pt-1 border-t border-black/5">
            {onCopy && <button onClick={() => { onCopy(); setInlineEditing(false); }} className="flex-1 py-1 text-xs bg-white hover:bg-black/5 rounded text-black font-semibold border border-black/10 shadow-sm">Copy</button>}
            {onRemove && <button onClick={() => { onRemove(); setInlineEditing(false); }} className="flex-1 py-1 text-xs bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold border border-red-200 shadow-sm">Delete</button>}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
