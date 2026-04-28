import SwiftUI
import Combine

@available(iOS 26.0, *)
struct ContentView: View {
    @State private var currentTime = Date()
    
    // 新增：监听 Config 单例
    @ObservedObject private var config = FloatConfig.shared
    
    @State private var showSettings = false
    @State private var showControls = false
    @State private var hideTimer: DispatchWorkItem?
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                BackgroundView()
                
                // 时钟容器
                if #available(iOS 26.0, *) {
                    GlassEffectContainer{
                        clockView(screenHeight: geometry.size.height, screenWidth: geometry.size.width)
                        // An `offset` shows how Liquid Glass effects react to each other in a container.
                        // Use animations and components appearing and disappearing to obtain effects that look purposeful.
                        .offset(x: 0.0, y: 0.0)
                    }
                } else {
                    // Fallback on earlier versions
                    clockView(screenHeight: geometry.size.height, screenWidth: geometry.size.width)
                }
                
                // 全屏点击层
                Color.clear
                    .contentShape(Rectangle())
                    .onTapGesture {
                        wakeControls()
                    }
                
                // 设置按钮
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        ConfigButtonView(showSettings: $showSettings)
                            .padding(20)
                            .opacity(showSettings ? 1.0 : (showControls ? 1.0 : 0.0))
                            .animation(.easeInOut(duration: 0.3), value: showControls)
                            .animation(.easeInOut(duration: 0.3), value: showSettings)
                    }
                }
            }
        }
        .persistentSystemOverlays(.hidden)
        .statusBar(hidden: true)
        .onReceive(timer) { _ in
            currentTime = Date()
        }
        .preferredColorScheme(.dark)
        .onChange(of: showSettings) { oldValue, newValue in
            if newValue {
                cancelHideTimer()
                showControls = true
            } else {
                scheduleHideTimer()
            }
        }
    }
    
    // MARK: - Auto Hide Logic
    
    private func wakeControls() {
        if showSettings { return }
        withAnimation { showControls = true }
        scheduleHideTimer()
    }
    
    private func scheduleHideTimer() {
        cancelHideTimer()
        let task = DispatchWorkItem {
            withAnimation(.easeOut(duration: 1.0)) { showControls = false }
        }
        hideTimer = task
        DispatchQueue.main.asyncAfter(deadline: .now() + 5, execute: task)
    }
    
    private func cancelHideTimer() {
        hideTimer?.cancel()
        hideTimer = nil
    }
    
    // MARK: - Clock Views
    
    private func clockView(screenHeight: CGFloat, screenWidth: CGFloat) -> some View {
        let timeString = formatTime(currentTime)
        let components = parseTimeComponents(timeString)
        
        return ZStack {
            ForEach(Array(components.enumerated()), id: \.offset) { index, component in
                digitContainer(
                    digit: component,
                    position: index,
                    totalDigits: components.count,
                    screenHeight: screenHeight,
                    screenWidth: screenWidth,
                    isColon: component == ":",
                    trigger: timeString
                )
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func digitContainer(digit: String, position: Int, totalDigits: Int, screenHeight: CGFloat, screenWidth: CGFloat, isColon: Bool, trigger: String) -> some View {
        return FloatingDigitView(
            digit: digit,
            trigger: trigger,
            position: position,
            screenHeight: screenHeight,
            screenWidth: screenWidth,
            isColon: isColon,
            fontWeight: FloatConfig.shared.fontWeight
        )
        .zIndex(isColon ? 999 : Double(totalDigits - position))
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
    
    private func parseTimeComponents(_ timeString: String) -> [String] {
        return timeString.map { String($0) }
    }
}
