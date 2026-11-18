import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  addUniqueItem,
  clearPersistedState,
  isPageId,
  loadPersistedState,
  parseHashPage,
  savePersistedState,
  toggleListItem,
} from './storage.ts';

function withMockStorage(
  impl: Partial<Storage>,
  run: (store: Map<string, string>) => void
) {
  const store = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  const mockStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    ...impl,
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });

  try {
    run(store);
  } finally {
    if (original) {
      Object.defineProperty(globalThis, 'localStorage', original);
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  }
}

test('isPageId and parseHashPage validate workspace and landing routes strictly', () => {
  assert.equal(isPageId('dashboard'), true);
  assert.equal(isPageId('sustainability'), true);
  assert.equal(isPageId('unknown-route'), false);

  assert.equal(parseHashPage('#insights'), 'insights');
  assert.equal(parseHashPage('calculator'), 'calculator');
  assert.equal(parseHashPage('#__proto__'), null);
  assert.equal(parseHashPage(''), null);
});

test('toggleListItem and addUniqueItem behave immutably without duplicates', () => {
  const base = ['a', 'b'] as const;
  assert.deepEqual(toggleListItem(base, 'c'), ['a', 'b', 'c']);
  assert.deepEqual(toggleListItem(base, 'a'), ['b']);
  assert.deepEqual(addUniqueItem(base, 'b'), ['a', 'b']);
  assert.deepEqual(addUniqueItem(base, 'c'), ['a', 'b', 'c']);
  assert.deepEqual(base, ['a', 'b']);
});

test('loadPersistedState, savePersistedState, and clearPersistedState validate schema and handle errors', () => {
  withMockStorage({}, (store) => {
    assert.deepEqual(loadPersistedState(), {});

    savePersistedState({
      locationId: 'delhi-in',
      savedGreeneryTipIds: ['tip-balcony-shade'],
    });
    assert.ok(store.has(STORAGE_KEY));
    assert.deepEqual(loadPersistedState(), {
      locationId: 'delhi-in',
      savedGreeneryTipIds: ['tip-balcony-shade'],
    });

    // Tampered schema falls back safely to {}
    store.set(
      STORAGE_KEY,
      JSON.stringify({ profile: { householdSize: 999, groups: ['invalid'] } })
    );
    assert.deepEqual(loadPersistedState(), {});

    // Malformed JSON falls back safely to {}
    store.set(STORAGE_KEY, '{not-valid-json');
    assert.deepEqual(loadPersistedState(), {});

    clearPersistedState();
    assert.equal(store.has(STORAGE_KEY), false);
  });

  // Storage access / quota errors never throw uncaught exceptions
  withMockStorage(
    {
      getItem() {
        throw new Error('SecurityError');
      },
      setItem() {
        throw new Error('QuotaExceededError');
      },
      removeItem() {
        throw new Error('SecurityError');
      },
    },
    () => {
      assert.deepEqual(loadPersistedState(), {});
      assert.doesNotThrow(() => savePersistedState({ locationId: 'delhi-in' }));
      assert.doesNotThrow(() => clearPersistedState());
    }
  );
});
