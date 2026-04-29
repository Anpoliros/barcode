/**
 * @file components/floating/FloatingNode.tsx
 * @description 悬浮时钟的单个字符节点。利用 React.memo 避免不必要的重绘。
 */
"use client";
import React, { useEffect, useState, useRef } from "react";

interface FloatingNodeProps {
  char: string;
  opacity?: number;
  temperature?: number;
  className?: string;
  style?: React.CSSProperties;
}

const FloatingNode: React.FC<FloatingNodeProps> = ({ char, opacity = 1, temperature = 0, className, style }) => {
  const [currentChars, setCurrentChars] = useState<{ id: string; char: string; fadingOut: boolean }[]>(() => [
    { id: `char_${Math.random().toString(36).substring(2)}`, char, fadingOut: false },
  ]);

  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0, rotation: 0 });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // 悬浮动画逻辑
    if (temperature <= 0) {
      setFloatOffset({ x: 0, y: 0, rotation: 0 });
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      return;
    }

    const floatCycle = () => {
      // 0-1 的 temperature 映射到范围
      const rangeX = temperature * 10; // 降低一半范围
      const rangeY = temperature * 10;
      const rangeRot = temperature * 7.5;
      
      const speed = 4000 + Math.random() * 4000 - temperature * 2000; // 降低一半速度 (提升耗时)

      setFloatOffset({
        x: (Math.random() - 0.5) * 2 * rangeX,
        y: (Math.random() - 0.5) * 2 * rangeY,
        rotation: (Math.random() - 0.5) * 2 * rangeRot,
      });

      timeoutRef.current = window.setTimeout(floatCycle, speed);
    };

    floatCycle();
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [temperature]);

  useEffect(() => {
    // 时间变动动画逻辑
    setCurrentChars((prev) => {
      const activeChar = prev.find((c) => !c.fadingOut);
      if (activeChar?.char === char) return prev;

      const newId = `char_${Math.random().toString(36).substring(2)}`;
      const updated = prev.map((c) => ({ ...c, fadingOut: true }));
      updated.push({ id: newId, char, fadingOut: false });
      
      // 清理掉已经淡出的字符
      setTimeout(() => {
        setCurrentChars((curr) => curr.filter((c) => c.id === newId || !c.fadingOut));
      }, 1000);

      return updated;
    });
  }, [char]);

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold w-[1em] text-center ${className || ""}`}
      style={{
        ...style,
        opacity,
        transform: `translate(${floatOffset.x}px, ${floatOffset.y}px) rotate(${floatOffset.rotation}deg)`,
        transition: `transform 2s ease-in-out`,
      }}
    >
      {currentChars.map((item) => (
        <span
          key={item.id}
          className="absolute transition-all duration-1000 ease-in-out"
          style={{
            opacity: item.fadingOut ? 0 : 1,
            transform: item.fadingOut ? "translateY(-100%)" : "translateY(0)",
            ...(item.fadingOut ? { filter: "blur(4px)" } : { animation: "nodeFadeInUp 1s ease-out forwards" }),
          }}
        >
          {item.char}
        </span>
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nodeFadeInUp {
          from { opacity: 0; transform: translateY(100%); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: none; }
        }
      `}} />
      {/* 占位符以撑开容器 */}
      <span className="invisible">{char}</span>
    </div>
  );
};

export default React.memo(FloatingNode);
