import { useState, useEffect } from "react";
import { AppConfig } from "../config/app.config";

export function useTimer(timerConfig: AppConfig["timer"]) {
  const [timerMode, setTimerMode] = useState<'manual' | 'auto' | null>(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [autoPhase, setAutoPhase] = useState<'work' | 'wait'>('work');
  const [timeUp, setTimeUp] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flashToggle, setFlashToggle] = useState(false);

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
                return Math.round((timerConfig?.autoWaitMinutes || 10) * 60);
              } else {
                setAutoPhase('work');
                setTimeUp(false);
                return Math.round((timerConfig?.autoWorkMinutes || 40) * 60);
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerMode, timerPaused, autoPhase, timeUp, timerConfig]);

  // Flash Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeUp) {
      interval = setInterval(() => {
        setFlashToggle(prev => !prev);
      }, (timerConfig?.flashInterval || 1) * 1000);
    } else {
      setFlashToggle(false);
    }
    return () => clearInterval(interval);
  }, [timeUp, timerConfig?.flashInterval]);

  const startManual = () => {
    setTimerMode('manual');
    setTimerPaused(false);
    setTimeUp(false);
    setTimeRemaining(Math.round((timerConfig?.durationMinutes || 30) * 60));
  };

  const startAuto = () => {
    setTimerMode('auto');
    setTimerPaused(false);
    setAutoPhase('work');
    setTimeUp(false);
    setTimeRemaining(Math.round((timerConfig?.autoWorkMinutes || 40) * 60));
  };

  const stopTimer = () => {
    setTimerMode(null);
    setTimerPaused(false);
    setTimeUp(false);
    setTimeRemaining(0);
  };

  const formatTimer = (totalSeconds: number) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${h}${m}${s}`;
  };

  return {
    state: {
      timerMode,
      timerPaused,
      autoPhase,
      timeUp,
      timeRemaining,
      flashToggle
    },
    actions: {
      setTimerPaused,
      setTimeUp,
      startManual,
      startAuto,
      stopTimer,
      formatTimer
    }
  };
}