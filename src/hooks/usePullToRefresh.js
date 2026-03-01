import { useEffect, useRef, useState } from "react";

export const usePullToRefresh = (onRefresh) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);

  useEffect(() => {
    const handleTouchStart = (event) => {
      if (window.scrollY === 0) {
        startYRef.current = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event) => {
      if (startYRef.current === null || window.scrollY > 0 || refreshing) {
        return;
      }

      const delta = event.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta, 90));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= 70 && !refreshing) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
      setPullDistance(0);
      startYRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh, pullDistance, refreshing]);

  return { pullDistance, refreshing };
};
