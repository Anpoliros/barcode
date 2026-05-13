/**
 * Reminder 默认配置
 */
import { AppConfig } from "../app.config";

export const defaultReminderConfig: AppConfig["reminder"] = {
  refreshTime: "13:00",
  reminderColor: "#FF3B30",
  popupText: "Have you punched in today? Please enter the current date (YYYY-MM-DD) to confirm.",
};
