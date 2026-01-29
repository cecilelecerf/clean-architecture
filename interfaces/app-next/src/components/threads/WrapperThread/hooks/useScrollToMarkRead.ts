import { useEffect, useCallback, useRef, RefObject } from 'react';

interface UseScrollToMarkReadProps {
  scrollContainerRef: RefObject<HTMLDivElement>;
  onScrollStopped: () => void;
  debounceMs?: number;
}

export const useScrollToMarkRead = ({
  scrollContainerRef,
  onScrollStopped,
  debounceMs = 1500,
}: UseScrollToMarkReadProps) => {
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    if (markReadTimeoutRef.current) {
      clearTimeout(markReadTimeoutRef.current);
    }

    markReadTimeoutRef.current = setTimeout(() => {
       onScrollStopped();
    }, debounceMs);
  }, [onScrollStopped, debounceMs]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
      }
    };
  }, [handleScroll, scrollContainerRef]);
};
