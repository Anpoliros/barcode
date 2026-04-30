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
    "items": [
      {
        "id": "main_green",
        "color": "#00ff00",
        "timeFormat": "69700hhmmss0",
        "encoding": "EAN13",
        "size": 175.5,
        "showLabel": false,
        "showText": true,
        "font": "monospace",
        "drag": true,
        "position": [
          0.268750017339533,
          0.3740740946246318
        ],
        "zIndex": 234,
        "width": 591,
        "height": 295.5
      },
      {
        "id": "side_blue",
        "color": "#007AFF",
        "timeFormat": "hhmmss",
        "encoding": "CODE39",
        "size": 82,
        "showLabel": false,
        "showText": false,
        "font": "monospace",
        "drag": true,
        "position": [
          0.40312496532093395,
          0.6331311721712635
        ],
        "zIndex": 216,
        "width": 292,
        "height": 107.56326530612246,
        "lockAspectRatio": true
      },
      {
        "id": "bottom_white",
        "name": "Barcode",
        "color": "#ffffff",
        "timeFormat": "hhmmss",
        "encoding": "CODE39",
        "size": 100,
        "width": 158,
        "height": 85.44,
        "lockAspectRatio": true,
        "labelRadius": 24,
        "zIndex": 227,
        "showLabel": false,
        "showText": true,
        "font": "monospace",
        "drag": true,
        "position": [
          0.07708333622325544,
          0.8664074074074073
        ],
      },
    ]
  },
  floating: {
    groups: [
      {
        "id": "floating_clock",
        "name": "Time",
        "position": [
          0.059374999999999956,
          0.17729257641921398
        ],
        "size": [
          0.46977907854984885,
          0.2802442166314013
        ],
        "lockAspectRatio": false,
        "alignment": "manual",
        "nodeDistribution": [
          0.14,
          0.38,
          0.5,
          0.62,
          0.86
        ],
        color: "#ffffff",
        colors: {
          "#204eb7": [1, 4],
          "#5398dc": [2, 5],
          "#ffffff": [],
        },
        opacities: {
          "0.9": [3],
          "0.8": [],
        },
        "verticalOffsets": {
          "0.2": [3],
          "0": []
        },
        "aspectRatios": {
          "1": []
        },
        "zIndices": {
          "1": [3],
          "0": []
        },
        temperature: 0.2,
        fontFamily: 'var(--font-sn-pro)',
        fontWeight: 900, // 试一试 Bold
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
    reminderColor: "#FF3B30",
    popupText: "Have you punched in today? Please enter the current date (YYYY-MM-DD) to confirm.",
    lastPunchedDate: "",
  }
};
