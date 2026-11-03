import { useLayoutEffect } from "react";
import { desktopReferenceWidth, interfaceScale } from "common/constants/layout";

export function useDesktopScale() {
  useLayoutEffect(() => {
    const updateScale = () => {
      const scale =
        Math.max(1, window.innerWidth / desktopReferenceWidth) * interfaceScale;
      document.documentElement.style.zoom = String(scale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
      document.documentElement.style.zoom = "";
    };
  }, []);
}
