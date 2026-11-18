import test from 'node:test';
import assert from 'node:assert/strict';
import type { KeyboardEvent } from 'react';
import {
  getNextTabValue,
  handleModalFocusTrapKeyDown,
  handleTabListKeyDown,
} from './a11y.ts';

const TABS = ['All', 'Transport', 'Energy', 'Greenery'] as const;

test('getNextTabValue resolves arrow, Home, and End navigation with wraparound', () => {
  assert.equal(getNextTabValue('ArrowRight', TABS, 'All'), 'Transport');
  assert.equal(getNextTabValue('ArrowRight', TABS, 'Greenery'), 'All');
  assert.equal(getNextTabValue('ArrowLeft', TABS, 'All'), 'Greenery');
  assert.equal(getNextTabValue('ArrowDown', TABS, 'Transport'), 'Energy');
  assert.equal(getNextTabValue('ArrowUp', TABS, 'Transport'), 'All');
  assert.equal(getNextTabValue('Home', TABS, 'Energy'), 'All');
  assert.equal(getNextTabValue('End', TABS, 'All'), 'Greenery');
  assert.equal(getNextTabValue('Enter', TABS, 'All'), null);
  assert.equal(getNextTabValue('ArrowRight', [], 'All'), null);
});

test('handleTabListKeyDown prevents default, calls onChange, and focuses target tab button', () => {
  let prevented = false;
  let selected = '';
  let focusedIndex = -1;

  const fakeTabs = [0, 1, 2, 3].map((idx) => ({
    focus() {
      focusedIndex = idx;
    },
  }));

  const fakeEvent = {
    key: 'ArrowRight',
    preventDefault() {
      prevented = true;
    },
    currentTarget: {
      closest(selector: string) {
        if (selector === '[role="tablist"]') {
          return {
            querySelectorAll() {
              return fakeTabs;
            },
          };
        }
        return null;
      },
    },
  } as unknown as KeyboardEvent<HTMLElement>;

  handleTabListKeyDown(fakeEvent, TABS, 'All', (next) => {
    selected = next;
  });

  assert.equal(prevented, true);
  assert.equal(selected, 'Transport');
  assert.equal(focusedIndex, 1);
});

test('handleModalFocusTrapKeyDown wraps Tab from last to first and Shift+Tab from first to last', () => {
  let focused = '';
  const firstBtn = {
    focus() {
      focused = 'first';
    },
  } as unknown as HTMLElement;
  const lastBtn = {
    focus() {
      focused = 'last';
    },
  } as unknown as HTMLElement;

  const originalDoc = Object.getOwnPropertyDescriptor(globalThis, 'document');
  let activeEl: unknown = lastBtn;

  Object.defineProperty(globalThis, 'document', {
    value: {
      get activeElement() {
        return activeEl;
      },
    },
    configurable: true,
    writable: true,
  });

  const container = {
    querySelectorAll() {
      return [firstBtn, lastBtn];
    },
  } as unknown as HTMLElement;

  try {
    let tabPrevented = false;
    handleModalFocusTrapKeyDown(
      {
        key: 'Tab',
        shiftKey: false,
        preventDefault() {
          tabPrevented = true;
        },
      } as unknown as KeyboardEvent<HTMLElement>,
      container
    );
    assert.equal(tabPrevented, true);
    assert.equal(focused, 'first');

    activeEl = firstBtn;
    let shiftTabPrevented = false;
    handleModalFocusTrapKeyDown(
      {
        key: 'Tab',
        shiftKey: true,
        preventDefault() {
          shiftTabPrevented = true;
        },
      } as unknown as KeyboardEvent<HTMLElement>,
      container
    );
    assert.equal(shiftTabPrevented, true);
    assert.equal(focused, 'last');
  } finally {
    if (originalDoc) {
      Object.defineProperty(globalThis, 'document', originalDoc);
    } else {
      delete (globalThis as { document?: Document }).document;
    }
  }
});
