/**
 * @file config/floating.config.ts
 * @description Floating 屏保的配置类型与默认值。
 */

export interface FloatingNodeConfig {
  id: string;
  char: string;
  color: string;
  fontSize: number; // css fontSize like 10vw or 100px mapped via ratio
  fontFamily: string;
  fontWeight: string | number;
  glassEffect?: boolean;
}

export interface FloatingGroupConfig {
  id: string;
  name?: string;
  position: [number, number]; // [x_ratio, y_ratio], 0-1 (左上角)
  size: [number, number]; // [width_ratio, height_ratio], 0-1 (宽和高)
  alignment?: "auto" | "manual"; // 自动均分或手动控制分布
  nodeDistribution: number[]; // 各个node中心位置相对宽度的百分比 [0, 0.25, 0.5, 0.75, 1]
  lockAspectRatio?: boolean;
  color?: string; // 兼容旧配置的默认颜色
  colors?: Record<string, number[]>;
  opacities?: Record<string, number[]>;
  aspectRatios?: Record<string, number[]>;
  verticalOffsets?: Record<string, number[]>;
  zIndices?: Record<string, number[]>;
  temperature?: number; // 0-1, 悬浮动画激烈程度
  animation?: "fly" | "fade";
  // 颜色映射，最后一项作为默认色
  fontFamily?: string; // default font
  fontWeight?: string | number; // default font weight
  timeFormat: string; // usually 'HH:mm' or similar to derive characters
  nodes: FloatingNodeConfig[]; // list of characters
}

export interface FloatingConfig {
  groups: FloatingGroupConfig[];
  animationStyle: "fly" | "crossfade" | "none"; // Animation Style Enum from swift
}
