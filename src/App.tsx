import { useCallback, useEffect, useRef } from 'react';
import {
  initPresentationSync,
  usePresentationStore,
} from './store/usePresentationStore';
import { SceneStage } from './three/SceneStage';
import { SceneEditorialOverlay } from './components/SceneEditorialOverlay';
import { TransitionChoreography } from './components/TransitionChoreography';
import { PresentationHUD } from './components/PresentationHUD';
import { OverviewModal } from './components/OverviewModal';
import {
  PresenterOverlay,
  PresenterStandaloneWindow,
} from './components/PresenterView';

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

export function App() {
  const isPresenterWindow =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('presenter') === '1';

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const openPresenterWindow = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('presenter', '1');
    const win = window.open(
      url.toString(),
      'kant-presenter-console',
      'width=1120,height=760,menubar=no,toolbar=no,location=no'
    );
    if (!win) {
      usePresentationStore.getState().setPresenterOverlayOpen(true);
    }
  }, []);

  // Sync + responsive viewport & reduced-motion listeners
  useEffect(() => {
    const cleanupSync = initPresentationSync();

    const onResize = () => {
      usePresentationStore.getState().setIsMobile(window.innerWidth < 768);
    };
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMotionChange = (e: MediaQueryListEvent) => {
      usePresentationStore.getState().setReducedMotion(e.matches);
    };

    window.addEventListener('resize', onResize);
    mq?.addEventListener?.('change', onMotionChange);

    return () => {
      cleanupSync();
      window.removeEventListener('resize', onResize);
      mq?.removeEventListener?.('change', onMotionChange);
    };
  }, []);

  // Simple, rock-solid Keynote keyboard controller
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableElement(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const store = usePresentationStore.getState();

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          store.nextScene();
          break;
        case ' ':
          e.preventDefault();
          store.nextScene();
          break;
        case 'ArrowLeft':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          store.prevScene();
          break;
        case 'Home':
          e.preventDefault();
          store.firstScene();
          break;
        case 'End':
          e.preventDefault();
          store.lastScene();
          break;
        case 'Escape':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          } else if (store.overviewOpen) {
            store.setOverviewOpen(false);
          } else if (store.presenterOverlayOpen) {
            store.setPresenterOverlayOpen(false);
          }
          break;
        case 'g':
        case 'G':
        case 'п':
        case 'П':
          e.preventDefault();
          store.toggleOverview();
          break;
        case 'f':
        case 'F':
        case 'а':
        case 'А':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'r':
        case 'R':
        case 'к':
        case 'К':
          e.preventDefault();
          store.replayCurrentScene();
          break;
        case 'p':
        case 'P':
        case 'з':
        case 'З':
          e.preventDefault();
          store.togglePresenterOverlay();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleFullscreen]);

  // One click anywhere on the presentation background -> Next slide
  const onStageClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-hud-control="true"], button, a')) return;
    const store = usePresentationStore.getState();
    if (store.overviewOpen) return;
    store.nextScene();
  };

  // Touch swipe navigation on mobile & tablets
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const store = usePresentationStore.getState();
      if (store.overviewOpen) return;
      if (dx < 0) store.nextScene();
      else store.prevScene();
    }
  };

  if (isPresenterWindow) {
    return <PresenterStandaloneWindow />;
  }

  return (
    <main
      className="stage-root stage-clickable"
      onClick={onStageClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Презентация: Иммануил Кант — Границы разума и нравственный закон"
    >
      <SceneStage />
      <div className="stage-vignette" aria-hidden="true" />
      <div className="stage-frame" aria-hidden="true" />

      <SceneEditorialOverlay />
      <TransitionChoreography />

      <PresentationHUD
        onToggleFullscreen={toggleFullscreen}
        onOpenPresenterWindow={openPresenterWindow}
      />

      <PresenterOverlay onOpenStandaloneWindow={openPresenterWindow} />
      <OverviewModal />
    </main>
  );
}

export default App;
