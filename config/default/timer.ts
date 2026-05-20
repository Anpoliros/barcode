/**
 * Timer 默认配置
 */
import { AppConfig } from "../app.config";
import { defaultItem } from "./barcode";

const defaultTimerColors = ["#52f63dff", "#009a26ff", "#63e6be", "#9bf2b1", "#d7fbe8"];

export const defaultTimerConfig: AppConfig["timer"] = {
  durationMinutes: 30,
  autoWorkMinutes: 40,
  autoWaitMinutes: 10,
  timerColor: "#FF3B30",
  timerColors: defaultTimerColors,
  flashColor: "#007AFF",
  flashInterval: 1,
  popupText: "Time to stand up!",
  barcodeConfig: {
    ...defaultItem,
    id: "timer_node",
    name: "Countdown",
    position: [0.5, 0.2],
  },
  floatingConfig: {
    id: "timer_floating_string",
    name: "Timer",
    position: [0.06, 0.53],
    size: [0.2, 0.175],
    lockAspectRatio: false,
    alignment: "manual",
    nodeDistribution: [0.14, 0.36, 0.5, 0.64, 0.86],
    color: defaultTimerColors[defaultTimerColors.length - 1],
    colors: {
      [defaultTimerColors[0]]: [1, 4],
      [defaultTimerColors[1]]: [2, 5],
      [defaultTimerColors[defaultTimerColors.length - 1]]: [],
    },
    opacities: {
      "1": [],
    },
    aspectRatios: {
      "1": [],
    },
    verticalOffsets: {
      "0": [],
    },
    zIndices: {
      "0": [],
    },
    temperature: 0.2,
    fontFamily: "var(--font-sn-pro)",
    fontWeight: 900,
    timeFormat: "${HH}:${mm}",
    nodes: [],
  },
};
