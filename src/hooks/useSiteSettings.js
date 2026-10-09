import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { DEFAULT_APPS_SCRIPT_URL } from "@/lib/email";
import { db } from "@/lib/firebase";

const DEFAULT_SETTINGS = {
  dateStr: "",
  timeStr: "",
  venueStr: "",
  nominationOpen: true,
  appsScriptUrl: DEFAULT_APPS_SCRIPT_URL,
  eventDateTime: "",
};

export default function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "general"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (!data.appsScriptUrl) {
          data.appsScriptUrl = DEFAULT_APPS_SCRIPT_URL;
        }
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
        });
      }
    });
    return () => unsubscribe();
  }, []);
  return settings;
}
