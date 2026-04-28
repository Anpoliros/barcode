//
//  BackgroundView.swift
//  FloatingClock
//
//  Created by anpoliros on 2025/12/16.
//

import SwiftUI

struct BackgroundView: View {
    @ObservedObject var config = FloatConfig.shared
    
    var body: some View {
        GeometryReader { proxy in
            ZStack {
                switch config.bgMode {
                case .solid:
//                    Color(hex: config.bgSolidColorStr)
//                        .ignoresSafeArea()
                    Color.white
                        .ignoresSafeArea()
                    
                case .animation:
                    FlowingGradientView(
//                        color1: Color(hex: config.bgAnimColor1Str) ?? Color.black,
//                        color2: Color(hex: config.bgAnimColor2Str) ?? Color.black,
//                        color1: Color("Ocean/1").opacity(0.4),
//                        color2: Color("Ocean/2").opacity(0.4),
                        color1: config.selectedTheme.gradientColors[1],
                        color2: config.selectedTheme.gradientColors[2],
                        speed: config.bgAnimSpeed
                    )
                    
                case .image:
                    Image(config.bgImageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: proxy.size.width, height: proxy.size.height)
                        .clipped()
                        .ignoresSafeArea()
                }
            }
        }
        .ignoresSafeArea()
        .animation(.easeInOut(duration: 0.5), value: config.bgMode) // 模式切换时的过渡
    }
}

// MARK: - 流体动画子视图
struct FlowingGradientView: View {
    var color1: Color
    var color2: Color
    var speed: Double
    
    @State private var offset1: CGSize = .zero
    @State private var offset2: CGSize = .zero
    @State private var scale: CGFloat = 1.0
    
    // 基础动画时间，速度越快时间越短
    private var duration: Double {
        return 10.0 / max(0.1, speed)
    }
    
    var body: some View {
        ZStack {
            // 背景底色 (混合后的深色底，避免颜色过亮)
            Color.black
            
            // 两个流动的色块
            GeometryReader { proxy in
                ZStack {
                    // 色块 1
                    Circle()
                        .fill(color1)
                        .frame(width: proxy.size.width * 1.2, height: proxy.size.width * 1.2)
                        .blur(radius: 80)
                        .offset(offset1)
                        .opacity(0.8)
                    
                    // 色块 2
                    Circle()
                        .fill(color2)
                        .frame(width: proxy.size.width * 1.0, height: proxy.size.width * 1.0)
                        .blur(radius: 60)
                        .offset(offset2)
                        .opacity(0.8)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .onAppear {
                    startAnimation(size: proxy.size)
                }
                .onChange(of: speed) { _ in
                    // 如果速度改变，可能需要重启动画 (简化处理)
                    startAnimation(size: proxy.size)
                }
            }
        }
        .ignoresSafeArea()
    }
    
    private func startAnimation(size: CGSize) {
        let w = size.width
        let h = size.height
        
        // 简单的循环游走动画
        withAnimation(.easeInOut(duration: duration).repeatForever(autoreverses: true)) {
            offset1 = CGSize(width: w * 0.3, height: h * 0.2)
            scale = 1.2
        }
        
        withAnimation(.easeInOut(duration: duration * 1.3).repeatForever(autoreverses: true)) {
            offset2 = CGSize(width: -w * 0.3, height: -h * 0.2)
        }
    }
}
