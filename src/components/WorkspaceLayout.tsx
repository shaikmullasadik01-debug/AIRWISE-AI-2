import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  Bell,
  Bot,
  Calculator,
  CalendarClock,
  Home,
  LayoutDashboard,
  Leaf,
  Menu,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import type { CityLocation, PageId } from '../types/airwise.ts';
import { handleModalFocusTrapKeyDown } from '../lib/a11y.ts';
import { Logo } from './Logo.tsx';

interface WorkspaceLayoutProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  location: CityLocation;
  unreadAlertsCount: number;
  children?: ReactNode;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'dashboard', label: 'Smart AQI Dashboard', icon: LayoutDashboard },
  { id: 'assistant', label: 'AI Family Assistant', icon: Bot },
  { id: 'routine', label: 'Daily Routine Planner', icon: CalendarClock },
  { id: 'indoor', label: 'Indoor Air Optimizer', icon: ShieldCheck },
  { id: 'sustainability', label: 'Sustainability Hub', icon: Leaf },
  { id: 'calculator', label: 'Carbon Calculator', icon: Calculator },
  { id: 'insights', label: 'Pollution Insights', icon: TrendingUp },
  { id: 'community', label: 'Community Hub', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings & Privacy', icon: Settings },
];

interface SidebarNavContentProps {
  activePage: PageId;
  unreadAlertsCount: number;
  onNavigate: (page: PageId) => void;
}

function SidebarNavContent({
  activePage,
  unreadAlertsCount,
  onNavigate,
}: SidebarNavContentProps) {
  return (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Workspace Sections">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                active
                  ? 'bg-[#102A43] text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-[#102A43]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-[#20C997]' : 'text-slate-500'}`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'notifications' && unreadAlertsCount > 0 && (
                <span
                  className={`ml-2 rounded px-1.5 py-0.5 font-mono text-[11px] tabular-nums ${
                    active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
        >
          <Home className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span>Back to Overview</span>
        </button>
      </div>
    </>
  );
}

export function WorkspaceLayout({
  activePage,
  onNavigate,
  location,
  unreadAlertsCount,
  children,
}: WorkspaceLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeDrawerBtnRef = useRef<HTMLButtonElement | null>(null);
  const openDrawerBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerPanelRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);

  const currentItem = NAV_ITEMS.find((i) => i.id === activePage) ?? NAV_ITEMS[0];

  useEffect(() => {
    if (mobileMenuOpen) {
      wasOpenRef.current = true;
      closeDrawerBtnRef.current?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      openDrawerBtnRef.current?.focus();
    }
    return undefined;
  }, [mobileMenuOpen]);

  function handleNav(page: PageId) {
    onNavigate(page);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#102A43] lg:flex">
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#102A43] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
      >
        Skip to workspace content
      </a>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white"
        aria-label="Workspace Navigation"
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Logo onClick={() => handleNav('landing')} />
        </div>
        <SidebarNavContent
          activePage={activePage}
          unreadAlertsCount={unreadAlertsCount}
          onNavigate={handleNav}
        />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <dialog
          id="mobile-navigation-drawer"
          open
          onKeyDown={(e) => handleModalFocusTrapKeyDown(e, drawerPanelRef.current)}
          className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none bg-transparent p-0 lg:hidden"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation menu backdrop"
            className="fixed inset-0 bg-[#102A43]/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div ref={drawerPanelRef} className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <Logo onClick={() => handleNav('landing')} />
              <button
                ref={closeDrawerBtnRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNavContent
              activePage={activePage}
              unreadAlertsCount={unreadAlertsCount}
              onNavigate={handleNav}
            />
          </div>
        </dialog>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={openDrawerBtnRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-slate-500 sm:inline">Workspace</span>
              <span className="hidden text-slate-400 sm:inline" aria-hidden="true">/</span>
              <h1 className="truncate font-display text-base font-bold text-[#102A43] sm:text-lg">
                {currentItem?.label ?? 'Workspace'}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('dashboard')}
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-1 text-xs font-medium text-slate-600 hover:text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] sm:inline-flex"
            >
              <Activity className="h-3.5 w-3.5 text-[#0F766E]" aria-hidden="true" />
              <span>{location.name}, {location.countryCode}</span>
            </button>
            <button
              type="button"
              onClick={() => handleNav('assistant')}
              className="shrink-0 whitespace-nowrap rounded-lg bg-[#102A43] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1a3f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              Ask AI Assistant
            </button>
          </div>
        </header>

        <main id="main-workspace" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
