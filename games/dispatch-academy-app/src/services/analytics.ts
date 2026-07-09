/**
 * Lightweight, dependency-free analytics and error tracking.
 *
 * Events are kept in a capped ring buffer in localStorage so they survive
 * reloads and can be inspected or exported. If VITE_ANALYTICS_ENDPOINT is set
 * at build time, events are also POSTed there (best-effort, via sendBeacon /
 * fetch keepalive). With no endpoint configured it works fully offline and is
 * ready to plug a backend or Sentry-style service into later.
 *
 * No personal data is collected — only event names, coarse properties and
 * error messages/stack traces.
 */

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, unknown>;
  ts: string; // ISO timestamp
}

const STORAGE_KEY = 'dispatch-academy-analytics';
const MAX_EVENTS = 200;

/** Pure: append an event to a buffer, trimming to the newest `max` entries. */
export function appendEvent(
  buffer: AnalyticsEvent[],
  event: AnalyticsEvent,
  max: number = MAX_EVENTS
): AnalyticsEvent[] {
  const next = [...buffer, event];
  return next.length > max ? next.slice(next.length - max) : next;
}

function readBuffer(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeBuffer(buffer: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
  } catch {
    /* storage full or unavailable — drop silently */
  }
}

const endpoint: string | undefined = import.meta.env.VITE_ANALYTICS_ENDPOINT;

function dispatch(event: AnalyticsEvent): void {
  if (!endpoint) return;
  try {
    const body = JSON.stringify(event);
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon(endpoint, body);
    } else if (typeof fetch !== 'undefined') {
      fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* never let analytics throw into the app */
  }
}

/** Records a product event. */
export function track(name: string, props?: Record<string, unknown>): void {
  const event: AnalyticsEvent = { name, props, ts: new Date().toISOString() };
  writeBuffer(appendEvent(readBuffer(), event));
  dispatch(event);
  if (import.meta.env.DEV) {
    // Helpful while developing; silent in production.
    // eslint-disable-next-line no-console
    console.debug('[analytics]', name, props ?? '');
  }
}

/** Records an error with optional context. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const err = error instanceof Error ? error : new Error(String(error));
  track('error', {
    message: err.message,
    stack: err.stack?.slice(0, 2000),
    ...context,
  });
}

/** Returns a copy of the stored events (newest last). */
export function getEvents(): AnalyticsEvent[] {
  return readBuffer();
}

/** Clears the stored events. */
export function clearEvents(): void {
  writeBuffer([]);
}

let initialised = false;

/** Installs global error/rejection handlers. Safe to call more than once. */
export function initAnalytics(): void {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  window.addEventListener('error', (e) => {
    captureError(e.error ?? e.message, { source: 'window.onerror' });
  });
  window.addEventListener('unhandledrejection', (e) => {
    captureError(e.reason, { source: 'unhandledrejection' });
  });

  track('app_open', { ua: typeof navigator !== 'undefined' ? navigator.userAgent : '' });
}
