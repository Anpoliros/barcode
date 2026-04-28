/**
 * 条形码配置项数据结构
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
