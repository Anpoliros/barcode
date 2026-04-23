/**
 * 应用配置项默认值
 * 用于初始化和重置应用设置
 */
import { AppConfig, BarcodeItemConfig } from "./config";

export const defaultItem: Omit<BarcodeItemConfig, "id"> = {
  name: "Barcode",
  color: "#000000",
  timeFormat: "hhmmss",
  encoding: "CODE128",
  size: 100,
  width: 250,
  height: 120,
  lockAspectRatio: true,
  labelRadius: 24,
  padding: 24,
  zIndex: 10,
  showLabel: true,
  showText: true,
  font: "monospace",
  drag: true,
  position: [0.5, 0.5],
};

export const defaultConfig: AppConfig = {
  app: { mode: "Barcode", uiDesign: "rounded" },
  mul: {
    items: [
      { ...defaultItem, id: "mul_1", name: "Time", timeFormat: "HH:mm:ss", position: [0.5, 0.4] as [number, number] },
      { ...defaultItem, id: "mul_2", name: "Date", timeFormat: "yyyy-MM-dd", position: [0.5, 0.6] as [number, number] },
    ],
  },
  timer: {
    durationMinutes: 30, // manual mode default
    autoWorkMinutes: 40,
    autoWaitMinutes: 10,
    timerColor: "#FF3B30",
    flashColor: "#007AFF", 
    flashInterval: 1,
    popupText: "Time to stand up!",
    barcodeConfig: {
      ...defaultItem,
      id: "timer_node",
      name: "Countdown",
      position: [0.5, 0.2] as [number, number],
    }
  },
  reminder: {
    refreshTime: "04:00",
    reminderColor: "#34C759",
    popupText: "Have you punched in today? Please enter the current date (YYYY-MM-DD) to confirm.",
    lastPunchedDate: "",
  }
};
