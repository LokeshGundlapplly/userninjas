import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { traceNavigation } from "@/lib/tracing";

/**
 * Hook that automatically traces page navigation whenever the route changes.
 * Place this hook inside a component that is rendered within <BrowserRouter>.
 */
export function usePageTracking(): void {
  const location = useLocation();
  const previousPathRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    traceNavigation(currentPath, previousPathRef.current);
    previousPathRef.current = currentPath;
  }, [location]);
}
