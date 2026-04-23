This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.






# 0327

这是一个为你量身定制的 Next.js 条形码/二维码屏保项目 Roadmap（路线图）：

### 阶段一：环境搭建与基础初始化
1. **安装运行时环境**：确保本地已安装 Node.js。
2. **初始化 Next.js 项目**：在 barcode 目录中运行 Next.js 脚手架命令（如 `npx create-next-app@latest .`），选择适合初学者的配置（推荐使用 TypeScript 和 Tailwind CSS）。
3. **清理脚手架代码**：将默认的主页代码清空，准备一张黑色的全屏画布。

### 阶段二：动态时间生成与条形码渲染
1. **时间状态管理**：学习 React 基础钩子（Hooks），使用 `useState` 和 `useEffect` 创建一个每秒更新一次的“当前时间”状态。
2. **生成条形码/二维码**：引入第三方组件库（如 `react-barcode` 或 `qrcode.react`）。
3. **结合渲染**：将实时更新的时间字符串作为数据输入给条形码/二维码组件，实现实时变动的效果。

### 阶段三：实现拖拽交互（Drag & Drop）
1. **引入拖拽库**：为了降低零基础手写原生拖拽事件的难度，可以引入库（如 `react-draggable` 或 `framer-motion`）。
2. **包装组件**：将时间条形码组件用拖拽容器包裹，实现用户可以通过鼠标自由拖动条形码的交互。

### 阶段四：“弹幕式”随机条形码飞过效果
1. **定义词库**：创建一个独立的数组或 JSON 文件，存放用于生成条形码的词集合。
2. **词条生成器**：编写逻辑，每隔几秒随机从词库中抽取几个词，生成对应的条形码组件。
3. **动画实现**：利用 CSS 动画（如 `@keyframes`）或 `framer-motion`，给定这些生成的条形码初始的随机位置（如屏幕外部），并让它们以不同速度从左到右或自上而下飘过屏幕。
4. **生命周期管理**：当飞出屏幕后，自动销毁组件以释放内存，防止长时间运行导致浏览器卡顿。

### 阶段五：细节打磨与全屏体验
1. **页面样式优化**：隐藏浏览器滚动条（`overflow: hidden`），设置沉浸式的暗黑背景色。
2. **响应式处理**：确保在窗口大小改变时，飞行动画和拖拽边界依然正确。
3. **打包导出**：通过 `next build` 导出静态文件，或者直接在本地启动服务，按 `F11` 全屏即可作为屏保运作。

---

如果确认了这个 Roadmap，我们可以立即开始**阶段一**。由于要求不要外溢到别的地方，我将在 barcode 目录通过终端为你执行 Next.js 的初始化操作。需要现在开始吗？





---

太好了，现在最简单的功能就这么实现了！接下来，我们来加入用户配置功能。

用户配置在本质上存储在一个json文件中，由于目前还没有涉及后端，所以我们就让它存储在前端就可以。

配置按钮：
当用户点一下网页后，左上角将出现一个白色半透明圆形，5秒后未操作它就将消失。

配置bar：
若用户点击了配置按钮，将向右展开一个药丸形的bar，里面有SGL MUL FLY三种选项，设计类macos。
当前正出于哪个模式中，哪个选项就显示为选中状态，并且弹出对应的配置窗口，窗口左侧对齐与选项左侧。我们现在只考虑SGL。

配置窗口：
列表，宽度自适应确保显示长度较长的配置项。条目左侧是描述，右侧是选项。依次如下：
```ini
Color         [] # 选择按钮，提供若干种默认颜色，其中一个选项是文本框，用户可以自己输入hex代码
Time Format   [] # 文本框，默认为hhmmss，也可以自己改，比如加上日期什么的
Encoding      [] # 选择按钮，选择条形码编码方法，这个之后再仔细研究，先能选集中最基本的
Size          [] # scroll，控制条形码大小，以px计

Label         [] # 开关，是否显示条形码背景标签，关的话就只显示条形码和数字
Drag          [] # 开关，是否允许自由拖曳条形码

Edit Config      # 按钮，弹出配置json的界面，其左侧和配置窗口的右侧对齐，行为类似macos菜单栏
Reset            # 重置config为默认
```
json具体的格式由你设计，需要按功能分组方便人类阅读。


---

非常帅！我们来调整细节

增加配置
1. 默认颜色增加绿色和黄色
2. 增加一个string配置，选择数字的字体，具体怎么实现字体可以先不管，不过能开箱即用当然最好
3. 增加一个[double, double]配置，存储条形码的位置，位置用长宽的相对比例标识，以保证可移植性。该配置仅在json中显示。
4. 增加一个bool配置，控制是否显示条形码下面的数字。另外，现在showlabel=false会导致数字消失，需要解决。
5. 增加string配置UIDesign，控制配置菜单采用哪种风格。

UI
1. 新加一个UIDesign选项：现在的ui圆角矩形太多了，配置菜单里不需要每个条目都是套一层圆角矩形。在size和label之间、drag和edit之间放分割线。
2. json编辑页面只有apply按钮，加cancel按钮。
3. 增加encoding的支持，加入ean13和upcA，从而实现护栏条的效果

系统
1. 需要在浏览器中全屏时保证屏幕常亮。
2. 现在拖曳非常卡，感觉不能实现指哪打哪。


---

非常好，我们直接开始MUL模式的开发。MUL模式允许用户添加多个条形码，每个条形码都是完整的可自定义对象，就像SGL中的那个一样。

条形码对象：
为了避免繁琐配置，用户现在可以在配置菜单外对条形码进行更多操作
1. 直接手动调整条形码的大小，当鼠标悬停到条形码左下角时，鼠标指针变为双向箭头，可以对其拉伸。注意仅左下角有这个功能。
2. 双击条形码，将弹出一个与条形码相同几何中心的小配置窗口，允许用户配置：显示文本，编码方式，颜色，showlabel，showdigits，复制该条形码，删除该条形码。布局紧凑。

配置json：
现在有了多个对象，每个都是一个完整的SGL对象。

配置菜单：
配置菜单也需要做出很大改变，从上往下依次是：
- Settings, UI风格选择
- Edit Config
- 每个子条形码的配置，每个都是一个子菜单，像macos菜单栏一样有个">"，点击后在右侧出现菜单。
    - 子菜单中增加复制和删除该条形码的按钮
    - 打开某个条形码的子菜单后，条形码周围会出现一个红框，表示正在对其进行修改
- 加号，以默认配置添加新的条形码


---
看起来不错，继续前我们先进行一些调整。

barcode配置
1. bool 锁定纵横比，这个选项同样出现在子菜单中。如果为false，则允许自由变化
2. string barcode的名字
3. label的圆角
4. z序，这个值不暴露到gui配置中，仅配合置顶功能使用。因为可以反复置顶，被覆盖后就又下去，所以这个值应该是相对的、动态的？

配置菜单
1. 配置单个barcode的子菜单有点太透明了，而且主菜单的padding有点大，让各条目相对菜单边界的距离和各条目的上下间距都小一些
2. edit config子菜单同样左侧与主菜单右侧对齐，并且把按钮移动到上方，从左到右依次为：Copy Export Import 间距  cancel（叉） confirm（对钩），用简单图标表示，不要用emoji
3. edit config和barcode子菜单都有点击子菜单外时消失同时丢弃修改的特性
4. edit config和barcode子菜单的顶部都和主菜单的顶部对齐
5. barcode表项允许拖动换位置，这只是视觉上的，不需要改json中的顺序
6. barcode表项双击后可以修改名字

条形码
1. 调整条形码大小的触发位置从左下角改为右下角，且调整时以左上角为固定
2. 条形码的双击快速配置窗口现在是在下面，我们改为从右侧出现，就像子菜单那样，其顶部和条形码顶部对齐，左侧与条形码右侧对齐
3. 快速配置窗口现在是点击一下就消失，无法进行配置，改为点击窗口外才消失
4. 快速配置窗口去除顶部的title和关闭按钮，从上往下依次是：
    - 颜色圆圈若干 颜色代码
    - 文本 Encoding选项
    - label圆角滑块 置顶按钮
    - label digits lock 字样的按钮，true时高亮
    - copy delete


---

几个小问题


配置
1. 对条形码增加配置padding，定义条形码到标签边缘的距离。现在一旦关闭锁定纵横比这个padding就变得很小，不好看

菜单
1. 感觉所有配置菜单的字号都变小了，调大一些，并告诉我在哪里自行修改
2. 配置菜单的z序是最靠前的，不能被遮挡
3. 子菜单的点击外部消失的“外部”包括主菜单的范围，例如打开子菜单时，点击主菜单的空白处，子菜单也会消失
4. 取消主菜单右侧的选择minimal或rounded的选项

SGL模式
该模式也使用同样的barcode node，各种操作逻辑和MUL模式保持一致。现在SGL模式下无法调整大小也无法


---

再修2个小bug
1. 快速配置窗口还是有点一下就消失的问题，正确的逻辑是点窗口里面不消失，点击窗口外面才消失。
2. 对于子菜单（例如点击edit config json后出现的窗口），正确的逻辑是点击主菜单的空白处后子菜单消失而主菜单不消失。
然后跟我讲讲我们现在的架构。


# 0415

这个项目目前实现了随时间变化的条形码时钟，其中SGL模式设计的是单个条形码，MUL设计的是多个条形码。左上角有一个control bar，可以切换模式并配置。
我们来进行以下修改，先改变控制栏行为，再添加两个新功能。

1. 控制栏行为
我希望让控制栏只控制barcode MUL的配置，移除SGL模式和FLY模式。控制栏从左到右变为
- Mode：模式选择列表，现在只设置一种，即Barcode
- Barcodes：现在的MUL模式配置
- Timer
- Reminder

2. Timer功能
这个功能用来提醒用户该站起来待会了。
业务逻辑：
维护一个状态time_up，默认为false；一个计时器状态timer_on，默认false。
    a. 用户开始计时，计时器启动，timer_on=true
    b. timer_on=true时，屏幕中会出现一个新的barcodenode，数字值为倒计时
    c. 时间到后time_up=true，timer_on不变，计时器barcodenode开始闪烁，其他所有barcodenodes变为timer_color，原有颜色会保留。
    d. 用户双击屏幕，屏幕左上角就会弹出一个弹窗，动画效果从上方飞入。
    e. 弹窗显示一段文本，同时要求用户点击确认。用户确认后time_up=false，一切复原。
配置菜单从上到下：
- 时间框 开始计时按钮
- 默认时间
- 提醒颜色timer_color
- 弹窗文本

3. Reminder功能
这个功能用来提醒用户今天有没有打卡。
业务逻辑：
维护一个状态has_punched，设定一个时间refresh_time
    a. 每天的这个refresh_time会刷新has_punched为false。
    b. has_punched=false时，所有barcodenodes的颜色都会变成reminder_color，同时原有的颜色会保留。为true时功能正常。
    c. 用户如果想取消这个状态只需要双击屏幕，屏幕左上角就会弹出一个弹窗，动画效果从上方飞入。
    d. 弹窗显示一段文本，同时要求用户输入当前日期，用户输入后可点击按钮提交，如果日期正确就成功并将has_punched改为true，否则继续尝试。
Reminder配置菜单：
- 刷新时间refresh_time
- 提醒颜色reminder_color
- 弹窗文本

你需要先阅读现有实现，确保接口正确。需求比较复杂，请认真思考一步步完成

---

实现了需求！我们来做些调整

1. 配置菜单
所有颜色选择器（包括三个配置菜单和双击barcode后的快速配置）都加入选色器，而非只允许手动输入hex代码。

2. reminder
- 弹窗中的文字是白色，不便于阅读，改成黑色
- 输入日期的格式
- 配置菜单中加入reset按钮，重置今天的状态

3. timer
- 时间单位改成分钟，支持小数，例如0.1分钟就是6秒
- timer条形码可以移动和快速配置，且会保留默认值
- timer条形码中显示的应该是倒计时，即001000->000959。这似乎需要对barcodenode进行一些修改。
- timer到期后需要让条形码闪烁，具体方式是让其颜色在timer_color和另一个可timer config中设定的颜色之间切换

---

我们继续优化timer功能

- 时间选择设置几个默认值按钮，排成一行，最右侧是用户自定义的文本框
- 增加自动模式，timer将自动执行循环，例如计时40min，然后等待10min，然后继续循环。等待时屏幕显示为timeup状态。用户可配置计时时间和等待时间。
- start功能安排到手动和自动的配置区域附近，start按钮是长条形的，开始后会分裂成暂停和停止两个按钮

目标timer配置菜单，从上到下：
- Timer Config, Reset
- Manual
- 10 20 30 40 60 text
- Start
- Auto
- timer-text, wait-text
- Start
- Color
- Timer, Flash
- Popup Text

另外，各个功能的默认配置解耦到一个新文件，方便配置