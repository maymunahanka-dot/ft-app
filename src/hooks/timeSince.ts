import { useEffect, useState } from "react";

import { t as i18nT } from "@/src/i18n";
export const useTimeSince = () => {
  const [startTime] = useState(Date.now());

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100000);

    return () => clearInterval(interval);
  }, []);

  const secondsElapsed = Math.floor((now - startTime) / 1000);

  if (secondsElapsed < 60) {
    return i18nT("time.updatedSecs", { s: secondsElapsed });
  }

  const minutesElapsed = Math.floor(secondsElapsed / 60);
  return i18nT("time.updatedMin", { m: minutesElapsed, s: secondsElapsed % 60 });
};
