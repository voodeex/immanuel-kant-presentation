import { useCallback, useEffect, useRef, useState } from 'react';
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
import { RemotePairingModal } from './components/RemotePairingModal';
import { MobileRemoteController } from './components/MobileRemoteController';
import {
  ConnectionStatus,
  getOrCreateHostRoomCode,
  regenerateHostRoomCode,
  RemoteMessage,
  RemoteSyncClient,
} from './lib/remoteSync';

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
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPresenterWindow = searchParams?.get('presenter') === '1';
  const remoteRoomParam = searchParams?.get('remote')?.trim().toUpperCase() || null;

  const [remoteModalOpen, setRemoteModalOpen] = useState(false);
  const [hostRoomCode, setHostRoomCode] = useState<string>(() => getOrCreateHostRoomCode());
  const [remoteStatus, setRemoteStatus] = useState<ConnectionStatus>('idle');
  const [remotePeerConnected, setRemotePeerConnected] = useState(false);
  const [remoteEnabled, setRemoteEnabled] = useState(false);

  const remoteClientRef = useRef<RemoteSyncClient | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentScene = usePresentationStore((s) => s.currentScene);

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
    url.search = '';
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

  const openRemoteModal = useCallback(() => {
    setRemoteEnabled(true);
    setRemoteModalOpen((prev) => !prev);
  }, []);

  const handleRegenerateCode = useCallback(() => {
    setRemotePeerConnected(false);
    setHostRoomCode(regenerateHostRoomCode());
  }, []);

  // Host-side WebSocket remote listener (starts when user opens Remote Pairing modal)
  useEffect(() => {
    if (remoteRoomParam || isPresenterWindow || !remoteEnabled) return;

    const client = new RemoteSyncClient(
      hostRoomCode,
      (msg: RemoteMessage) => {
        const store = usePresentationStore.getState();

        if (msg.type === 'HELLO') {
          setRemotePeerConnected(true);
          client.send({ type: 'STATE', sceneIndex: store.currentScene });
          // Automatically dismiss QR overlay shortly after phone links so projector stays clean
          setTimeout(() => {
            setRemoteModalOpen(false);
          }, 850);
        } else if (msg.type === 'GOTO') {
          setRemotePeerConnected(true);
          store.goToScene(msg.sceneIndex, true);
        } else if (msg.type === 'NEXT') {
          setRemotePeerConnected(true);
          store.nextScene();
        } else if (msg.type === 'PREV') {
          setRemotePeerConnected(true);
          store.prevScene();
        } else if (msg.type === 'REPLAY') {
          setRemotePeerConnected(true);
          store.replayCurrentScene();
        }
      },
      (status) => {
        setRemoteStatus(status);
      }
    );

    remoteClientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      remoteClientRef.current = null;
    };
  }, [hostRoomCode, remoteEnabled, remoteRoomParam, isPresenterWindow]);

  // Keep connected phone synced if presenter also presses Space/Arrows on the laptop
  useEffect(() => {
    if (!remotePeerConnected || !remoteClientRef.current) return;
    remoteClientRef.current.send({ type: 'STATE', sceneIndex: currentScene });
  }, [currentScene, remotePeerConnected]);

  // Local BroadcastChannel sync + responsive viewport & reduced-motion listeners
  useEffect(() => {
    if (remoteRoomParam) return;
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
  }, [remoteRoomParam]);

  // Simple, rock-solid Keynote keyboard controller
  useEffect(() => {
    if (remoteRoomParam) return;

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
          } else if (remoteModalOpen) {
            setRemoteModalOpen(false);
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
        case 'm':
        case 'M':
        case 'ь':
        case 'Ь':
          e.preventDefault();
          openRemoteModal();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleFullscreen, openRemoteModal, remoteModalOpen, remoteRoomParam]);

  // One click anywhere on the presentation background -> Next slide
  const onStageClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-hud-control="true"], button, a')) return;
    const store = usePresentationStore.getState();
    if (store.overviewOpen || remoteModalOpen) return;
    store.nextScene();
  };

  // Touch swipe navigation on tablets & mobile
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
      if (store.overviewOpen || remoteModalOpen) return;
      if (dx < 0) store.nextScene();
      else store.prevScene();
    }
  };

  // Dedicated lightweight Mobile Remote UI (no WebGL loaded!)
  if (remoteRoomParam) {
    return <MobileRemoteController roomCode={remoteRoomParam} />;
  }

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
        onOpenRemoteModal={openRemoteModal}
        remoteConnected={remotePeerConnected}
      />

      <RemotePairingModal
        open={remoteModalOpen}
        roomCode={hostRoomCode}
        connectionStatus={remoteStatus}
        peerConnected={remotePeerConnected}
        onClose={() => setRemoteModalOpen(false)}
        onRegenerateCode={handleRegenerateCode}
      />

      <PresenterOverlay onOpenStandaloneWindow={openPresenterWindow} />
      <OverviewModal />
    </main>
  );
}

export default App;
