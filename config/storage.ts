/**
 * 配置读写与迁移
 */
"use client";

import { AppConfig } from "./app.config";
import { CONFIG_VERSION, defaultConfig } from "./default";
import { FloatingConfig } from "./floating.config";
import { readRuntime, writeRuntime } from "./runtime";

export const CONFIG_KEYS = {
  barcode: "barcode_config",
  floating: "floating_config",
} as const;

type StoredConfig = Partial<AppConfig> & {
  version?: number;
  floating?: Partial<FloatingConfig> & {
    reminderColors?: string[];
  };
};

export const migrateConfig = (stored?: StoredConfig | null): AppConfig => {
  const legacyReminderColors = stored?.floating?.reminderColors;

  const next: AppConfig = {
    ...defaultConfig,
    ...(stored || {}),
    version: CONFIG_VERSION,
    app: { ...defaultConfig.app, ...(stored?.app || {}) },
    barcodes: { items: stored?.barcodes?.items || defaultConfig.barcodes.items },
    floating: { ...defaultConfig.floating, ...(stored?.floating || {}) },
    timer: {
      ...defaultConfig.timer,
      ...(stored?.timer || {}),
      barcodeConfig: {
        ...defaultConfig.timer.barcodeConfig,
        ...(stored?.timer?.barcodeConfig || {}),
      },
      floatingConfig: {
        ...defaultConfig.timer.floatingConfig,
        ...(stored?.timer?.floatingConfig || {}),
      },
    },
    reminder: {
      ...defaultConfig.reminder,
      ...(stored?.reminder || {}),
      reminderColors: stored?.reminder?.reminderColors || legacyReminderColors || defaultConfig.reminder.reminderColors,
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
  const floating = { ...config.floating } as AppConfig["floating"] & {
    reminderColors?: string[];
  };
  delete floating.reminderColors;

  localStorage.setItem(key, JSON.stringify({
    ...config,
    version: CONFIG_VERSION,
    floating,
    reminder,
  }));
};
