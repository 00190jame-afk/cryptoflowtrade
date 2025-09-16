import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll to top on every route change
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant jump to top to avoid showing footer first
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
