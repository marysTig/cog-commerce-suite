import { useLocation } from "react-router-dom";
import { useRef, useEffect, useState, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Wraps page content and plays a fade-up animation every time the route changes.
 * No external dependencies — pure CSS + React state.
 */
export const PageTransition = ({ children }: PageTransitionProps) => {
  const { pathname } = useLocation();
  const [displayedPath, setDisplayedPath] = useState(pathname);
  const [animating, setAnimating] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;

    // 1. Start exit fade-out
    setAnimating(true);

    // 2. After the exit animation, swap content and fade in
    const swapTimer = setTimeout(() => {
      setDisplayedPath(pathname);
      prevPath.current = pathname;
    }, 180); // half the total transition

    // 3. Clear animating flag so new content fades in
    const clearTimer = setTimeout(() => {
      setAnimating(false);
    }, 200);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(clearTimer);
    };
  }, [pathname]);

  return (
    <div
      key={displayedPath}
      className={animating ? "page-exit" : "page-enter"}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </div>
  );
};
