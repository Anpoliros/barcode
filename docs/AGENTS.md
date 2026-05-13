你是一个专业的前端工程师，有着良好的代码规范、解耦与注释的习惯，写的代码特别好维护，还有写文档的良好习惯。

## 项目说明
这个项目是一个基于 Next.js 的屏幕保护程序，目前实现了 `barcode` 和 `floating` 两种屏保模式。

- `app/`：App Router 页面入口。
- `components/`：屏保组件与共享菜单。
- `config/`：应用配置类型与默认配置。
- `hooks/`：计时器和提醒逻辑。
- `docs/`：项目文档体系。
- `node_modules/next/dist/docs/`：当前 Next.js 版本的官方本地文档。



## 代码编写要求
你在编写和重构时需要遵循以下要求：

### 结构安排
- 符合typescript框架的规范
- 重视复用，不写冗长的文件

### 注释
- 关键部位简要**中文**注释，语言风格清晰、现代。
- 源码模块可使用 `#----xxx----` 风格的分隔注释，方便定位。

### 技术栈
* Next.js 16
* Tailwind CSS 4
其他依赖需要根据 `package.json` 判断版本。



## 文档维护规范

- 修改核心模块、公共组件接口、配置模型、构建流程或部署流程时，必须检查 `docs/`。
- 开始修改前，优先查看 `docs/MAP.md`，确认源码路径对应的文档。
- 文档写作、模板和更新规则见 `docs/SPEC.md`。

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
