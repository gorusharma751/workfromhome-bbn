import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppBranding {
  app_name: string;
  logo_url: string;
}

interface TelegramLinks {
  group_link: string;
  support_link: string;
}

interface AppSettings {
  branding: AppBranding;
  telegram: TelegramLinks;
  loading: boolean;
}

const DEFAULT_BRANDING: AppBranding = { app_name: "WorkFromHome", logo_url: "" };
const DEFAULT_TELEGRAM: TelegramLinks = { group_link: "https://t.me/workfromhome_updates", support_link: "https://t.me/workfromhome_support" };

export const useAppSettings = (): AppSettings => {
  const [branding, setBranding] = useState<AppBranding>(DEFAULT_BRANDING);
  const [telegram, setTelegram] = useState<TelegramLinks>(DEFAULT_TELEGRAM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("admin_settings")
          .select("key, value")
          .in("key", ["app_branding", "telegram"]);

        if (data) {
          for (const row of data) {
            if (row.key === "app_branding" && row.value) {
              const v = row.value as any;
              setBranding({
                app_name: v.app_name || DEFAULT_BRANDING.app_name,
                logo_url: v.logo_url || "",
              });
            }
            if (row.key === "telegram" && row.value) {
              const v = row.value as any;
              setTelegram({
                group_link: v.group_link || DEFAULT_TELEGRAM.group_link,
                support_link: v.support_link || DEFAULT_TELEGRAM.support_link,
              });
            }
          }
        }
      } catch (e) {
        console.error("Failed to load app settings", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { branding, telegram, loading };
};
