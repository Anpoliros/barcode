# 项目文档

本目录是 `barcode` 屏幕保护程序的维护入口。项目基于 Next.js App Router，当前提供 `barcode` 与 `floating` 两种屏保模式，主要代码位于 `app/`、`components/`、`config/` 和 `hooks/`。

文档的目标不是复述每一行源码，而是帮助维护者和 coding agent 快速判断：入口在哪里、配置如何流动、哪些模块需要一起看、修改后如何验证。

## 阅读顺序

1. 先读 `docs/MAP.md`，确认源码路径对应的文档。
2. 修改路由、布局或页面入口时，读 `docs/architecture/overview.md`。
3. 修改屏保能力时，读 `docs/modules/barcode.md` 或 `docs/modules/floating.md`。
4. 修改命令、依赖、构建或部署时，读 `docs/workflows/development.md`。
5. 新增文档或调整文档结构时，按 `docs/SPEC.md` 的模板和更新规则处理。

## 当前文档

| 文档 | 用途 |
| --- | --- |
| `docs/MAP.md` | 源码路径和文档路径的映射。 |
| `docs/SPEC.md` | 文档写作模板、更新规则和质量要求。 |
| `docs/architecture/overview.md` | 项目整体结构、路由、数据流和运行边界。 |
| `docs/modules/barcode.md` | 条形码屏保模块的职责、配置和交互。 |
| `docs/modules/floating.md` | 悬浮时钟屏保模块的职责、配置和交互。 |
| `docs/workflows/development.md` | 本地开发、检查、构建和部署流程。 |
| `docs/init.md` | 通用文档体系初始化指南，可迁移到其他项目。 |

## 项目速览

- `/` 和 `/barcode` 渲染 `BarcodeView`，以条形码形式展示时间、倒计时和提醒状态。
- `/floating` 渲染 `FloatingView`，以可拖拽缩放的字符串节点展示时间。
- `MenuBar` 是两个模式共用的菜单入口，负责模式切换和 JSON 配置编辑。
- `config/default/` 提供分领域默认配置；用户修改后分别持久化到 `localStorage` 的 `barcode_config` 或 `floating_config`。
- `AppRuntimeProvider` 提供跨路由运行态，`hooks/useTimer.ts` 和 `hooks/useReminder.ts` 负责操作 timer 与打卡状态。

## 文档维护

修改核心模块、公共配置、共享菜单、计时提醒逻辑、路由结构、开发命令或部署配置时，必须检查 `docs/MAP.md` 并视情况更新相关文档。

`docs/floatingclock-swift/` 和 `docs/image.png` 是已有参考资料，不属于当前最小文档体系；除非后续明确迁移或对照实现，否则保持原样。
