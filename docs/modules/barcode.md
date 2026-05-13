# Barcode 模块

本文档说明条形码屏保的职责、配置模型、交互入口和修改注意事项。

## 模块视角

Barcode 模式将当前时间、倒计时或提醒状态渲染为可拖拽缩放的条形码。它适合做默认屏保页面，也是当前 `/` 与 `/barcode` 的主体验。

模块负责：

- 渲染多个条形码节点。
- 支持条形码拖拽、缩放、复制、删除、置顶和快速编辑。
- 支持手动倒计时、自动工作/休息计时和结束闪烁。
- 支持工作日打卡提醒，未打卡时通过颜色和弹窗提示用户。
- 将用户配置保存到 `localStorage` 的 `barcode_config`。

模块不负责全局路由和字体初始化；这些由 `app/` 与 `layout.tsx` 管理。

## 实现视角

| 文件 | 职责 |
| --- | --- |
| `app/page.tsx` | 默认首页，渲染 `BarcodeView`。 |
| `app/barcode/page.tsx` | barcode 专用路由，渲染 `BarcodeView`。 |
| `components/barcode/BarcodeView.tsx` | barcode 主视图，负责配置、菜单、计时提醒集成和节点列表。 |
| `components/barcode/BarcodeNode.tsx` | 单个条形码节点，负责时间格式化、JsBarcode 渲染、拖拽缩放和快速编辑。 |
| `hooks/useTimer.ts` | 手动/自动倒计时状态机与闪烁状态。 |
| `hooks/useReminder.ts` | 工作日打卡提醒状态。 |
| `config/barcode.config.ts` | `BarcodeItemConfig` 类型。 |
| `config/default/` | 默认条形码、计时器和提醒配置。 |
| `components/AppRuntimeProvider.tsx` | 跨路由共享 timer 运行态和 reminder 打卡日期。 |

`BarcodeNode` 使用 `jsbarcode` 直接写入 SVG。时间格式支持 `hh`、`mm`、`ss`、`yyyy`、`MM`、`dd`，也可通过 `staticValue` 绕过当前时间并展示指定内容。

## 数据模型

`BarcodeItemConfig` 的关键字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 节点唯一标识，复制和更新依赖它。 |
| `timeFormat` | 时间格式或条形码内容模板。 |
| `staticValue` | 可选静态值，倒计时条形码会使用它。 |
| `encoding` | JsBarcode 编码，例如 `CODE128`、`CODE39`、`EAN13`。 |
| `position` | `[x, y]` 比例坐标，基于窗口宽高。 |
| `width` / `height` | 节点像素尺寸。 |
| `showLabel` / `showText` | 控制背景标签和底部数字。 |
| `drag` | 是否允许拖拽。 |
| `zIndex` | 节点层级，置顶会递增该值。 |

计时器配置位于 `AppConfig["timer"]`。手动模式到 0 后停在结束状态；自动模式会在工作和休息之间切换。

提醒配置位于 `AppConfig["reminder"]`。`useReminder` 使用本地日期字符串 `YYYY-MM-DD`，周末默认不提醒。

当前 timer 的运行态由 `AppRuntimeProvider` 共享，切换到 `/floating` 后会继承正在运行的倒计时。reminder 的配置保存进 `barcode_config`，最后打卡日期保存进 `app_runtime`。

## 修改指南

- 修改条形码样式或交互时，优先看 `BarcodeNode`。
- 修改菜单、添加节点、保存配置、倒计时弹窗或提醒弹窗时，优先看 `BarcodeView`。
- 修改计时状态机时，保持 `useTimer` 与 `BarcodeView` 的状态含义一致，特别是 `timeUp`、`timerPaused` 和 `timeRemaining`。
- 修改提醒规则时，检查 `useReminder` 的工作日逻辑、`AppRuntimeProvider` 的打卡日期和 `BarcodeView` 中的颜色覆盖逻辑。
- 修改 `BarcodeItemConfig` 字段时，同步更新默认配置、JSON 编辑兼容逻辑和本文档。

## 风险点

- `EAN13`、`UPC` 等编码对输入长度和校验位有要求，修改默认 `timeFormat` 时要实际渲染验证。
- 拖拽和缩放使用窗口尺寸换算比例坐标，移动端或浏览器缩放下要手动检查。
- `localStorage` 中可能已有旧配置，读取逻辑需要尽量合并默认值，避免新增字段变成 `undefined`。
- Wake Lock 可能不可用或被浏览器拒绝，相关错误应保持静默降级。

## 验证方式

1. 运行 `npm run lint`。
2. 打开 `/barcode`，检查默认三个条形码是否渲染。
3. 拖拽、缩放、复制、删除一个节点，并刷新页面确认配置保存。
4. 双击条形码，检查快速编辑面板。
5. 启动手动倒计时和自动倒计时，检查倒计时条形码、结束闪烁和弹窗。
6. 调整提醒日期或刷新时间，检查未打卡状态和确认弹窗。

## 相关文档

- `docs/architecture/overview.md`
- `docs/workflows/development.md`
- `docs/MAP.md`
