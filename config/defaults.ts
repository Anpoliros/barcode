/**
 * 应用配置项默认值
 * 用于初始化和重置应用设置
 */
import { AppConfig } from "./app.config";
import { BarcodeItemConfig } from "./barcode.config";

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
  app: { defaultMode: "Barcode", alignSubmenus: true, backgroundColor: "#0b0b0f", wakeLock: true },
  barcodes: {
    items: [
      { ...defaultItem, id: "mul_1", name: "Time", timeFormat: "HH:mm:ss", position: [0.5, 0.4] as [number, number] },
      { ...defaultItem, id: "mul_2", name: "Date", timeFormat: "yyyy-MM-dd", position: [0.5, 0.6] as [number, number] },
    ],
  },
  floating: {
    groups: [
      {
        id: "float_1",
        name: "Time",
        position: [0.3, 0.4] as [number, number],
        size: [0.4, 0.2] as [number, number], // 40% 宽，20% 高
        nodeDistribution: [0, 0.25, 0.5, 0.75, 1], // 5个字符 HH:mm 的分布
        lockAspectRatio: true,
        color: "#ffffff",
        colors: {
          "#94d3e2": [1, 3],
          "#fcef7a": [2, 4],
          "#ffffff": [],
        },
        fontFamily: "monospace",
        timeFormat: "${HH}:${mm}",
        nodes: []
      }
    ],
    animationStyle: "fly"
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
