import test from 'node:test';
import assert from 'node:assert/strict';
import type { KeyboardEvent } from 'react';
import { getNextTabValue, handleTabListKeyDown } from './a11y.ts';

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
      querySelectorAll() {
        return fakeTabs;
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
