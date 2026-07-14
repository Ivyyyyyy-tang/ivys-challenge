import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

type NavigationItem = {
  id: string;
  to: string;
  label: string;
};

const SIDEBAR_WIDTH_KEY = 'ivys-challenge.sidebar-width';
const SIDEBAR_ORDER_KEY = 'ivys-challenge.sidebar-order';
const DEFAULT_SIDEBAR_WIDTH = 240;
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 400;
const COMFORTABLE_SIDEBAR_WIDTH = 220;

const dashboardNavigation: NavigationItem[] = [
  { id: 'vocabulary', to: '/vocabulary-library', label: 'Vocabulary' },
  { id: 'vocabulary-garden', to: '/vocabulary-garden', label: 'Vocabulary Garden' },
  { id: 'ai-reading', to: '/ai-reading', label: 'AI Reading' },
  { id: 'my-vocabulary-bank', to: '/personal-vocabulary-bank', label: 'My Vocabulary Bank' },
];

export function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isFocusMode = location.pathname.includes('/word-card') || location.pathname.includes('/word-list');
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [orderedIds, setOrderedIds] = useState<string[]>(() => dashboardNavigation.map((item) => item.id));
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const savedWidth = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (savedWidth) {
      const parsedWidth = Number(savedWidth);
      if (!Number.isNaN(parsedWidth)) {
        setSidebarWidth(clamp(parsedWidth, COMFORTABLE_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH));
      }
    }

    const savedOrder = window.localStorage.getItem(SIDEBAR_ORDER_KEY);
    if (savedOrder) {
      const parsedOrder = safeParseOrder(savedOrder);
      if (parsedOrder.length > 0) {
        setOrderedIds(parsedOrder);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_ORDER_KEY, JSON.stringify(orderedIds));
  }, [orderedIds]);

  const orderedNavigation = useMemo(() => {
    const navigationMap = new Map(dashboardNavigation.map((item) => [item.id, item]));
    const savedItems = orderedIds.map((id) => navigationMap.get(id)).filter(Boolean) as NavigationItem[];
    const missingItems = dashboardNavigation.filter((item) => !orderedIds.includes(item.id));
    return [...savedItems, ...missingItems];
  }, [orderedIds]);

  const handleResizeStart = () => {
    const onMouseMove = (event: MouseEvent) => {
      const nextWidth = clamp(event.clientX - 40, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH);
      setSidebarWidth(nextWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const moveNavigationItem = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    setOrderedIds((currentIds) => {
      const nextIds = [...currentIds];
      const fromIndex = nextIds.indexOf(fromId);
      const toIndex = nextIds.indexOf(toId);

      if (fromIndex === -1 || toIndex === -1) {
        return currentIds;
      }

      nextIds.splice(fromIndex, 1);
      nextIds.splice(toIndex, 0, fromId);
      return nextIds;
    });
  };

  return (
    <div className="min-h-screen bg-sand text-ink">
      <div className="flex min-h-screen items-center justify-center p-4 md:p-6 lg:p-8">
        {isLandingPage || isFocusMode ? (
          <main
            className="flex w-full overflow-hidden border border-line/80 bg-panel shadow-card backdrop-blur-sm"
            style={frameStyle}
          >
            <Outlet />
          </main>
        ) : (
          <div
            className="system-shell flex w-full overflow-hidden border border-line/80 bg-panel shadow-card backdrop-blur-sm"
            style={frameStyle}
          >
            <aside
              className="relative flex shrink-0 flex-col justify-between overflow-hidden border-r border-line/80 bg-white/48 px-7 py-8"
              style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
            >
              <div>
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-taupe/90">Private English Learning Space</p>
                  <h1 className="font-display text-[2rem] leading-[1.35] tracking-tight">Ivy&apos;s Challenge</h1>
                </div>

                <nav className="mt-12 space-y-3">
                  {orderedNavigation.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      draggable
                      onDragStart={() => setDraggedId(item.id)}
                      onDragEnd={() => setDraggedId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedId) {
                          moveNavigationItem(draggedId, item.id);
                          setDraggedId(null);
                        }
                      }}
                      className={({ isActive }) =>
                        [
                          'group block border px-4 py-4 transition-colors',
                          isActive
                            ? 'border-ink bg-ink text-sand'
                            : 'border-line bg-white/65 text-ink hover:border-taupe hover:bg-white/80',
                          draggedId === item.id ? 'opacity-55' : '',
                        ].join(' ')
                      }
                    >
                      <p className="text-[11px] uppercase tracking-[0.3em] text-taupe">
                        Menu
                      </p>
                      <p className="mt-2 text-balance font-display text-xl leading-snug">{item.label}</p>
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="space-y-4 border-t border-line/80 pt-6">
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">Sidebar</p>
                  <p className="text-sm leading-7 text-taupe">
                    Drag menu items to reorder. Resize the panel edge to fit your workspace.
                  </p>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-taupe/80 transition-colors hover:text-ink"
                >
                  <span aria-hidden="true">↩</span>
                  <span>Back to Home</span>
                </Link>
              </div>

              <button
                type="button"
                aria-label="Resize sidebar"
                onMouseDown={handleResizeStart}
                className="absolute right-0 top-0 h-full w-4 translate-x-1/2 cursor-col-resize bg-transparent"
              >
                <span className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-line transition-colors hover:bg-taupe" />
              </button>
            </aside>

            <main className="min-w-0 flex-1 overflow-auto px-8 py-8 lg:px-12 lg:py-10">
              <Outlet />
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function safeParseOrder(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const knownIds = new Set(dashboardNavigation.map((item) => item.id));
    return parsed.filter((item): item is string => typeof item === 'string' && knownIds.has(item));
  } catch {
    return [];
  }
}

const frameStyle = {
  aspectRatio: '18 / 12',
  width: 'min(96vw, calc((100vh - 4rem) * 18 / 12))',
  maxWidth: '1600px',
  maxHeight: 'calc(100vh - 4rem)',
};
