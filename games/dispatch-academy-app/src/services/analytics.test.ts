import { describe, it, expect, beforeEach } from 'vitest';
import {
  appendEvent,
  track,
  captureError,
  getEvents,
  clearEvents,
  type AnalyticsEvent,
} from './analytics';

const evt = (name: string): AnalyticsEvent => ({ name, ts: new Date().toISOString() });

describe('appendEvent', () => {
  it('appends to the end', () => {
    const out = appendEvent([evt('a')], evt('b'));
    expect(out.map((e) => e.name)).toEqual(['a', 'b']);
  });

  it('trims to the newest max entries', () => {
    const buffer = [evt('a'), evt('b'), evt('c')];
    const out = appendEvent(buffer, evt('d'), 3);
    expect(out.map((e) => e.name)).toEqual(['b', 'c', 'd']);
  });
});

describe('track / getEvents', () => {
  beforeEach(() => clearEvents());

  it('persists tracked events', () => {
    track('lesson_complete', { dayId: 3 });
    const events = getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe('lesson_complete');
    expect(events[0]!.props).toEqual({ dayId: 3 });
    expect(events[0]!.ts).toBeTypeOf('string');
  });

  it('captureError stores an error event with a message', () => {
    captureError(new Error('boom'), { where: 'test' });
    const events = getEvents();
    expect(events[0]!.name).toBe('error');
    expect(events[0]!.props?.message).toBe('boom');
    expect(events[0]!.props?.where).toBe('test');
  });

  it('captureError coerces non-Error values', () => {
    captureError('string failure');
    expect(getEvents()[0]!.props?.message).toBe('string failure');
  });

  it('clearEvents empties the buffer', () => {
    track('x');
    clearEvents();
    expect(getEvents()).toEqual([]);
  });
});
