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


# 0428

现在几乎所有功能都在根路径实现，我觉得timer和reminder的功能可以封装到别处，页面只操作它们、根据它们的变化做出调整、配置启动停止它们，而不记录它们的状态。你觉得应该怎么设计？
另外，除了barcode，我想添加新的屏保页面floating了，如果这样的话，最好的实践肯定是他俩各自有路由，但是根路径呢，能不能根路径默认显示一种屏保，而非只有提供入口的功能，即屏保子视图能不能透传到根路径

---

我们来基于floatingclock-swift实现floating页面。你先阅读一下swift源码，说说你的思路。其中有一些tricky的问题，比如需要浮动数字部分能够调节大小以适配更大的屏幕（而非ios），需要把动画实现重新映射，配置也需要重新安排数据结构。再想想有什么其他可能的问题。

---


我觉得一个想法是每个字符都算一个FloatingNode，用5个拼出来时间字符串。这样可以非常灵活，动画、颜色甚至大小也是在node中实现。

这样FloatingView只需要管理Node串的位置并传递参数给node。FloatingView还负责读取并维护一个配置，以及和BarcodeView类似的配置菜单。

需求澄清：
不用加毛玻璃效果。背景纯黑就行。
大小不基于屏幕，时钟可以放大缩小来回移动。
在客户端完成，需要考虑性能问题。
时间我们不用useTimer，毕竟只是个局部字符串。

你觉得怎么样？规划一下

---

效果还不错，我们现在开始功能迭代

1. 可移动时间显示
我希望用一个div来管理时间显示的5个node，后续要有自由添加的功能，但我们先使用这个简化模型。
我希望用户可以来回拖动时间显示的div。
用户能够手动调整这个div的大小。

2. 配置
我们引入可配置项，配置模型在@/config/floating.config.ts中定义，并且在defaults.ts中给出默认值，位置在barcodes和timer之间。
需要配置的项：
- 时间字符串
    - 位置、大小
    - 5个node各自的配置
具体配置参考barcode的配置和swift项目中的配置。

---

效果很好！我们继续迭代

1. menubar支持
调用MenuBar，构造菜单栏。
菜单层级：
- Mode
- Floating
    - String1
        - 配置String1
        - 显示的字符串，解析方式${HH}:${mm}
        - 字体
        - 颜色
    - String2
细节参考BarcodeView中的Barcodes子菜单设计


2. 大小调节
我们增加点击并拖动以调节大小的方式。为String添加一个锁定纵横比的配置项。

- 如果锁定纵横比：
左右拉伸、上下拉伸、斜对角拉伸的效果都和鼠标滚轮相同。
- 如果不锁定：
左右将在水平方向拉伸，但是这个拉伸只拉伸各个node的中心点的位置，而非node字符的图形。例如，向右拉伸一倍距离，node字符图形不变，但更分散了。

3. 状态
floating具有使用与保存config的能力，而非一刷新就重置，参考barcodes




我们这样设计String的位置和大小描述：
1. 位置记录String左上角的坐标，坐标元素是在屏幕中的百分比，例如(0.5, 0.5)代表屏幕中心。
2. 大小记录String的长和宽，同样按照屏幕长边和宽边的百分比记录
3. node的分布记录为一个数组，标记了node的中心相对于String的水平方向百分比位置。例如，(0, 0.25, 0.5, 0.75, 1)记录了五个node均匀地分布在String上，而且由于标记的是node的中心位置，左右会超出String本身的碰撞箱。
水平拉伸时，这个百分比不会变，只有width变化了，这就保证了我们总能让node按符合常理的模式安排。
另外，这种设计也便于用户自己定义node的分布。

我刚才稍微修改过MenuBar的实现，接口以现在为准，要兼容现在的MenuBar而不是重构它。现在我们继续吧

---

看起来不错，我们完善一下

1. 实现菜单栏

目标菜单层级：
- Mode
- Floating
    - String1
        - 配置String1
        - 显示的字符串，格式：${HH}:${mm}
        - node分布，格式：0, 0.25, 0.5, 0.75, 1
        - 字体
        - 颜色
    - String2
参考BarcodeView中的设计

2. 调节大小的方式
鼠标移动到String边框时会显示可调整大小的箭头，可以按住拉动。这点参考BarcodeNode中的实现


---

我们来调整一下floating功能的行为

1. menubar
参考BarcodeView，将菜单逻辑改为

- Mode子菜单
- Floating子菜单
    - String1
        - 配置String1
        - 显示的字符串，格式：${HH}:${mm}
        - node分布，格式：0, 0.25, 0.5, 0.75, 1
        - 字体
        - 颜色
    - ...
    - 添加新String


2. 双击快速配置
将String解耦到FloatingString.tsx，对齐BarcodeNode的实现。同样加入双击String打开快速配置的能力，和Barcode类似。

---



3. 实现颜色

我们在floatingconfig中这样定义颜色：
```json
"colors": {
    "#94d3e2": [1, 3],
    "#fcef7a": [2, 4],
    "#ffffff": []
}
```
view将把颜色应用到node上。颜色对应的数组指明了哪些node采用该颜色，最后一个颜色是默认颜色，会将前面漏掉的node上色。用户配置菜单里可以修改这几个颜色和映射

---

1. 颜色系统看起来没问题但是node并没有被上色，我估计是还要改改FloatingNode来实现颜色注入吧。
2. Floating子菜单中的String表项，点击后的FloatingConfig菜单在子菜单的右侧出现，而非替换子菜单为单个String的配置
3. FloatingConfig菜单中的颜色配置框超出菜单长度了，要确保子元素在菜单内。而且不需要“删”“默认”按钮




非常完美！我们现在来谈谈字体，现在的字体是怎么配置的



# 0429

我们来开发FloatingNode。

整体的逻辑是FloatingView管理FloatingString，FloatingString中包含若干FloatingNode，并负责控制FloatingNode的参数。这些参数包括：位置、颜色、opacity、字体、动画超参数。

我们先做一些准备工作

1. 对FloatingView和FloatingString按要求加注释，明确在哪里向Node传入参数。

2. 安全移除FloatingString中的滚轮缩放功能

---

好的，我们现在来开发FloatingNode

1. opacity
增加这个参数，String中通过类似颜色的方式配置它
```json
"opacity": {
    "0.5": [2, 4],
    "0.8": []
}
```
其中最后一个参数是默认值

2. 悬浮动画
我们先增加悬浮动画。这个动画的效果是让Node在一定范围内进行随机移动，模拟悬浮的效果。移动通过水平、垂直、旋转角度三个维度进行约束，同时还有移动速度。参考/home/anpoliros/barcode/archive/floatingclock-swift/Views/FloatView.swift中的实现。
在动画实现内部，我们仍然用swift文件中的几个参数来约束动画，但是我们设计一个超参数temperature，供String调用node。node将根据这个超参数计算几个约束。temperature范围在0到1之间，0时完全不移动，越大移动范围、角度、速度就越大。

3. 时间变动动画
我们先增加一个简单的淡入淡出动画，即node发现数字变化时，让旧数字从上方淡出，新数字从下方淡入。

---

现在已经动起来了，但是配置还没有暴露出来。我们把opacity和temperature在defaults.ts中体现，并且在FloatingView和FloatingString中暴露给用户的配置菜单中体现

---

浏览器里floating无法加载，报错
0s36-ox8wq~u5.js:1 Uncaught TypeError: crypto.randomUUID is not a function
    at 0s36-ox8wq~u5.js:1:8197

我觉得这个问题可能是配置文件的错误，由于每次功能迭代都修改了配置文件，导致很混乱。debug一下，并且说说当用户浏览器里缓存的配置和default不同时，重新部署后这个差异是如何处理的

---

现在好了，我们继续

1. 字体
我希望字体能够选用比较圆的字体，一个设想的字体链是
font-family: "SF Pro Rounded", "SF Pro Text", -apple-system, system-ui, sans-serif;

字体不再交给用户配置，只在config中体现，从菜单中移除

2. 温度
现在移动的还是太快，我希望温度为1时的速度和范围是现在的一半

3. nodeDistribution
现在的定义方式很精确，但一旦想要增加字符就成了灾难。我们这样定义位置：
```json
"allignment": "auto"
"nodeDistribution": [...]
```
allignment设定为auto时，将自动等分。设定为mannual时才使用nodeDistribution的方案。在用户菜单中体现为输入distribution的文本框左边有一个按钮，切换auto状态。auto状态不会覆盖nodeDistribution设置。

4. 动画实现
时间变动动画没有生效

---

我们来为menubar中的mode菜单的edit config窗口中加一个重置按钮，在导入按钮的右侧，图标为圆圈中有一个三角，按下后将把配置更新为default。按下这个按钮后需要用户确认，确认弹窗在按钮下面出现。

---








我们来为FloatingNode加两个参数，并在String、config等相关位置都加入它们

1. 
我们来为FloatingNode添加参数aspectRatio，用来描述字符的长宽比，并暴露到菜单，使得用户可以控制字符的胖瘦。String同样通过一个类似color和opacity的格式来描述它。
```json
"aspectRatios": {
    "1": [3],
    "1.5": []
}
```

2. 
参数verticalOffset，可以控制字符在垂直方向上的偏移，例如设置为正，字符将相对正常位置向上一些。这个量是用偏移量与字符垂直长度的比例计算的。这个配置不暴露到菜单。String同样通过类似的方法描述：
```json
"verticalOffsets":{
    "0.2": [3],
    "0": []
}
```

---

verticalOffset有一个bug，设置为0时，字符的底部似乎和String的水平中线对齐，设置为-0.01则又正常了。我希望设置为0时字符的水平中线和String的水平中线对齐。

另外，我们再为Node添加一个参数zIndex，它定义了Node的z序，使得一些字符能够遮住另一些。String中的配置方式仍然类似：
"zIndices":{
    "1": [3],
    "0": []
}


---

verticalOffset=0时刚才是异常偏上，现在是完全不工作了。我们的目标是：当verticalOffset=0时，Node字符能够在String的框里，Node字符的垂直方向中心和String的垂直方向中心对齐。



---

我们来打磨Node的动画。参考FloatView中的三个动画，尽量还原地迁移到FloatingNode中或调整现有实现。同时，animation相关配置移动到String中。

目标配置格式："animation": "fly"或"fade"


我们来讨论一下字体，现在它可以在config:floating:fontFamily: 中配置。我希望引入google fonts支持，并且希望使用SN Pro字体，还可以调字重。引入字体时，我希望是next在构建时引入字体并做子集，而非引入cdn字体。

---

我刚才基于FloatView.swift在FloatingNode中加入了动画。但是现在飘浮动画和performStabilization都没有生效。看看是怎么回事，告诉我怎么改。

---

飘浮动画回来了，但是回正动画仍然没有生效。

我觉得回正动画也许应该由FloatingString触发，它在捕捉到某个node发生变化时，将向附近的node发送信号触发回正。我们再给回正动画加上方向和力度参数，这就能实现如果字符串中心的node更新了，左边的会向右回正，右边的向左回正，而且离的远的node不受影响，实现更真实的物理效果。
不过这样做可能会导致性能问题，你先评估可行性，如果可行就实现，不可行跟我说。

另外在时间更新动画中，旧的数字应用向上fly或fade的动画。![alt text](image.png)


# 0512

你现在已经通读了项目了，我们来迭代一些功能。我们来将reminder和timer应用到floating中。

1. reminder和timer状态
首先我想确认一下，这二者的状态是全局的吗？即，如果我在barcode中打开timer，floating中是否会继承计时器状态？如果当前不是，应该怎么实现？关于这个问题，只讨论不改代码

2. floating的reminder
如果当天未打卡，floatingstring显示的字符串将在一分钟内重复以下循环：
经过随机间隔，替换其中一位为"punch"中的对应位置的字母。
以初始状态23:00:00为例
23:00:t1  2u:23
23:00:t2  2u:c3
23:00:t3  pu:c3
23:00:t4  punc3
23:00:t5  punch

约束：
- t5<40s，即至少20s的时间只显示punch不显示时间。t5不必等于40s。
- 时间间隔个替换字符位置都是随机的，不要固定，就是要营造一种不稳定感

bonus：
这两个需求可能较为复杂，如果实现起来简单就做，如果涉及大改就先放着
- punch这几个字母将使用一个单独的颜色配置，例如类似现在默认主题的交错的红色主题色
- punch的位置分布将默认服从auto，而非用户设定的数组分布。这是为了避免字母挤在一块


---

效果还不错，我们打磨下细节

1. reminder
用户可以通过双击屏幕其他位置进行打卡，和barcode中的逻辑一致。同时要和barcode保持相同状态，例如已经在floating打卡，则切换到barcode不用重新打卡。

floating模式下，在menubar中加入reminder和timer菜单，暂时和barcode保持一致即可。

2. config
注意到现在REMINDER_COLORS是写死的，我希望把它移动到config:defaults:floating:reminderColors中配置。

config持续迭代到现在，感觉臃肿而且问题很多，提些建议。

---

我觉得你说的config挺好。我们就按你说的三点做

有一些疑问

1. 如果barcode、timer等也拆分了的话，应该怎么把它们合并起来，或者说用户可以单独配置其中某个文件？

2. 如果运行态配置让用户不可见了，那用户怎么操作它们？例如重置打卡状态

另外

- 默认配置放到config/default/中，更方便修改。


# 0520

我们来为floating增加timer功能。先做一个简单版本

1. timer的用户配置菜单和逻辑保持不变

2. timer打开时，屏幕上会出现一个大小为默认的一半的倒计时string，仍然是hh:mm

3. 时间到时，所有string变成reminderColors配色，倒计时string消失

4. 双击屏幕解除计时后，倒计时string消失，颜色恢复

5. timer auto模式下，在一个计时结束下一个计时未开始时，倒计时string不消失，而是倒计时显示空窗期的时间。例如：
auto配置work:40 wait:10，在wait:10时，倒计时string会显示00:10的倒计时

---


1. 让timerstring同样具有双击快捷配置的能力，只不过不能删除。用户也可以来回拖动timerstring，或是调整它的大小，等等。用户通过配置修改timerstring改变的颜色和位置大小等都会保留

2. 将配置中floating:reminderColors调整到reminder:reminderColors

3. 增加timer:timerColors，类似reminderColors，绿色系