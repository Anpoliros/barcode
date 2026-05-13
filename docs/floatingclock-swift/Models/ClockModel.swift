import SwiftUI

// MARK: - Time Digit Model
// 颜色部分已移动至 Model.swift

struct TimeDigit: Identifiable {
    let id = UUID()
    let value: String
    let position: Int // 0-3 表示四个位置
}

// MARK: TODO
// 迁移contentview中的时间helper函数到这里
