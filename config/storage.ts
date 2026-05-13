/**
 * 配置读写与迁移
 */
"use client";

import { AppConfig } from "./app.config";
import { CONFIG_VERSION, defaultConfig } from "./default";
import { readRuntime, writeRuntime } from "./runtime";

export const CONFIG_KEYS = {
  barcode: "barcode_config",
  floating: "floating_config",
} as const;

type StoredConfig = Partial<AppConfig> & {
  version?: number;
};

export const migrateConfig = (stored?: StoredConfig | null): AppConfig => {
  const next: AppConfig = {
    ...defaultConfig,
    ...(stored || {}),
    version: CONFIG_VERSION,
    app: { ...defaultConfig.app, ...(stored?.app || {}) },
    barcodes: { items: stored?.barcodes?.items || defaultConfig.barcodes.items },
    floating: { ...defaultConfig.floating, ...(stored?.floating || {}) },
    timer: { ...defaultConfig.timer, ...(stored?.timer || {}) },
    reminder: {
      ...defaultConfig.reminder,
      ...(stored?.reminder || {}),
      lastPunchedDate: undefined,
    },
  };

  return next;
};

export const readConfig = (key: string): AppConfig | null => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as StoredConfig;
    const legacyLastPunchedDate = parsed.reminder?.lastPunchedDate;
    if (legacyLastPunchedDate) {
      const runtime = readRuntime();
      writeRuntime({
        ...runtime,
        reminder: { ...runtime.reminder, lastPunchedDate: legacyLastPunchedDate },
      });
    }
    return migrateConfig(parsed);
  } catch {
    return null;
  }
};

export const writeConfig = (key: string, config: AppConfig) => {
  const reminder = { ...config.reminder };
  delete reminder.lastPunchedDate;
  localStorage.setItem(key, JSON.stringify({
    ...config,
    version: CONFIG_VERSION,
    reminder,
  }));
};
