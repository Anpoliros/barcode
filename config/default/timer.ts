/**
 * Timer 默认配置
 */
import { AppConfig } from "../app.config";
import { defaultItem } from "./barcode";

export const defaultTimerConfig: AppConfig["timer"] = {
  durationMinutes: 30,
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
    position: [0.5, 0.2],
  },
};
