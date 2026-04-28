import { useState, useEffect } from "react";
import { AppConfig } from "../config/app.config";

export function useReminder(reminderConfig: AppConfig["reminder"]) {
  const [hasPunched, setHasPunched] = useState(true);

  useEffect(() => {
    const checkPunch = () => {
      const todayDateStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
      const now = new Date();

      if (!reminderConfig?.refreshTime) return;

      // 如果是周末（周六、周日），直接视为已打卡不提醒
      if (now.getDay() === 0 || now.getDay() === 6) {
        setHasPunched(true);
        return;
      }

      const [hours, minutes] = reminderConfig.refreshTime.split(':').map(Number);
      const refreshDate = new Date();
      refreshDate.setHours(hours, minutes, 0, 0);

      // If last punched is not today, and we are past refresh time, or last punched is totally empty
      if (reminderConfig.lastPunchedDate !== todayDateStr) {
        if (now >= refreshDate) setHasPunched(false);
        else setHasPunched(true);
      } else {
        setHasPunched(true);
      }
    };

    checkPunch();
    const intv = setInterval(checkPunch, 60000); // Check every minute
    return () => clearInterval(intv);
  }, [reminderConfig?.refreshTime, reminderConfig?.lastPunchedDate]);

  return {
    state: { hasPunched },
    actions: { setHasPunched }
  };
}