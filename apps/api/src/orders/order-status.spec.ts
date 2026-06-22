import { describe, expect, it } from 'vitest';
import {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  TERMINAL_ORDER_STATUSES,
  canTransitionOrderStatus,
} from '@lynq/types';

describe('order status state machine', () => {
  it('allows received -> washing', () => {
    expect(canTransitionOrderStatus('received', 'washing')).toBe(true);
  });

  it('rejects received -> delivered', () => {
    expect(canTransitionOrderStatus('received', 'delivered')).toBe(false);
  });

  it('treats delivered and cancelled as terminal', () => {
    for (const status of TERMINAL_ORDER_STATUSES) {
      expect(ORDER_STATUS_TRANSITIONS[status]).toEqual([]);
    }
  });

  it('every status has a transition entry', () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_TRANSITIONS[status]).toBeDefined();
    }
  });

  it('only references known statuses in transitions', () => {
    for (const next of Object.values(ORDER_STATUS_TRANSITIONS).flat()) {
      expect(ORDER_STATUSES).toContain(next);
    }
  });
});
