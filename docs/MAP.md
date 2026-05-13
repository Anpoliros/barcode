# Docs Map

本文档维护源码路径和文档路径的映射。修改源码前，先通过本文件找到应该阅读或更新的文档。

## 使用规则

- `Source Path` 指源码、内容、配置或工程脚本路径。
- `Documentation` 指对应文档路径；如果暂未创建，使用建议路径。
- `Update When` 说明什么变化需要同步更新文档。
- 新增核心目录、公共模块、重要脚本或构建产物时，应同步更新本文件。

## 当前映射

| Source Path | Documentation | Update When |
| --- | --- | --- |
| `AGENTS.md` | `docs/README.md`, `docs/SPEC.md` | 修改 agent 工作规则、文档接入方式或项目约束时 |
| `README.md` | `docs/README.md`, `docs/workflows/development.md` | 修改项目入口说明、启动方式或功能概览时 |
| `package.json` | `docs/workflows/development.md` | 修改 npm scripts、依赖、开发命令或运行流程时 |
| `app/` | `docs/architecture/overview.md` | 修改 App Router 结构、全局布局、页面入口或渲染策略时 |
| `app/page.tsx` | `docs/architecture/overview.md`, `docs/modules/barcode.md` | 修改默认首页模式或首页容器时 |
| `app/barcode/page.tsx` | `docs/architecture/overview.md`, `docs/modules/barcode.md` | 修改 barcode 路由入口或页面容器时 |
| `app/floating/page.tsx` | `docs/architecture/overview.md`, `docs/modules/floating.md` | 修改 floating 路由入口或页面容器时 |
| `app/layout.tsx` | `docs/architecture/overview.md`, `docs/workflows/development.md` | 修改全局字体、metadata、html/body 结构或全局样式入口时 |
| `app/globals.css` | `docs/architecture/overview.md` | 修改全局 CSS、Tailwind 引入、基础主题或字体变量使用时 |
| `components/AppRuntimeProvider.tsx` | `docs/architecture/overview.md`, `docs/modules/barcode.md`, `docs/modules/floating.md` | 修改 timer/reminder 运行态、跨路由状态共享或运行态操作接口时 |
| `components/MenuBar.tsx` | `docs/architecture/overview.md`, `docs/modules/barcode.md`, `docs/modules/floating.md` | 修改共享菜单、模式切换、JSON 配置编辑或菜单扩展接口时 |
| `components/barcode/` | `docs/modules/barcode.md` | 修改条形码屏保渲染、拖拽缩放、配置面板、计时器或提醒集成时 |
| `components/floating/` | `docs/modules/floating.md` | 修改悬浮字符串渲染、节点动画、拖拽缩放、颜色/透明度映射或配置面板时 |
| `config/` | `docs/architecture/overview.md`, `docs/modules/barcode.md`, `docs/modules/floating.md` | 修改 `AppConfig`、默认配置、配置读写、运行态读写或兼容字段时 |
| `config/default/` | `docs/architecture/overview.md`, `docs/modules/barcode.md`, `docs/modules/floating.md` | 修改默认屏保实例、默认颜色、默认时间格式或默认计时提醒参数时 |
| `config/storage.ts` | `docs/architecture/overview.md` | 修改配置版本、localStorage key、配置迁移或保存格式时 |
| `config/runtime.ts` | `docs/architecture/overview.md` | 修改运行态版本、运行态 localStorage key 或运行态默认值时 |
| `hooks/useTimer.ts` | `docs/modules/barcode.md` | 修改倒计时模式、自动工作/休息切换、闪烁逻辑或格式化输出时 |
| `hooks/useReminder.ts` | `docs/modules/barcode.md` | 修改打卡提醒刷新时间、周末规则、本地日期判断或提醒状态时 |
| `public/fonts/SN_Pro/` | `docs/architecture/overview.md` | 修改本地字体文件、字体授权或 `next/font/local` 配置时 |
| `next.config.ts` | `docs/workflows/development.md` | 修改 Next.js 配置、构建行为或运行时配置时 |
| `postcss.config.mjs` | `docs/workflows/development.md` | 修改 Tailwind CSS/PostCSS 编译流程时 |
| `tsconfig.json` | `docs/workflows/development.md` | 修改 TypeScript 配置、路径别名或编译约束时 |
| `eslint.config.mjs` | `docs/workflows/development.md` | 修改 lint 规则、代码质量约束或检查流程时 |
| `ecosystem.config.js` | `docs/workflows/development.md` | 修改 PM2 部署、进程名、启动参数或日志策略时 |
| `docs/floatingclock-swift/` | `docs/modules/floating.md` | 仅在把 Swift 参考实现作为对照资料更新时同步说明 |

## 建议新增文档

当前已补齐最小可用文档。后续可按项目演进继续补充：

```txt
docs/modules/menu.md
docs/modules/timer-reminder.md
docs/workflows/deploy.md
docs/decisions/0001-docs-structure.md
```
