//
//  Float.swift
//  FloatingClock
//
//  Created by anpoliros on 2025/12/5.
//
import SwiftUI
import Combine

@available(iOS 26.0, *)
// MARK: - 内部渲染视图
struct DigitInternalView: View {
    let digit: String
    let color: Color
    let overlapColor: Color
    let fontSize: CGFloat
    let fontWeight: Font.Weight
    let design: Font.Design
    let glassEffectOn: Bool
    
    var body: some View {
        ZStack {
            if(glassEffectOn){
//                let deepGlass = GlassStyle(
//                                    material: .thickMaterial, // 使用更厚的材质防止透视太多
//                                    tint: color.opacity(0.2),
//                                    blurRadius: 0,
//                                    rimColor: .white, // 强制白色高光边框
//                                    rimWidth: 1.5,
//                                    surfaceShine: 0.4,
//                                    shadowRadius: 15
//                                )
//                GlassText(digit, style: .heavy.tinted(color))
//                    .font(.system(size: fontSize, weight: fontWeight, design: design))
                GlassText26(digit, glass: .regular.tint(color))
                    .font(.system(size: fontSize, weight: fontWeight, design: design))
                    .foregroundStyle(color)
                    .shadow(color: .white.opacity(0.1), radius: 20, x: 0, y: 10)
//                GlassText26(digit, glass: .regular.tint(color))
//                    .font(.system(size: fontSize, weight: fontWeight, design: design))
//                    .foregroundStyle(overlapColor)
//                    .blendMode(.plusLighter)
//                    .opacity(0.2)
//                GlassText26(digit)
//                    .font(.system(size: fontSize, weight: fontWeight, design: design))
//                    .foregroundStyle(color)
//                    .shadow(color: .white.opacity(0.1), radius: 20, x: 0, y: 10)
//                GlassText26(digit)
//                    .font(.system(size: fontSize, weight: fontWeight, design: design))
//                    .foregroundStyle(color)
//                    .shadow(color: .white.opacity(0.1), radius: 20, x: 0, y: 10)
            }else{
                Text(digit)
                    .font(.system(size: fontSize, weight: fontWeight, design: design))
                    .foregroundStyle(color)
                    .shadow(color: .white.opacity(0.1), radius: 20, x: 0, y: 10)
                Text(digit)
                    .font(.system(size: fontSize, weight: fontWeight, design: design))
                    .foregroundStyle(overlapColor)
                    .blendMode(.plusLighter)
                    .opacity(0.2)
            }
        }
        .padding(60) // 防止阴影被切
        .drawingGroup() // 开启 Metal 渲染
        .compositingGroup()
    }
}

@available(iOS 26.0, *)
struct FloatingDigitView: View {
    // MARK: - Parameters
    let digit: String
    let trigger: String // 接收 "12:05" 字符串
    let position: Int
    let screenHeight: CGFloat
    let screenWidth: CGFloat
    let isColon: Bool
    let fontWeight: Font.Weight
    
    // MARK: - State
    @State private var offsetX: CGFloat = 0
    @State private var offsetY: CGFloat = 0
    @State private var rotation: Double = 0
    @State private var isEntering = false
    @State private var currentDigit: String
    @State private var floatTaskToken = UUID()
    
    @ObservedObject private var config = FloatConfig.shared
    
    // MARK: - Computed Props
    private var fontSize: CGFloat { min(screenHeight, screenWidth) * config.fontSizeRatio }
    private var floatRangeX: CGFloat { screenWidth * config.floatRangeXRatio }
    private var floatRangeY: CGFloat { screenHeight * config.floatRangeYRatio }
    private var rotationRange: Double { config.rotationRange }
    
    private var baseRotationAngle: Double {
        config.getBaseRotation(position: position, isColon: isColon)
    }
    
    // 动态计算颜色，确保响应主题变化
    private var dynamicColor: Color {
        if isColon {
            return config.selectedTheme.colonColor
        }
        let colors = config.selectedTheme.gradientColors
        // 映射逻辑：0,1 -> 0,1 ; 2(冒号)跳过 ; 3,4 -> 2,3
        let index = position > 2 ? position - 1 : position
        if index >= 0 && index < colors.count {
            return colors[index]
        }
        return .white
    }
    
    private var dynamicOverlapColor: Color {
        return config.selectedTheme.overlapColor
    }
    
    private var centerPosition: CGPoint {
        let x = screenWidth * config.horizontalPositions[position]
        let visualCorrection = isColon ? -(screenHeight * 2.0) : 0
        let y = (screenHeight * 0.5) + visualCorrection
        return CGPoint(x: x, y: y)
    }
    
    private var digitOpacity: Double {
        if isColon { return 0.98 }
        switch position {
        case 0, 3: return 0.75
        case 1, 4: return 0.85
        default: return 0.8
        }
    }
    
    private var activeOpacity: Double {
        if config.animationStyle == .crossfade {
            return isEntering ? digitOpacity : 0.0
        } else {
            return digitOpacity
        }
    }
    
    // MARK: - Init
    init(digit: String, trigger: String, position: Int, screenHeight: CGFloat, screenWidth: CGFloat, isColon: Bool, fontWeight: Font.Weight = .bold) {
        self.digit = digit
        self.trigger = trigger
        self.position = position
        self.screenHeight = screenHeight
        self.screenWidth = screenWidth
        self.isColon = isColon
        self.fontWeight = fontWeight
        _currentDigit = State(initialValue: digit)
        _rotation = State(initialValue: FloatConfig.shared.getBaseRotation(position: position, isColon: isColon))
    }
    
    // MARK: - Body
    var body: some View {
        DigitInternalView(
            digit: currentDigit,
            color: dynamicColor,        // 使用动态计算的颜色
            overlapColor: dynamicOverlapColor,
            fontSize: fontSize,
            fontWeight: config.fontWeight,
            design: config.fontDesign,
            glassEffectOn: config.glassEffectOn
        )
        // 强制刷新 drawingGroup 缓存
        .id(config.selectedTheme.id)
        .opacity(activeOpacity)
        .rotationEffect(.degrees(rotation))
        .fixedSize()
        .position(x: centerPosition.x + offsetX, y: centerPosition.y + offsetY)
        .offset(y: isEntering ? 0 : (config.animationStyle == .crossfade ? 100 : screenHeight))
        .onAppear {
            isEntering = true
            startFloatingAnimation()
        }
        .onChange(of: trigger) { oldValue, newValue in
            // 收到时间变化信号（每分钟一次）
            if currentDigit != digit {
                // A. 如果我的数字变了 (比如 1->2)，执行切换动画
                restartAnimationWithNewDigit(digit)
            } else {
                // B. 如果我的数字没变 (比如 9还是9)，执行吸附回正
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2){
                    performStabilization()
                }
            }
        }
    }
    
    
    
    
    
    // MARK: - Animation Logic
    
    private func startFloatingAnimation() {
        let currentToken = UUID()
        floatTaskToken = currentToken
        
        // 随机延迟防止同步运动
        let randomDelay = Double.random(in: 0...2.0)
        DispatchQueue.main.asyncAfter(deadline: .now() + randomDelay) {
            guard self.floatTaskToken == currentToken else { return }
            self.performFloatCycle(token: currentToken, speed: config.baseSpeed + Double(position) * 1.5)
        }
    }
    
    private func performFloatCycle(token: UUID, speed: Double) {
        guard floatTaskToken == token else { return }
        
        let targetX = CGFloat.random(in: -floatRangeX...floatRangeX)
        let targetY = CGFloat.random(in: -floatRangeY...floatRangeY)
        let targetRotation = baseRotationAngle + Double.random(in: -rotationRange...rotationRange)
        
        withAnimation(.easeInOut(duration: speed)) {
            offsetX = targetX
            offsetY = targetY
            rotation = targetRotation
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + speed) {
            self.performFloatCycle(token: token, speed: Double.random(in: 15...25))
        }
    }
    
    /// 回正/吸附动画：当旁边的数字飞走时，我也动一下
    private func performStabilization() {
        // 1. 立即打断浮动循环
        floatTaskToken = UUID()
        
        // 2. 真空吸附 (Vacuum Nudge)
        // 模拟被右侧飞走的数字吸了一下，向右微动
        let vacuumForce: CGFloat = screenWidth * 0.02
        
        withAnimation(.easeOut(duration: 0.2)) {
            offsetX = vacuumForce
            // 角度轻微随机摆动
            rotation = baseRotationAngle + Double.random(in: -3...3)
        }
        
        // 3. 弹簧回正
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            withAnimation(.spring(response: config.stabilizeResponse, dampingFraction: config.stabilizeDamping)) {
                self.offsetX = 0
                self.offsetY = 0
                self.rotation = self.baseRotationAngle
            }
        }
        
        // 4. 恢复浮动
        let resumeDelay = 0.8
        DispatchQueue.main.asyncAfter(deadline: .now() + resumeDelay) {
            self.startFloatingAnimation()
        }
    }
    
    // 时间变动动画
    private func restartAnimationWithNewDigit(_ newDigit: String, transitionDelay: Double = 0.1) {
        // 1. 立即打断浮动
        floatTaskToken = UUID()
        
        let exitDuration = 1.0
        
        // 2. 旧数字飞出 (保持原有逻辑)
        if config.animationStyle == .fly {
            withAnimation(.easeIn(duration: exitDuration)) {
                offsetY = -screenHeight // 向上飞出
            }
        } else {
            withAnimation(.easeOut(duration: exitDuration * 0.8)) {
                offsetY = -screenHeight
                isEntering = false
            }
        }
        
        // 3. 时延
        let resetDelay = exitDuration * 0.4
        
        // 4. 新数字进入
        DispatchQueue.main.asyncAfter(deadline: .now() + resetDelay) {
            self.currentDigit = newDigit
            
            // 步骤 A: 统一初始状态 - 瞬移到底部 (无论什么模式，都从底部开始)
            self.offsetX = 0
            self.offsetY = self.screenHeight
            self.rotation = self.baseRotationAngle
            
            // 如果是 Crossfade 模式，需要重置 opacity 状态，但位置动画我们强制改为飞入
            if self.config.animationStyle != .fly {
                 self.isEntering = true
            }
            
            // 步骤 B: 向上飞入 + 惯性浮力
            // response: 0.6 (响应速度)
            // dampingFraction: 0.6 (阻尼系数调低，产生"冲过头"的惯性回弹效果)
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
                self.offsetY = 0
                // self.rotation = self.baseRotationAngle
            }
            
            // 恢复浮动
            self.startFloatingAnimation()
        }
    }
}
