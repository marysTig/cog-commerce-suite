import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Automatically scrolls to the top of the page whenever the route changes.
 * Fixes the issue where clicking footer links appears to "do nothing" on mobile
 * because the page navigates but the scroll position stays at the bottom.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};
