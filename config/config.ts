/**
 * 配置文件类型定义
 * 包含应用整体配置及条形码/计时器/提醒事项的数据结构
 */

export type BarcodeItemConfig = {
  id: string; // 唯一标识符
  name?: string; // 别名或名称
  color: string; // 颜色
  timeFormat: string; // 时间格式
  staticValue?: string; // 静态值（用于倒计时显示）
  encoding: string; // 编码类型 (如 CODE128)
  size: number; // 尺寸 (兼容旧版)
  width?: number; // 实际像素宽度
  height?: number; // 实际像素高度
  lockAspectRatio?: boolean; // 是否锁定长宽比
  labelRadius?: number; // 背景圆角
  padding?: number; // 边距
  zIndex?: number; // 层级
  showLabel: boolean; // 是否显示背景标签
  showText: boolean; // 是否显示底部文字
  font: string; // 字体
  drag: boolean; // 是否可拖拽
  position: [number, number]; // 坐标位置 [x, y]
};

export type AppConfig = {
  app: { mode: "Barcode"; uiDesign: "rounded" | "minimal" };
  mul: { items: BarcodeItemConfig[] }; // 多项条形码配置
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
    lastPunchedDate: string; // 最后打卡日期 (YYYY-MM-DD)
  };
};
