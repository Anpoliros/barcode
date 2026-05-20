/**
 * Floating 屏保默认配置
 */
import { FloatingConfig } from "../floating.config";

export const defaultFloatingConfig: FloatingConfig = {
  groups: [
    {
      id: "floating_clock",
      name: "Time",
      position: [0.06, 0.14],
      size: [0.40, 0.35],
      lockAspectRatio: false,
      alignment: "manual",
      nodeDistribution: [0.14, 0.36, 0.5, 0.64, 0.86],
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
      verticalOffsets: {
        "0.2": [3],
        "0": [],
      },
      aspectRatios: {
        "1": [],
      },
      zIndices: {
        "1": [3],
        "0": [],
      },
      temperature: 0.2,
      fontFamily: "var(--font-sn-pro)",
      fontWeight: 900,
      timeFormat: "${HH}:${mm}",
      nodes: [],
    },
  ],
  animationStyle: "fly",
};
