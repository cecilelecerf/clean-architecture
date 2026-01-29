import { useEffect, useRef } from 'react';

interface UseAutoMarkReadOnMountProps {
  threadId: string;
  hasUnreadMessages: () => boolean;
  markMessagesAsRead: () => void;
  delayMs?: number;
}

export const useAutoMarkReadOnMount = ({
  threadId,
  hasUnreadMessages,
  markMessagesAsRead,
  delayMs = 1000,
}: UseAutoMarkReadOnMountProps) => {
  const hasMarkedOnMountRef = useRef(false);

  useEffect(() => {
    if (hasMarkedOnMountRef.current) return;

    if (!hasUnreadMessages()) {
      console.log('ℹ️ No unread messages on mount');
      hasMarkedOnMountRef.current = true;
      return;
    }

    console.log('🎬 Component mounted, scheduling read marking...');

    const timer = setTimeout(() => {
      markMessagesAsRead();
      hasMarkedOnMountRef.current = true;
    }, delayMs);

    return () => clearTimeout(timer);
  }, [threadId]);
};
