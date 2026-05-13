/**
 * 默认配置组合入口
 */
import { AppConfig } from "../app.config";
import { defaultAppConfig } from "./app";
import { defaultBarcodeConfig, defaultItem } from "./barcode";
import { defaultFloatingConfig } from "./floating";
import { defaultTimerConfig } from "./timer";
import { defaultReminderConfig } from "./reminder";

export const CONFIG_VERSION = 1;

export const defaultConfig: AppConfig = {
  version: CONFIG_VERSION,
  app: defaultAppConfig,
  barcodes: defaultBarcodeConfig,
  floating: defaultFloatingConfig,
  timer: defaultTimerConfig,
  reminder: defaultReminderConfig,
};

export {
  defaultAppConfig,
  defaultBarcodeConfig,
  defaultFloatingConfig,
  defaultItem,
  defaultReminderConfig,
  defaultTimerConfig,
};
