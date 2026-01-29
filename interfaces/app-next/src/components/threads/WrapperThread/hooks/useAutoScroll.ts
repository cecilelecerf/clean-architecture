import { useEffect, RefObject } from 'react';

interface UseAutoScrollProps {
  bottomRef: RefObject<HTMLDivElement>;
  trigger: any;
  behavior?: ScrollBehavior;
}

export const useAutoScroll = ({ bottomRef, trigger, behavior = 'smooth' }: UseAutoScrollProps) => {
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, [trigger, bottomRef, behavior]);
};
