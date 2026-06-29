import { useEffect } from "react";

/**
 * Sets document.title for the lifetime of the calling component
 * and restores the previous title on unmount. WCAG 2.4.2.
 */
export function useDocumentTitle(title: string | undefined | null) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title.includes("Prefud") ? title : `${title} · Prefud`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

export default useDocumentTitle;