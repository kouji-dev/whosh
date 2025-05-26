import { useEffect, useRef } from 'react';
import { TIKK_CLIENT_ID_COOKIE_NAME, TIKK_TOKEN } from '@/lib/constants';

const eventSourceMap: Record<string, EventSource> = {};

function getOrCreateClientId(): string {
  const cookieName = TIKK_CLIENT_ID_COOKIE_NAME;
  const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
  if (match) return match[2];
  const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
  document.cookie = `${cookieName}=${id}; path=/; max-age=31536000`; // 1 year
  return id;
}

export function useSse(event: string, handler: (data: any) => void) {
  const handlerRef = useRef(handler);
  const prevHandler = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && prevHandler.current !== handler) {
      // eslint-disable-next-line no-console
      console.error(
        'The handler passed to useSse should be memoized with useCallback to avoid unnecessary re-subscribing.'
      );
      //throw new Error('Handler passed to useSse must be stable (use useCallback).');
    }
    prevHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const id = getOrCreateClientId();
    const key = `${id}:${event}`;
    let eventSource = eventSourceMap[key];
    if (!eventSource) {
      const token = typeof window !== 'undefined' ? localStorage.getItem(TIKK_TOKEN) : null;
      const url = token
        ? `/api/sse?id=${id}&token=${encodeURIComponent(token)}`
        : `/api/sse?id=${id}`;
      eventSource = new EventSource(url);
      eventSourceMap[key] = eventSource;
    }

    function onEvent(e: MessageEvent) {
      console.info(`Received SSE event from ${id}: ${event} with data: ${e.data}`);
      handlerRef.current(JSON.parse(e.data));
    }

    eventSource.addEventListener(event, onEvent);

    return () => {
      eventSource.removeEventListener(event, onEvent);
      eventSource.close();
      delete eventSourceMap[key];
    };
  }, [event]);
} 