import { apiFetch } from "@/src/lib/apiClient";
import { BlockedDays } from "@/src/utils/blockedDays";
import { ShowToastMessage } from "@/src/utils/random";
import { useCallback, useEffect, useState } from "react";

const empty: BlockedDays = { blockWeekends: false, dates: [] };

export function useBlockedDays() {
  const [blocked, setBlocked] = useState<BlockedDays>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ success: boolean; data?: BlockedDays }>("/appointment/blocked-days");
      if (res.success) {
        setBlocked({
          blockWeekends: Boolean(res.data?.blockWeekends),
          dates: res.data?.dates || [],
        });
      }
    } catch {
      // Saving an appointment still checks blocked days on the server.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (next: BlockedDays) => {
    const previous = blocked;
    setBlocked(next);
    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; data?: BlockedDays }>("/appointment/blocked-days", {
        method: "PUT",
        body: JSON.stringify(next),
      });
      setBlocked({
        blockWeekends: Boolean(res.data?.blockWeekends),
        dates: res.data?.dates || next.dates,
      });
    } catch (error: any) {
      setBlocked(previous);
      ShowToastMessage({
        title: error.message ?? "Could not update blocked days",
        preset: "error",
        haptic: "error",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return { blocked, loading, saving, persist };
}
