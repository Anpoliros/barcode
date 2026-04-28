/**
 * @file components/floating/FloatingNode.tsx
 * @description 悬浮时钟的单个字符节点。利用 React.memo 避免不必要的重绘。
 */
"use client";
import React from "react";

interface FloatingNodeProps {
  char: string;
  className?: string;
  style?: React.CSSProperties;
}

const FloatingNode: React.FC<FloatingNodeProps> = ({ char, className, style }) => {
  return (
    // 使用 div 作为数字容器，支持后续动画更替
    <div
      className={`relative inline-flex items-center justify-center font-bold w-[1em] text-center transition-all duration-300 ${className || ""}`}
      style={style}
    >
      <span>{char}</span>
    </div>
  );
};

export default React.memo(FloatingNode);
