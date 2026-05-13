/**
 * @file components/AppRuntimeProvider.tsx
 * @description 应用运行态 Provider，保存跨路由共享的 timer 与 reminder 状态。
 */
"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AppRuntime, defaultRuntime, readRuntime, writeRuntime } from "../config/runtime";

type TimerMode = "manual" | "auto" | null;
type AutoPhase = "work" | "wait";

type AppRuntimeContextValue = {
  timer: {
    timerMode: TimerMode;
    setTimerMode: React.Dispatch<React.SetStateAction<TimerMode>>;
    timerPaused: boolean;
    setTimerPaused: React.Dispatch<React.SetStateAction<boolean>>;
    autoPhase: AutoPhase;
    setAutoPhase: React.Dispatch<React.SetStateAction<AutoPhase>>;
    timeUp: boolean;
    setTimeUp: React.Dispatch<React.SetStateAction<boolean>>;
    timeRemaining: number;
    setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
    flashToggle: boolean;
    setFlashToggle: React.Dispatch<React.SetStateAction<boolean>>;
  };
  reminder: {
    lastPunchedDate: string;
    setLastPunchedDate: (date: string) => void;
  };
};

const AppRuntimeContext = createContext<AppRuntimeContextValue | null>(null);

export function AppRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [runtime, setRuntime] = useState<AppRuntime>(() => (
    typeof window === "undefined" ? defaultRuntime : readRuntime()
  ));
  const [timerMode, setTimerMode] = useState<TimerMode>(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [autoPhase, setAutoPhase] = useState<AutoPhase>("work");
  const [timeUp, setTimeUp] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flashToggle, setFlashToggle] = useState(false);

  const setLastPunchedDate = useCallback((date: string) => {
    setRuntime((prev) => {
      const next = {
        ...prev,
        reminder: { ...prev.reminder, lastPunchedDate: date },
      };
      writeRuntime(next);
      return next;
    });
  }, []);

  const value = useMemo<AppRuntimeContextValue>(() => ({
    timer: {
      timerMode,
      setTimerMode,
      timerPaused,
      setTimerPaused,
      autoPhase,
      setAutoPhase,
      timeUp,
      setTimeUp,
      timeRemaining,
      setTimeRemaining,
      flashToggle,
      setFlashToggle,
    },
    reminder: {
      lastPunchedDate: runtime.reminder.lastPunchedDate,
      setLastPunchedDate,
    },
  }), [autoPhase, flashToggle, runtime.reminder.lastPunchedDate, setLastPunchedDate, timeRemaining, timeUp, timerMode, timerPaused]);

  return (
    <AppRuntimeContext.Provider value={value}>
      {children}
    </AppRuntimeContext.Provider>
  );
}

export function useAppRuntime() {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error("useAppRuntime must be used within AppRuntimeProvider");
  }
  return context;
}
