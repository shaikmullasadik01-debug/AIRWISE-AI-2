import type { KeyboardEvent } from 'react';

export function getNextTabValue<T extends string>(
  key: string,
  items: readonly T[],
  currentValue: T
): T | null {
  if (items.length === 0) return null;
  const currentIdx = items.indexOf(currentValue);
  if (currentIdx === -1) return null;

  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return items[(currentIdx + 1) % items.length] ?? null;
    case 'ArrowLeft':
    case 'ArrowUp':
      return items[(currentIdx - 1 + items.length) % items.length] ?? null;
    case 'Home':
      return items[0] ?? null;
    case 'End':
      return items[items.length - 1] ?? null;
    default:
      return null;
  }
}

export function handleTabListKeyDown<T extends string>(
  event: KeyboardEvent<HTMLElement>,
  items: readonly T[],
  currentValue: T,
  onChange: (next: T) => void
): void {
  const nextValue = getNextTabValue(event.key, items, currentValue);
  if (nextValue === null) return;

  event.preventDefault();
  onChange(nextValue);

  const nextIndex = items.indexOf(nextValue);
  const tabButtons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  tabButtons[nextIndex]?.focus();
}
