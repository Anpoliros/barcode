# 0428

---

我们来重构一下左上角的控制菜单。现在，这个菜单在BarcodeView中实现，我希望将它拆成@/components/MenuBar.tsx，供BarcodeView.tsx调用。

MunuBar中实现了可拓展的接口，可以供其他view添加自己的表项，遵循相同的排版和设计语言。同时，MenuBar的第一个表项是"Mode"，点击后是模式选择菜单，指向@/barcode和@/floating两个路由。

重构时注意功能需要完全一致。

---

很好，我们来稍微调整下菜单栏的UI和行为。

1. 弹出子菜单
现在弹出的子菜单（例如点击Timer选项后弹出的菜单）会向左对齐到菜单栏的左边界，我希望子菜单能够对齐到选项的左边界。例如Timer子菜单的左边界和Timer选项的左边界是对齐的。

注意到现有实现的子菜单似乎是被动态注入到html中的，所以大概就是在构造子菜单div时新指定一个左边界参数？

这个功能作为一个可配置项，在AppConfig:app中配置。

2. Mode子菜单
从上到下：
- Modes
    - Barcode
    - Floating
- Edit Config
---

效果很好！不过我注意到mode子菜单是在BarcodeView中实现的，能把它放到MenuBar.tsx中吗？因为mode应该是一个公用组件。



我们来重构一下配置的安排。

1. 将config.ts拆成barcode.config.ts和app.config.ts

2. 安全地移除AppConfig中的uidesign

3. 安全地将mul:改为barcodes，同时移除BarcodeView中的遗留代码

4. 安全地将app:mode改为app:defaultMode

4. 注意到barcodeview的操作和菜单栏中的menubar的修改模式并没有将配置修改，关于这个问题先不改代码，看看是怎么回事

---

明白了，我看好像现在根本没有保存当前正在运行的配置的能力？我们不如在Mode的EditConfig窗口中实现它。

加入一个图标为刷新的按钮，点击后将把目前的config加载到窗口。