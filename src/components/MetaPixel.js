import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { db } from "@/lib/firebase";
import { initMetaPixel, injectPixelCode } from "@/lib/metaPixel";

export default function MetaPixel() {
  const location2 = useLocation();
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "general"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.metaPixelCode) {
          injectPixelCode(data.metaPixelCode);
        } else if (data?.metaPixelId) {
          initMetaPixel(data.metaPixelId);
        } else {
          initMetaPixel("993223400328670");
        }
      } else {
        initMetaPixel("993223400328670");
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location2]);
  return null;
}
