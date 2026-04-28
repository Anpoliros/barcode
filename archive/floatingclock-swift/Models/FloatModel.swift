//
//  FloatModel.swift
//  FloatingClock
//
//  Created by anpoliros on 2025/12/5.
//

import SwiftUI
import Combine
import UIKit

// MARK: - Animation Style Enum
enum DigitAnimationStyle: String, CaseIterable, Identifiable {
    case fly = "飞入/飞出 (Fly In/Out)"
    case crossfade = "淡入/淡出 (Crossfade)"
    
    var id: String { self.rawValue }
}
// MARK: - Background Mode Enum
enum BackgroundMode: String, CaseIterable, Identifiable {
    case solid = "纯色 (Solid)"
    case animation = "动画 (Flow)"
    case image = "图片 (Image)"
    
    var id: String { self.rawValue }
}

// MARK: - 各项配置
class FloatConfig: ObservableObject {
    static let shared = FloatConfig()
    
    // MARK: - 初始化
    private init() {
        // 1. 动画风格
        if let savedStyle = UserDefaults.standard.string(forKey: "cfg_animationStyle"),
           let style = DigitAnimationStyle(rawValue: savedStyle) {
            self.animationStyle = style
        }
        // 2. 字体大小
        let savedSize = UserDefaults.standard.double(forKey: "cfg_fontSizeRatio")
        if savedSize > 0 {
            self.fontSizeRatio = savedSize
        } else {
            // iPad默认0.6，iPhone默认0.9
            self.fontSizeRatio = UIDevice.current.userInterfaceIdiom == .pad ? 0.6 : 0.9
        }
        // 3. 扩散系数
        let savedSpread = UserDefaults.standard.double(forKey: "cfg_spreadFactor")
        if savedSpread > 0 { self.spreadFactor = savedSpread }
        // 4. 字体粗细 (存 String)
        if let savedWeightName = UserDefaults.standard.string(forKey: "cfg_fontWeight") {
            self.fontWeight = FloatConfig.mapStringToWeight(savedWeightName)
        }
        // 5. 加载主题
        if let savedThemeStr = UserDefaults.standard.string(forKey: "cfg_theme"),
           let theme = ColorTheme(rawValue: savedThemeStr) {
            self.selectedTheme = theme
        }
        // 6. 加载背景
        if let modeStr = UserDefaults.standard.string(forKey: "cfg_bgMode"),
           let mode = BackgroundMode(rawValue: modeStr) { self.bgMode = mode }
        if let solid = UserDefaults.standard.string(forKey: "cfg_bgSolidColor") {
            self.bgSolidColorStr = solid
        }
    }
    
    // MARK: - 主题
    @Published var selectedTheme: ColorTheme = .ocean {
        didSet {
            UserDefaults.standard.set(selectedTheme.rawValue, forKey: "cfg_theme")
        }
    }
    
    // MARK: - 背景配置
        @Published var bgMode: BackgroundMode = .image {
            didSet { UserDefaults.standard.set(bgMode.rawValue, forKey: "cfg_bgMode") }
        }
        
        // 1. 纯色模式配置
        @Published var bgSolidColorStr: String = "000000" { // 存储 Hex 字符串
            didSet { UserDefaults.standard.set(bgSolidColorStr, forKey: "cfg_bgSolidColor") }
        }
        
        // 2. 动画模式配置
        @Published var bgAnimColor1Str: String = "0F2027" // 深蓝/黑
        @Published var bgAnimColor2Str: String = "203A43" // 青绿
        
        // 动画速度 (0.5 - 5.0), 值越大越快
        @Published var bgAnimSpeed: Double = 1.0 {
            didSet { UserDefaults.standard.set(bgAnimSpeed, forKey: "cfg_bgAnimSpeed") }
        }
        
        // 3. 图片模式配置 (图片名称，需对应 Assets)
        @Published var bgImageName: String = "bgImage" {
            didSet { UserDefaults.standard.set(bgImageName, forKey: "cfg_bgImageName") }
        }
    
    // MARK: - 字体
    @Published var fontWeight: Font.Weight = .heavy {
        didSet {
            UserDefaults.standard.set(FloatConfig.mapWeightToString(fontWeight), forKey: "cfg_fontWeight")
        }
    }
    
    @Published var glassEffectOn: Bool = true {
        didSet{
            UserDefaults.standard.set(glassEffectOn, forKey: "cfg_glassEffectOn")
        }
    }
    
    @Published var fontDesign: Font.Design = .rounded
    
    @Published var fontSizeRatio: CGFloat = 0.65 {
        didSet {
            UserDefaults.standard.set(fontSizeRatio, forKey: "cfg_fontSizeRatio")
        }
    }
    
    // MARK: - 位置分布
    @Published var spreadFactor: CGFloat = 1.0 {
        didSet {
            UserDefaults.standard.set(spreadFactor, forKey: "cfg_spreadFactor")
        }
    }
    private let baseOffsets: [CGFloat] = [-0.36, -0.12, 0.0, 0.12, 0.36]
    var horizontalPositions: [CGFloat] {
        return baseOffsets.map { offset in
            0.5 + (offset * spreadFactor)
        }
    }
    
    // MARK: - 浮动动画
    var floatRangeXRatio: CGFloat = 0.02
    var floatRangeYRatio: CGFloat = 0.00
    var rotationRange: Double = 5.0
    var baseSpeed: Double = 20.0
    
    var stabilizeResponse: Double = 0.6
    var stabilizeDamping: Double = 0.6
    
    @Published var animationStyle: DigitAnimationStyle = .fly {
        didSet {
            UserDefaults.standard.set(animationStyle.rawValue, forKey: "cfg_animationStyle")
        }
    }
    
    lazy var startAngel: [Double] = {
        return generateValidAngles()
    }()
    
    // MARK: - 辅助方法
    // 序列化保存
    private static func mapWeightToString(_ weight: Font.Weight) -> String {
        switch weight {
        case .ultraLight: return "ultraLight"
        case .thin: return "thin"
        case .light: return "light"
        case .regular: return "regular"
        case .medium: return "medium"
        case .semibold: return "semibold"
        case .bold: return "bold"
        case .heavy: return "heavy"
        case .black: return "black"
        default: return "heavy"
        }
    }
    
    private static func mapStringToWeight(_ name: String) -> Font.Weight {
        switch name {
        case "ultraLight": return .ultraLight
        case "thin": return .thin
        case "light": return .light
        case "regular": return .regular
        case "medium": return .medium
        case "semibold": return .semibold
        case "bold": return .bold
        case "heavy": return .heavy
        case "black": return .black
        default: return .heavy
        }
    }
    
    // 初始角度生成
    private func generateValidAngles() -> [Double] {
        var angles = Array(repeating: 0.0, count: 5)
        let positiveAngles = [Double.random(in: 1.0...4.0), Double.random(in: 1.0...4.0)]
        let negativeAngles = [-Double.random(in: 1.0...4.0), -Double.random(in: 1.0...4.0)]
        var fourAngles = positiveAngles + negativeAngles
        fourAngles.shuffle()
        let positions = [0, 1, 3, 4]
        for (index, position) in positions.enumerated() {
            angles[position] = fourAngles[index]
        }
        let sum = angles[0] + angles[1] + angles[3] + angles[4]
        let middleAngle = -sum
        if abs(middleAngle) >= 1.0 && abs(middleAngle) <= 4.0 {
            angles[2] = middleAngle
            return angles
        } else {
            return generateValidAngles()
        }
    }
    
    func getBaseRotation(position: Int, isColon: Bool) -> Double {
        if isColon { return startAngel[2] }
        guard position >= 0 && position < startAngel.count else { return 0 }
        return startAngel[position]
    }
    
    //    // MARK: - 新增：水面高度
    //    // 0.0 (顶部) 到 1.0 (底部)，默认中间偏下
    //    @Published var waterLevelRatio: CGFloat = 0.5 {
    //        didSet {
    //            UserDefaults.standard.set(waterLevelRatio, forKey: "cfg_waterLevelRatio")
    //        }
    //    }
    //
    //    // MARK: - 新增：时间变动触发器
    //    // 每次时间变化时，在 ContentView 中更新这个值来触发 WaterWaveView 的 onChange 逻辑
    //    @Published var triggerTime: Date = Date()
}
