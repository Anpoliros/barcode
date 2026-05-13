# 开发流程

本文档说明本项目的本地开发、检查、构建和部署入口。

## 触发场景

以下情况需要阅读或更新本文档：

- 修改 `package.json` scripts 或依赖。
- 修改 Next.js、TypeScript、ESLint、Tailwind/PostCSS 或 PM2 配置。
- 调整本地启动、构建、部署或验证流程。
- 新增需要手动验证的屏保模式或浏览器能力。

## 环境与命令

项目使用 Next.js `16.2.1`、React `19.2.4`、TypeScript、Tailwind CSS 4 和 ESLint 9。

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器。 |
| `npm run lint` | 运行 ESLint。 |
| `npm run build` | 构建生产版本。 |
| `npm run start` | 启动 Next.js 生产服务。 |
| `npm run deploy` | 先构建，再用 PM2 启动 `ecosystem.config.js`。 |
| `npm run stop` | 停止 PM2 进程 `nextsite`。 |
| `npm run log` | 查看 PM2 日志。 |

## Next.js 注意事项

本项目的 Next.js 版本有 breaking changes。修改 App Router、字体、metadata、构建配置或运行时行为前，先阅读 `node_modules/next/dist/docs/` 中的对应文档，再写代码。

不要按旧版 Next.js 经验直接迁移 API。尤其注意 `app/` 目录、client component 边界、`next/font` 和构建配置。

## 本地开发步骤

1. 运行 `npm install` 安装依赖。
2. 运行 `npm run dev` 启动开发服务器。
3. 打开 `/`、`/barcode`、`/floating` 做页面验证。
4. 修改完成后运行 `npm run lint`。
5. 涉及路由、配置模型、依赖或构建配置时，运行 `npm run build`。

## 手动验证清单

Barcode 模式：

- 默认条形码正常渲染。
- 拖拽、缩放、复制、删除、置顶和双击快速编辑正常。
- JSON 配置导入、导出、复制、重置和刷新后持久化正常。
- 手动倒计时、自动倒计时和提醒弹窗正常。

Floating 模式：

- 默认 floating group 正常渲染。
- 拖拽、缩放、复制、删除和快速配置正常。
- `timeFormat`、节点分布、颜色、透明度、纵向偏移和层级映射正常。
- 刷新后 `floating_config` 能恢复。

共享验证：

- `MenuBar` 模式切换在 `/barcode` 与 `/floating` 间正常。
- 全屏黑色背景没有滚动条或布局溢出。
- Wake Lock 不可用时页面仍可正常使用。

## 构建与部署

生产构建使用：

```bash
npm run build
```

PM2 部署入口是：

```bash
npm run deploy
```

`deploy` 会先执行 `npm run build`，再运行 `pm2 start ecosystem.config.js`。修改 PM2 进程名、端口或日志策略时，同步检查 `ecosystem.config.js`、`package.json` 和本文档。

## 常见问题

- 如果浏览器没有 Wake Lock API，页面应静默降级，不应阻断屏保渲染。
- 如果本地配置损坏，视图应忽略损坏 JSON 并回退默认配置。
- 如果条形码不显示，优先检查 `encoding` 与 `timeFormat` 生成的内容是否满足 JsBarcode 要求。
- 如果 floating 节点样式错位，优先检查节点序号映射是否从 `1` 开始。

## 相关文档

- `docs/architecture/overview.md`
- `docs/modules/barcode.md`
- `docs/modules/floating.md`
- `docs/MAP.md`
