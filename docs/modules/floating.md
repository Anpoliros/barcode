# Floating 模块

本文档说明悬浮时钟屏保的职责、配置模型、交互入口和修改注意事项。

## 模块视角

Floating 模式将格式化后的时间字符串拆成字符节点，在全屏空间内以漂浮动画展示。它强调可调排版、节点级颜色/透明度/层级映射和柔和动效。

模块负责：

- 渲染一个或多个 floating group。
- 将 `timeFormat` 转换为字符节点。
- 支持字符串组拖拽、缩放、复制、删除和快速配置。
- 支持节点分布、颜色、透明度、纵向偏移、宽高比和层级映射。
- 支持未打卡 reminder 显示态，将时间字符串在一分钟内随机替换为 `punch`。
- 支持与 barcode 一致的 Timer/Reminder 菜单入口。
- 将用户配置保存到 `localStorage` 的 `floating_config`。

模块复用全局 timer/reminder 运行态，并维护 floating 自身的显示和配置。

## 实现视角

| 文件 | 职责 |
| --- | --- |
| `app/floating/page.tsx` | floating 专用路由，渲染 `FloatingView`。 |
| `components/floating/FloatingView.tsx` | floating 主视图，负责配置、菜单和 group 列表。 |
| `components/floating/FloatingString.tsx` | 单条字符串组，负责时间格式化、reminder punch 循环、节点属性映射、拖拽缩放和快速配置。 |
| `components/floating/FloatingNode.tsx` | 单个字符节点，负责视觉样式和动画。 |
| `config/floating.config.ts` | floating 类型与默认 floating 配置。 |
| `config/default/` | 默认 floating group 与 `reminderColors`。 |
| `components/AppRuntimeProvider.tsx` | 跨路由共享 timer 运行态和 reminder 打卡日期。 |
| `hooks/useReminder.ts` | 判断当天是否已打卡。 |
| `hooks/useTimer.ts` | 提供 floating Timer 菜单的共享运行态。 |

`docs/floatingclock-swift/` 是已有 Swift 参考实现，可以作为动效和配置概念的历史材料，但当前 Web 实现以 `components/floating/` 为准。

## 数据模型

`FloatingGroupConfig` 的关键字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 字符串组唯一标识。 |
| `position` | `[x_ratio, y_ratio]`，表示 group 左上角比例坐标。 |
| `size` | `[width_ratio, height_ratio]`，表示 group 占屏幕比例。 |
| `alignment` | `auto` 自动均分或 `manual` 手动使用 `nodeDistribution`。 |
| `nodeDistribution` | 字符节点在 group 宽度方向的中心分布。 |
| `timeFormat` | 时间格式，支持 `${HH}` 形式和裸 token。 |
| `colors` | 颜色到节点序号数组的映射，最后一项作为默认值。 |
| `opacities` | 透明度到节点序号数组的映射，最后一项作为默认值。 |
| `aspectRatios` | 节点宽高比映射。 |
| `verticalOffsets` | 节点垂直偏移映射。 |
| `zIndices` | 节点层级映射。 |
| `temperature` | 动画激烈程度，约定为 `0-1`。 |

节点序号从 `1` 开始，而 React 数组索引从 `0` 开始。修改映射逻辑时要特别留意这个差异。

`FloatingConfig` 还包含 `reminderColors`，用于配置 `punch` 字母的独立颜色序列。默认值在 `config/default/floating.ts` 的 `floating.reminderColors`。

## Reminder 显示态

`FloatingView` 使用 `useReminder(config.reminder)` 判断是否未打卡。配置初始化时会优先读取 `floating_config`，并尝试从 `barcode_config.reminder` 合并 reminder 配置；最后打卡日期来自 `app_runtime`。

floating 中双击屏幕空白处会打开与 barcode 一致的 reminder 确认弹窗。确认成功后会写入 `app_runtime`，切换到 barcode 后不需要重新打卡。

未打卡时，`FloatingString` 不修改用户配置，只在显示层执行一分钟循环：

- 每分钟生成一套随机替换计划。
- `p`、`u`、`n`、`c`、`h` 按顺序出现，但替换到字符串中的位置随机。
- 第五个字母会在第 40 秒前出现，之后保持完整 `punch` 到下一分钟。
- reminder 字母使用 `floating.reminderColors` 配置的独立主题色。
- reminder 激活期间节点分布强制使用 auto，避免 punch 字母挤在一起。

## Timer 菜单

Floating 模式包含与 barcode 基本一致的 Timer 菜单，可配置手动倒计时、自动工作/休息时间、颜色、闪烁间隔和弹窗文案。timer 运行态由 `AppRuntimeProvider` 共享，切换到 barcode 后会继承；timer 配置会随 floating 保存同步写入 `barcode_config`。

## 修改指南

- 修改配置菜单或 group 新增/复制/删除逻辑时，优先看 `FloatingView`。
- 修改时间格式解析、节点属性映射、拖拽缩放和快速配置时，优先看 `FloatingString`。
- 修改未打卡动效时，优先看 `FloatingString` 中的 reminder plan 生成和显示态构造逻辑。
- 修改 reminder/timer 配置同步时，检查 `FloatingView` 的 `saveConfig` 是否仍同时写入 `floating_config` 和 `barcode_config`。
- 修改运行态时，检查 `AppRuntimeProvider`、`config/runtime.ts` 和相关 hook。
- 修改单个字符的动画或视觉效果时，优先看 `FloatingNode`。
- 修改映射字段时，要同步更新 `FloatingGroupConfig`、`config/default/floating.ts`、菜单输入解析和本文档。
- 新增节点级映射时，应保持“最后一项为默认值”的现有规则，降低旧配置迁移成本。

## 风险点

- `timeFormat` 变化会改变字符数量，节点分布、颜色和透明度映射可能需要同步调整。
- `colors`、`opacities` 等映射依赖对象插入顺序，菜单操作应避免无意重排默认项。
- group 使用比例坐标和比例尺寸，拖拽缩放要在不同窗口宽高下验证。
- `startTransition` 用于本地配置 hydration，修改初始化逻辑时要避免首屏闪烁和 hydration 差异。

## 验证方式

1. 运行 `npm run lint`。
2. 打开 `/floating`，检查默认时间字符串渲染。
3. 拖拽、缩放、复制、删除一个 group，并刷新页面确认配置保存。
4. 修改 `timeFormat`、节点分布、颜色、透明度和纵向偏移，检查节点映射是否符合预期。
5. 调整窗口尺寸，检查比例布局没有明显错位。

## 相关文档

- `docs/architecture/overview.md`
- `docs/workflows/development.md`
- `docs/MAP.md`
