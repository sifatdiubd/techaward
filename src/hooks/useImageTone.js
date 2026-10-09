import { useEffect, useState } from "react";

export default function useImageTone(src) {
  const [tone, setTone] = useState(null);
  useEffect(() => {
    if (!src) {
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = (canvas.width = 32);
        const h = (canvas.height = 32);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let total = 0;
        let count = 0;
        for (let px = 0; px < data.length; px += 4) {
          if (data[px + 3] < 30) {
            continue;
          }
          const red = data[px];
          const green = data[px + 1];
          const blue = data[px + 2];
          total += 0.299 * red + 0.587 * green + 0.114 * blue;
          count++;
        }
        if (cancelled) {
          return;
        }
        if (count === 0) {
          setTone("light");
          return;
        }
        const avg = total / count;
        setTone(avg > 160 ? "dark" : "light");
      } catch {
        if (!cancelled) {
          setTone("light");
        }
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setTone("light");
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return tone;
}
