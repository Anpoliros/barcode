//
//  ColorModel.swift
//  FloatingClock
//
//  Created by anpoliros on 2025/12/5.
//

import SwiftUI

// MARK: - Color Theme Model

// 关键修改：改为 enum，继承 String 以支持 AppStorage 存储，遵循 CaseIterable 以支持遍历
enum ColorTheme: String, CaseIterable, Identifiable {
    case ocean = "ocean"
    case grass = "grass"
    case sunset = "sunset"
    case fantasy = "fantasy"
    case rainbow = "rainbow"
    
    // Identifiable 协议要求
    var id: String { self.rawValue }
    
    // 显示名称
    var name: String {
        switch self {
        case .ocean: return "Ocean"
        case .grass: return "Meadow"
        case .sunset: return "Sunset"
        case .fantasy: return "Fantasy"
        case .rainbow: return "Rainbow"
        }
    }
    
    // 渐变色配置
    var gradientColors: [Color] {
        switch self {
        case .ocean:
            return [
                Color("Ocean/1").opacity(1.0),
                Color("Ocean/2").opacity(0.75),
                Color("Ocean/1").opacity(1.0),
                Color("Ocean/2").opacity(0.75)
            ]
        case .grass:
            return [
                Color("Grass/1"),
                Color("Grass/2").opacity(0.85),
                Color("Grass/1"),
                Color("Grass/2").opacity(0.9)
            ]
        case .sunset:
            return [
                Color("Sunset/1"),
                Color("Sunset/2").opacity(0.85),
                Color("Sunset/1"),
                Color("Sunset/2").opacity(0.9)
            ]
        case .fantasy:
            return [
                Color("Fantasy/1"),
                Color("Fantasy/2").opacity(0.85),
                Color("Fantasy/1"),
                Color("Fantasy/2").opacity(0.9)
            ]
        case .rainbow:
            return [
                Color("Rainbow/1").opacity(0.8),
                Color("Rainbow/2").opacity(0.8),
                Color("Rainbow/3").opacity(0.8),
                Color("Rainbow/4").opacity(0.8)
            ]
        }
    }
    
    // 冒号颜色
    var colonColor: Color {
        return Color("Colon").opacity(0.6)
    }
    
    // 重叠部分颜色
    var overlapColor: Color {
        return gradientColors.first ?? Color.white
    }
}

extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        
        guard Scanner(string: hex).scanHexInt64(&int) else { return nil }
        
        let r, g, b, a: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (r, g, b, a) = ((int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17, 255)
        case 6: // RGB (24-bit)
            (r, g, b, a) = (int >> 16, int >> 8 & 0xFF, int & 0xFF, 255)
        case 8: // RGBA (32-bit)
            (r, g, b, a) = (int >> 24 & 0xFF, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
