import SwiftUI

@main
struct FloatingClockApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    // MARK: - 状态管理
    // 使用 UserDefaults 存储标记，key 为 "isFirstLaunch"
    // 默认值为 true，表示默认是第一次启动
    @AppStorage("isFirstLaunch") var isFirstLaunch: Bool = true

    var body: some Scene {
        WindowGroup {
            // 使用 ZStack 或 Group 包裹主视图，以便统一添加 sheet
            Group {
                if #available(iOS 26.0, *) {
                    ContentView()
                } else {
                    ContentView15()
                }
            }
            // MARK: - 首次启动弹窗
            .sheet(isPresented: $isFirstLaunch) {
                // 当弹窗被关闭时，这里不需要额外操作，
                // 因为我们在 OnboardingView 里把 isPresented 设为 false 后，
                // AppStorage 会自动更新，下次启动就不会再显示了。
            } content: {
                OnboardingView(isPresented: $isFirstLaunch)
                    // 关键配置：控制弹窗高度
                    // .medium 大约占据屏幕一半
                    // .fraction(0.4) 占据 40% 高度，横屏下视野更好
                    .applySheetDetents()
            }
        }
    }
}

// MARK: - 辅助扩展：解决 iOS 版本兼容性问题
extension View {
    @ViewBuilder
    func applySheetDetents() -> some View {
        if #available(iOS 16.0, *) {
            // iOS 16+ 支持自定义高度
            // 在横屏模式下，建议高度不要太高，0.4-0.5 左右比较合适
            self.presentationDetents([.fraction(0.5), .medium])
                .presentationDragIndicator(.visible) // 显示顶部小抓手
                .interactiveDismissDisabled(true) // 可选：强制点击按钮才能关闭（防止误触）
        } else {
            // iOS 15 默认是全屏或标准 sheet，不做特殊处理
            self
        }
    }
}

// MARK: - App Delegate for Orientation Lock
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        return .landscape
    }
}
