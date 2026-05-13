# 项目架构概览

本文档说明 `barcode` 屏幕保护程序的整体结构、路由入口、配置流和运行边界。

## 模块视角

项目是一个基于 Next.js App Router 的全屏网页屏保应用。当前有两个模式：

- `barcode`：用条形码展示时间、倒计时和打卡提醒状态。
- `floating`：用分散的字符节点展示当前时间，支持拖拽、缩放和节点级样式映射。

所有页面都以黑色全屏容器为基础，交互入口集中在左上角的 `MenuBar`。用户配置优先存在浏览器 `localStorage` 中，默认值来自 `config/default/`，完整组合入口是 `config/default/index.ts`。

## 路由入口

| 路由 | 入口文件 | 主组件 | 说明 |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `components/barcode/BarcodeView.tsx` | 默认进入 barcode 模式。 |
| `/barcode` | `app/barcode/page.tsx` | `components/barcode/BarcodeView.tsx` | 显式 barcode 页面。 |
| `/floating` | `app/floating/page.tsx` | `components/floating/FloatingView.tsx` | floating 页面。 |

`app/layout.tsx` 负责全局字体、`metadata`、`globals.css` 引入和 `html/body` 基础结构。当前使用本地 `SN Pro` 字体和 Google 字体 `Inter`、`Roboto Mono`。

## 配置流

核心配置类型在 `config/app.config.ts`：

- `app`：全局模式、菜单对齐、背景色和 Wake Lock。
- `barcodes.items`：barcode 模式的条形码节点列表。
- `floating.groups`：floating 模式的字符串组列表。
- `timer`：手动倒计时和自动工作/休息的默认配置。
- `reminder`：打卡提醒的时间、颜色和文案配置。

默认配置拆在 `config/default/`：

| 文件 | 说明 |
| --- | --- |
| `config/default/app.ts` | 应用级默认配置。 |
| `config/default/barcode.ts` | 条形码节点默认配置。 |
| `config/default/floating.ts` | floating group 和 reminder 字母颜色默认配置。 |
| `config/default/timer.ts` | timer 默认配置。 |
| `config/default/reminder.ts` | reminder 默认配置。 |
| `config/default/index.ts` | 组合并导出 `defaultConfig`。 |

`config/defaults.ts` 仅保留为旧导入路径的兼容出口。进入页面后，视图组件通过 `config/storage.ts` 读取带版本的本地配置并执行迁移：

| 模式 | localStorage key | 读取位置 |
| --- | --- | --- |
| barcode | `barcode_config` | `BarcodeView` |
| floating | `floating_config` | `FloatingView` |

配置保存由各视图的 `saveConfig` 完成。`MenuBar` 的 JSON 编辑器可导入、导出、复制和重置配置，但真正的持久化仍由父组件传入的保存函数决定。

## 运行态

运行态由 `components/AppRuntimeProvider.tsx` 提供，并在 `app/layout.tsx` 包裹全局页面。

当前运行态包括：

- timer：倒计时模式、暂停状态、自动阶段、剩余秒数、结束状态和闪烁状态。
- reminder：最后打卡日期。

timer 运行态是跨 `/barcode` 与 `/floating` 的内存状态，切换路由后会继承。reminder 的最后打卡日期会持久化到 `localStorage` 的 `app_runtime`，不再写入用户可编辑的配置 JSON。

Floating 保存配置时会同步把 `timer` 和 `reminder` 配置写入 `barcode_config`。打卡确认只写入 `app_runtime`，timer/reminder 菜单配置则会被 barcode 继续识别。

## 共享边界

`components/MenuBar.tsx` 是两个模式的共享 UI：

- 固定包含 `Mode` tab，用于路由切换。
- 通过 `tabs` 接收各模式自己的设置面板。
- 在传入 `config` 和 `onConfigSave` 时启用 JSON 配置编辑器。
- `alignSubmenus` 控制子菜单是否按 tab 位置横向对齐。

修改 `MenuBar` 时要同时检查两个模式，避免只在一个页面验证。

## 运行边界

项目大量使用浏览器 API，包括 `localStorage`、`navigator.wakeLock`、`navigator.clipboard`、`FileReader`、pointer capture 和窗口尺寸。因此主要交互组件都应保持 client component。

Next.js 版本为 `16.2.1`。修改 App Router、字体、metadata 或构建配置前，应先阅读 `node_modules/next/dist/docs/` 中对应版本文档，避免使用旧版 Next.js 习惯。

## 修改指南

- 新增屏保模式时，先新增路由，再复用或扩展 `MenuBar` 的模式切换。
- 修改配置字段时，同时更新 `config/app.config.ts`、`config/default/`、对应模块文档和 `config/storage.ts` 的迁移逻辑。
- 修改运行态字段时，同时更新 `components/AppRuntimeProvider.tsx`、`config/runtime.ts` 和相关 hook。
- 修改全局字体或样式时，检查 `app/layout.tsx`、`app/globals.css` 和两个页面的首屏表现。
- 修改共享菜单时，至少验证 `/barcode` 与 `/floating`。

## 验证方式

推荐顺序：

1. 运行 `npm run lint`。
2. 运行 `npm run build`。
3. 本地打开 `/`、`/barcode`、`/floating`，检查全屏布局、菜单、拖拽缩放和配置保存。
4. 修改配置模型后，手动测试默认配置、已有本地配置和 JSON 导入配置。

## 相关文档

- `docs/modules/barcode.md`
- `docs/modules/floating.md`
- `docs/workflows/development.md`
- `docs/MAP.md`
