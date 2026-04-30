/**
 * @file components/floating/FloatingNode.tsx
 * @description 悬浮时钟的单个字符节点。利用 React.memo 避免不必要的重绘。
 */
"use client";
import React, { useEffect, useState, useRef } from "react";

type FloatingCharState = {
  id: string;
  char: string;
  fadingOut: boolean;
};

export type FloatingNodeStabilizationPulse = {
  id: number;
  direction: -1 | 0 | 1;
  strength: number;
  distance: number;
};

type FloatingOffset = {
  x: number;
  y: number;
  rotation: number;
};

interface FloatingNodeProps {
  char: string;
  opacity?: number;
  temperature?: number;
  animation?: "fly" | "fade";
  aspectRatio?: number;
  verticalOffset?: number;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  stabilizationPulse?: FloatingNodeStabilizationPulse | null;
}

const createCharId = () => `char_${Math.random().toString(36).substring(2)}`;

const createFloatOffset = (nextTemperature: number): FloatingOffset => ({
  x: (Math.random() - 0.5) * 2 * nextTemperature * 20,
  y: (Math.random() - 0.5) * 2 * nextTemperature * 20,
  rotation: (Math.random() - 0.5) * 2 * nextTemperature * 15,
});

const createFloatDuration = () => 3000 + Math.random() * 2000;

const FloatingNode: React.FC<FloatingNodeProps> = ({
  char,
  opacity = 1,
  temperature = 0,
  animation = "fly",
  aspectRatio = 1,
  verticalOffset = 0,
  zIndex = 0,
  className,
  style,
  stabilizationPulse,
}) => {
  // #----字符切换状态----
  const [currentChars, setCurrentChars] = useState<FloatingCharState[]>(() => [
    { id: createCharId(), char, fadingOut: false },
  ]);

  // #----漂浮状态----
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0, rotation: 0 });
  const [transformTransition, setTransformTransition] = useState("transform 3600ms ease-in-out");
  const floatTimeoutRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const cleanupCharTimeoutRef = useRef<number | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const runFloatCycleRef = useRef<(() => void) | null>(null);

  // #----计时器工具----
  const clearFloatTimeout = () => {
    if (floatTimeoutRef.current) {
      window.clearTimeout(floatTimeoutRef.current);
      floatTimeoutRef.current = null;
    }
  };

  const clearSettleTimeout = () => {
    if (settleTimeoutRef.current) {
      window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  };

  const clearResumeTimeout = () => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const clearPulseFrame = () => {
    if (pulseFrameRef.current) {
      window.cancelAnimationFrame(pulseFrameRef.current);
      pulseFrameRef.current = null;
    }
  };

  useEffect(() => {
    // #----悬浮动画----
    if (temperature <= 0) {
      clearFloatTimeout();
      clearSettleTimeout();
      clearResumeTimeout();
      runFloatCycleRef.current = null;
      settleTimeoutRef.current = window.setTimeout(() => {
        setTransformTransition("transform 320ms ease-out");
        setFloatOffset({ x: 0, y: 0, rotation: 0 });
      }, 0);
      return;
    }

    const performFloatCycle = () => {
      const duration = createFloatDuration();
      setTransformTransition(`transform ${duration}ms ease-in-out`);
      setFloatOffset(createFloatOffset(temperature));
      floatTimeoutRef.current = window.setTimeout(performFloatCycle, duration);
    };

    runFloatCycleRef.current = performFloatCycle;
    performFloatCycle();

    return () => {
      clearFloatTimeout();
      clearSettleTimeout();
      clearResumeTimeout();
      clearPulseFrame();
      runFloatCycleRef.current = null;
    };
  }, [temperature]);

  useEffect(() => {
    // #----字符切换----
    setCurrentChars((prev) => {
      const activeChar = prev.find((c) => !c.fadingOut);
      if (activeChar?.char === char) {
        return prev;
      }

      const newId = createCharId();
      const updated = prev.map((c) => ({ ...c, fadingOut: true }));
      updated.push({ id: newId, char, fadingOut: false });
      
      // 清理掉已经淡出的字符
      if (cleanupCharTimeoutRef.current) {
        window.clearTimeout(cleanupCharTimeoutRef.current);
      }

      cleanupCharTimeoutRef.current = window.setTimeout(() => {
        setCurrentChars((curr) => curr.filter((c) => c.id === newId || !c.fadingOut));
      }, 1000);

      return updated;
    });
  }, [char]);

  useEffect(() => {
    // #----外部回正脉冲----
    if (!stabilizationPulse || stabilizationPulse.id <= 0 || stabilizationPulse.strength <= 0 || temperature <= 0) {
      return;
    }

    const direction = stabilizationPulse.direction;
    if (direction === 0) {
      return;
    }

    clearFloatTimeout();
    clearSettleTimeout();
    clearResumeTimeout();
    clearPulseFrame();

    const impulseStrength = stabilizationPulse.strength * temperature;
    const impulseX = direction * (14 + impulseStrength * 28);
    const impulseY = -Math.min(8, stabilizationPulse.distance * 2);
    const impulseRotation = direction * (4 + impulseStrength * 10);

    pulseFrameRef.current = window.requestAnimationFrame(() => {
      setTransformTransition("transform 520ms cubic-bezier(0.22, 1, 0.36, 1)");
      setFloatOffset({
        x: impulseX,
        y: impulseY,
        rotation: impulseRotation,
      });
    });

    settleTimeoutRef.current = window.setTimeout(() => {
      setTransformTransition("transform 520ms cubic-bezier(0.16, 1, 0.3, 1)");
      setFloatOffset({ x: 0, y: 0, rotation: 0 });
      resumeTimeoutRef.current = window.setTimeout(() => {
        runFloatCycleRef.current?.();
      }, 520 + stabilizationPulse.distance * 120);
    }, 180);
  }, [stabilizationPulse, temperature]);

  useEffect(() => {
    return () => {
      clearFloatTimeout();
      clearSettleTimeout();
      clearResumeTimeout();
      clearPulseFrame();
      if (cleanupCharTimeoutRef.current) {
        window.clearTimeout(cleanupCharTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold w-[1em] text-center leading-none ${className || ""}`}
      style={{
        ...style,
        opacity,
        zIndex,
        transform: `translate(${floatOffset.x}px, ${floatOffset.y}px) rotate(${floatOffset.rotation}deg) translateY(${-verticalOffset * 100}%) scaleX(${aspectRatio})`,
        transition: transformTransition,
      }}
    >
      {currentChars.map((item) => {
        let enterAnimation = "";
        let exitTransform = "";
        let exitOpacity = 0;
        let exitFilter = "none";
        
        if (animation === "fly") {
          enterAnimation = "nodeFlyIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards";
          exitTransform = item.fadingOut ? "translateY(-100%)" : "translateY(0)";
          exitOpacity = item.fadingOut ? 0 : 1;
        } else {
          // fade / crossfade
          enterAnimation = "nodeFadeIn 0.8s ease-out forwards";
          exitTransform = "translateY(0)";
          exitOpacity = item.fadingOut ? 0 : 1;
          exitFilter = item.fadingOut ? "blur(6px)" : "none";
        }
        
        return (
          <span
            key={item.id}
            className="absolute transition-all duration-1000"
            style={{
              opacity: exitOpacity,
              transform: exitTransform,
              filter: exitFilter,
              ...(item.fadingOut ? {} : { animation: enterAnimation }),
            }}
          >
            {item.char}
          </span>
        );
      })}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nodeFlyIn {
          0% { opacity: 0; transform: translateY(100%); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes nodeFadeIn {
          from { opacity: 0; filter: blur(4px); }
          to { opacity: 1; filter: none; }
        }
      `}} />
      {/* 占位符以撑开容器 */}
      <span className="invisible">{char}</span>
    </div>
  );
};

export default React.memo(FloatingNode);
