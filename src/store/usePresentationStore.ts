import { create } from 'zustand';
import { SLIDES } from '../data/scenes';

interface PresentationStore {
  currentScene: number;
  previousScene: number | null;
  direction: 1 | -1;
  transitionNonce: number;
  replayNonce: number;
  isTransitioning: boolean;

  overviewOpen: boolean;
  presenterOverlayOpen: boolean;
  reducedMotion: boolean;
  isMobile: boolean;

  // Timer state (used exclusively in presenter notes/console)
  timerRunning: boolean;
  timerStartedAt: number | null;
  timerAccumulatedMs: number;

  // Actions
  goToScene: (index: number, fromSync?: boolean) => void;
  nextScene: () => void;
  prevScene: () => void;
  firstScene: () => void;
  lastScene: () => void;
  replayCurrentScene: () => void;

  setOverviewOpen: (open: boolean) => void;
  toggleOverview: () => void;
  setPresenterOverlayOpen: (open: boolean) => void;
  togglePresenterOverlay: () => void;
  setReducedMotion: (reduced: boolean) => void;
  setIsMobile: (mobile: boolean) => void;

  toggleTimer: () => void;
  resetTimer: () => void;
}

const CHANNEL_NAME = 'kant-keynote-sync-v2';
let syncChannel: BroadcastChannel | null = null;

function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return syncChannel;
}

function broadcastState(payload: Record<string, unknown>) {
  const ch = getSyncChannel();
  if (ch) {
    try {
      ch.postMessage(payload);
    } catch {
      // Ignore broadcast errors in restricted contexts
    }
  }
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;
let lastNavTimestamp = 0;

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  currentScene: 0,
  previousScene: null,
  direction: 1,
  transitionNonce: 0,
  replayNonce: 0,
  isTransitioning: false,

  overviewOpen: false,
  presenterOverlayOpen: false,
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,

  timerRunning: false,
  timerStartedAt: null,
  timerAccumulatedMs: 0,

  goToScene: (targetIndex, fromSync = false) => {
    const now = Date.now();
    // Guard against accidental double-triggers (<140ms) while keeping rapid navigation responsive
    if (!fromSync && now - lastNavTimestamp < 140) return;
    lastNavTimestamp = now;

    const clamped = Math.max(0, Math.min(SLIDES.length - 1, targetIndex));
    const state = get();
    if (clamped === state.currentScene) {
      if (state.overviewOpen) set({ overviewOpen: false });
      return;
    }

    if (transitionTimer) clearTimeout(transitionTimer);

    const dir: 1 | -1 = clamped > state.currentScene ? 1 : -1;
    const shouldAutoStartTimer =
      !state.timerRunning && state.timerAccumulatedMs === 0 && clamped > 0;

    set({
      previousScene: state.currentScene,
      currentScene: clamped,
      direction: dir,
      transitionNonce: state.transitionNonce + 1,
      isTransitioning: true,
      overviewOpen: false,
      timerRunning: shouldAutoStartTimer ? true : state.timerRunning,
      timerStartedAt: shouldAutoStartTimer ? Date.now() : state.timerStartedAt,
    });

    if (!fromSync) {
      broadcastState({ type: 'SCENE_CHANGE', sceneIndex: clamped });
    }

    transitionTimer = setTimeout(
      () => {
        set({ isTransitioning: false });
      },
      state.reducedMotion ? 120 : 750
    );
  },

  nextScene: () => {
    const { currentScene, goToScene } = get();
    if (currentScene < SLIDES.length - 1) {
      goToScene(currentScene + 1);
    }
  },

  prevScene: () => {
    const { currentScene, goToScene } = get();
    if (currentScene > 0) {
      goToScene(currentScene - 1);
    }
  },

  firstScene: () => get().goToScene(0),
  lastScene: () => get().goToScene(SLIDES.length - 1),

  replayCurrentScene: () => {
    set((s) => ({ replayNonce: s.replayNonce + 1 }));
    broadcastState({ type: 'REPLAY_SCENE' });
  },

  setOverviewOpen: (open) => set({ overviewOpen: open }),
  toggleOverview: () => set((s) => ({ overviewOpen: !s.overviewOpen })),

  setPresenterOverlayOpen: (open) => set({ presenterOverlayOpen: open }),
  togglePresenterOverlay: () => set((s) => ({ presenterOverlayOpen: !s.presenterOverlayOpen })),

  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),

  toggleTimer: () => {
    const { timerRunning, timerStartedAt, timerAccumulatedMs } = get();
    if (timerRunning && timerStartedAt !== null) {
      set({
        timerRunning: false,
        timerStartedAt: null,
        timerAccumulatedMs: timerAccumulatedMs + (Date.now() - timerStartedAt),
      });
    } else {
      set({
        timerRunning: true,
        timerStartedAt: Date.now(),
      });
    }
  },

  resetTimer: () =>
    set({
      timerRunning: false,
      timerStartedAt: null,
      timerAccumulatedMs: 0,
    }),
}));

export function initPresentationSync() {
  const ch = getSyncChannel();
  if (!ch) return () => {};

  const handler = (event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    const store = usePresentationStore.getState();

    if (data.type === 'SCENE_CHANGE' && typeof data.sceneIndex === 'number') {
      store.goToScene(data.sceneIndex, true);
    } else if (data.type === 'REPLAY_SCENE') {
      usePresentationStore.setState((s) => ({ replayNonce: s.replayNonce + 1 }));
    } else if (data.type === 'REQUEST_SYNC') {
      broadcastState({
        type: 'FULL_SYNC',
        sceneIndex: store.currentScene,
      });
    } else if (data.type === 'FULL_SYNC' && typeof data.sceneIndex === 'number') {
      store.goToScene(data.sceneIndex, true);
    }
  };

  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
}

export function requestPresenterSync() {
  broadcastState({ type: 'REQUEST_SYNC' });
}
