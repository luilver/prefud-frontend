import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // 1. Portrait orientation up to tablet width (1024px)
    // 2. Landscape orientation for mobile phones (height <= 500px)
    // 3. Fallback for any screen < 768px
    const query = "(max-width: 1024px) and (orientation: portrait), (max-height: 500px) and (orientation: landscape), (max-width: 767px)";
    const mql = window.matchMedia(query);
    
    const onChange = () => {
      setIsMobile(mql.matches);
    }
    
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile
}
