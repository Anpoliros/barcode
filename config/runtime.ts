/**
 * 运行态读写
 */
"use client";

export type AppRuntime = {
  version: number;
  reminder: {
    lastPunchedDate: string;
  };
};

export const RUNTIME_KEY = "app_runtime";
export const RUNTIME_VERSION = 1;

export const defaultRuntime: AppRuntime = {
  version: RUNTIME_VERSION,
  reminder: {
    lastPunchedDate: "",
  },
};

export const readRuntime = (): AppRuntime => {
  try {
    const saved = localStorage.getItem(RUNTIME_KEY);
    if (!saved) return defaultRuntime;
    const parsed = JSON.parse(saved) as Partial<AppRuntime>;
    return {
      ...defaultRuntime,
      ...parsed,
      version: RUNTIME_VERSION,
      reminder: { ...defaultRuntime.reminder, ...(parsed.reminder || {}) },
    };
  } catch {
    return defaultRuntime;
  }
};

export const writeRuntime = (runtime: AppRuntime) => {
  localStorage.setItem(RUNTIME_KEY, JSON.stringify({ ...runtime, version: RUNTIME_VERSION }));
};
