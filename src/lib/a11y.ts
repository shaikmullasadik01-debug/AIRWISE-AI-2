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
  const tabListRoot = event.currentTarget.closest?.('[role="tablist"]') ?? event.currentTarget;
  const tabButtons = tabListRoot.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  tabButtons[nextIndex]?.focus();
}

export function handleModalFocusTrapKeyDown(
  event: KeyboardEvent<HTMLElement>,
  container: HTMLElement | null
): void {
  if (event.key !== 'Tab' || !container) return;
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first?.focus();
  }
}
