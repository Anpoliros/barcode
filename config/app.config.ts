import { BarcodeItemConfig } from "./barcode.config";
import { FloatingConfig } from "./floating.config";

export type AppConfig = {
  version: number;
  app: {
    defaultMode: "Barcode" | "Floating";
    alignSubmenus?: boolean;
    backgroundColor?: string;
    wakeLock?: boolean;
  };
  barcodes: { items: BarcodeItemConfig[] }; // 多项条形码配置
  floating: FloatingConfig; // 悬浮时钟配置
  timer: {
    durationMinutes: number; // 手动倒计时总长 (分钟)
    autoWorkMinutes: number; // 自动专注时长 (分钟)
    autoWaitMinutes: number; // 自动休息时长 (分钟)
    timerColor: string; // 计时器颜色
    flashColor: string; // 结束闪烁颜色
    flashInterval: number; // 结束闪烁间隔 (秒)
    popupText: string; // 弹出提醒文本
    barcodeConfig: BarcodeItemConfig; // 计时器条形码样式
  };
  reminder: {
    refreshTime: string; // 刷新时间 (HH:mm)
    reminderColor: string; // 待办提醒颜色
    popupText: string; // 提醒弹窗文本
    lastPunchedDate?: string; // 旧配置兼容：运行态已迁移到 runtime
  };
};
