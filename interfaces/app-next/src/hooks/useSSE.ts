import { useEffect, useRef, useState } from 'react';

interface UseSSEOptions<T> {
  url: string;
  onMessage: (data: T) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export function useSSE<T = any>({ url, onMessage, onError, enabled = true }: UseSSEOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!enabled) return;

    console.log(`🔌 Connecting to SSE: ${url}`);

    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE Connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        onMessage(data);
      } catch (error) {
        console.error('❌ Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      setIsConnected(false);
      onError?.(error);
    };

    return () => {
      console.log('🔌 Disconnecting SSE');
      eventSource.close();
      setIsConnected(false);
    };
  }, [url, enabled, onMessage, onError]);

  return { isConnected };
}
