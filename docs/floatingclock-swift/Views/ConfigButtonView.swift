import SwiftUI

struct ConfigButtonView: View {
    // 菜单开关状态
    @Binding var showSettings: Bool
    
    // 使用 config 单例来读取和修改主题
    @ObservedObject private var config = FloatConfig.shared
    
    private var screenHeight: CGFloat {
        UIScreen.main.bounds.height
    }
    
    var body: some View {
            // 修改点：使用 ZStack 包裹，将 Overlay 挂在 ZStack 上，而不是 Button 上
            // 这样设置面板里的按钮就不再被视为“嵌套在主按钮内部”，解决了点击冲突
            ZStack(alignment: .bottomTrailing) {
                Button(action: {
                    let generator = UIImpactFeedbackGenerator(style: .medium)
                    generator.impactOccurred()
                    
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                        showSettings.toggle()
                    }
                }) {
                    Image(systemName: "circle.fill")
                        .font(.system(size: 35))
                        .foregroundColor(.white.opacity(0.6))
                        .frame(width: 45, height: 45)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
            }
            // 关键修改：Overlay 移到这里
            .overlay(alignment: .bottomTrailing) {
                if showSettings {
                    ZStack(alignment: .bottomTrailing) {
                        // 1. 全屏点击拦截
                        Color.black.opacity(0.001)
                            .frame(width: 3000, height: 3000)
                            .contentShape(Rectangle())
                            .offset(x: 1500, y: 1500)
                            .onTapGesture {
                                withAnimation(.easeOut(duration: 0.2)) {
                                    showSettings = false
                                }
                            }
                        
                        // 2. 设置面板
                        settingsPanel
                            .offset(x: -65, y: 0)
                            .transition(
                                .asymmetric(
                                    insertion: .opacity.combined(with: .scale(scale: 0.8, anchor: .bottomTrailing)),
                                    removal: .opacity.combined(with: .scale(scale: 0.8, anchor: .bottomTrailing))
                                )
                            )
                    }
                }
            }
        }
    
    private var settingsPanel: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 25) {
                // --- 布局调整部分 ---
                VStack(alignment: .leading, spacing: 15) {
                    Text("DISPLAY").font(.caption).bold().foregroundColor(.secondary)
                    
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text("Scale")
                            Spacer()
                            Text("\(config.fontSizeRatio, specifier: "%.2f")")
                                .monospacedDigit()
                                .foregroundColor(.secondary)
                                .font(.caption)
                        }
                        Slider(value: $config.fontSizeRatio, in: 0.5...1.2)
                            .tint(.white.opacity(0.8))
                    }
                    
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text("Spread")
                            Spacer()
                            Text("\(config.spreadFactor, specifier: "%.2f")")
                                .monospacedDigit()
                                .foregroundColor(.secondary)
                                .font(.caption)
                        }
                        Slider(value: $config.spreadFactor, in: 0.5...1.5)
                            .tint(.white.opacity(0.8))
                    }
                    
                    // 动画开关
                    Toggle(isOn: Binding(
                        get: { config.animationStyle == .crossfade },
                        set: { isCrossfade in
                            config.animationStyle = isCrossfade ? .crossfade : .fly
                        }
                    )) {
                        Text("Fade in/out")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                    // 动态颜色：跟随当前主题
                    .toggleStyle(SwitchToggleStyle(tint: config.selectedTheme.gradientColors.first ?? .blue))
                    .padding(.horizontal, 4)
                    
                    if #available(iOS 26.0, *){
                        // 玻璃效果开关
                        Toggle(isOn: Binding(
                            get: { config.glassEffectOn == true },
                            set: { isGlassEffectOn in
                                config.glassEffectOn = isGlassEffectOn ? true : false }
                        )) {
                            Text("Glass Effect")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .toggleStyle(SwitchToggleStyle(tint: config.selectedTheme.gradientColors.first ?? .blue))
                        .padding(.horizontal, 4)
                    }
                }
                
                Divider().background(Color.white.opacity(0.2))
                
                // --- 主题选择部分 (修复版) ---
                VStack(alignment: .leading, spacing: 10) {
                    Text("THEME").font(.caption).bold().foregroundColor(.secondary)
                    
                    VStack(spacing: 8) {
                        ForEach(ColorTheme.allCases) { theme in
                            // 使用 Button 替代 onTapGesture，解决点击不灵敏问题
                            Button(action: {
                                // 触觉反馈
                                let generator = UISelectionFeedbackGenerator()
                                generator.selectionChanged()
                                
                                // 更新主题
                                config.selectedTheme = theme
                            }) {
                                ThemeRow(theme: theme, isSelected: config.selectedTheme.id == theme.id)
                            }
                            .buttonStyle(PlainButtonStyle()) // 保持自定义外观
                        }
                    }
                }
            }
            .padding(20)
        }
        .frame(width: 300)
        .frame(maxHeight: screenHeight * 0.8)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
    }
}

// MARK: - Helper Views

struct ThemeRow: View {
    let theme: ColorTheme
    let isSelected: Bool
    
    var body: some View {
        HStack {
            HStack(spacing: -5) {
                ForEach(theme.gradientColors.indices, id: \.self) { index in
                    Circle()
                        .fill(theme.gradientColors[index])
                        .frame(width: 20, height: 20)
                        .overlay(Circle().stroke(Color.white.opacity(0.2), lineWidth: 1))
                }
            }
            
            Text(theme.name)
                .font(.subheadline)
                .foregroundColor(.primary)
                .padding(.leading, 8)
            
            Spacer()
            
            if isSelected {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 20))
                    // 添加选中时的弹跳动画
                    .transition(.scale)
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isSelected ? Color.white.opacity(0.15) : Color.black.opacity(0.05))
        )
        // 确保内容区域完整响应点击
        .contentShape(Rectangle())
    }
}
