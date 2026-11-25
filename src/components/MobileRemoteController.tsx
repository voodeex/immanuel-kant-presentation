import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  TimerReset,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { SLIDES, TOTAL_DURATION_SECONDS } from '../data/scenes';
import {
  ConnectionStatus,
  RemoteMessage,
  RemoteSyncClient,
} from '../lib/remoteSync';

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface MobileRemoteControllerProps {
  roomCode: string;
}

/**
 * Lightweight, zero-WebGL Mobile Remote Presenter Controller (`?remote=XXXX-XXXX`).
 * Designed for comfortable one-handed live classroom presentation:
 * - Large thumb-friendly Next/Prev buttons + swipe gestures
 * - Live two-way slide sync with the main projector screen over HTTPS/WSS
 * - Full speaker notes from the report, key idea, and presentation timer
 * - Screen Wake Lock to keep the phone display awake during the 5-minute speech
 */
export function MobileRemoteController({ roomCode }: MobileRemoteControllerProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [hostLinked, setHostLinked] = useState(false);

  // Local speaker timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerAccumulatedMs, setTimerAccumulatedMs] = useState(0);
  const [, setTick] = useState(0);

  const clientRef = useRef<RemoteSyncClient | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    document.title = `Пульт (${roomCode}) — Иммануил Кант`;
  }, [roomCode]);

  // Keep phone screen awake while delivering the report
  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;
    const requestLock = async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
        };
        if (nav.wakeLock) {
          wakeLock = await nav.wakeLock.request('screen');
        }
      } catch {
        // Wake lock unsupported or denied
      }
    };
    requestLock();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        requestLock();
        clientRef.current?.send({ type: 'HELLO' });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  // Connect WebSocket remote channel
  useEffect(() => {
    const client = new RemoteSyncClient(
      roomCode,
      (msg: RemoteMessage) => {
        if (msg.type === 'STATE') {
          const clamped = Math.max(0, Math.min(SLIDES.length - 1, msg.sceneIndex));
          setSceneIndex(clamped);
          setHostLinked(true);
        } else if (msg.type === 'HELLO' || msg.type === 'PING') {
          setHostLinked(true);
        }
      },
      (nextStatus) => {
        setStatus(nextStatus);
        if (nextStatus === 'connected') {
          client.send({ type: 'HELLO' });
        }
      }
    );

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [roomCode]);

  // Timer tick
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [timerRunning]);

  const elapsedSeconds =
    (timerAccumulatedMs + (timerRunning && timerStartedAt ? Date.now() - timerStartedAt : 0)) /
    1000;

  const autoStartTimerIfNeeded = useCallback((nextIdx: number) => {
    if (nextIdx > 0 && !timerRunning && timerAccumulatedMs === 0) {
      setTimerRunning(true);
      setTimerStartedAt(Date.now());
    }
  }, [timerRunning, timerAccumulatedMs]);

  const vibrate = () => {
    try {
      navigator.vibrate?.(16);
    } catch {
      // ignore
    }
  };

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, idx));
      vibrate();
      setSceneIndex(clamped);
      autoStartTimerIfNeeded(clamped);
      clientRef.current?.send({ type: 'GOTO', sceneIndex: clamped });
    },
    [autoStartTimerIfNeeded]
  );

  const handleNext = useCallback(() => {
    if (sceneIndex < SLIDES.length - 1) {
      goTo(sceneIndex + 1);
    }
  }, [sceneIndex, goTo]);

  const handlePrev = useCallback(() => {
    if (sceneIndex > 0) {
      goTo(sceneIndex - 1);
    }
  }, [sceneIndex, goTo]);

  const handleReplay = useCallback(() => {
    vibrate();
    clientRef.current?.send({ type: 'REPLAY' });
  }, []);

  const toggleTimer = () => {
    if (timerRunning && timerStartedAt !== null) {
      setTimerRunning(false);
      setTimerStartedAt(null);
      setTimerAccumulatedMs((prev) => prev + (Date.now() - timerStartedAt));
    } else {
      setTimerRunning(true);
      setTimerStartedAt(Date.now());
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerStartedAt(null);
    setTimerAccumulatedMs(0);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  const slide = SLIDES[sceneIndex];
  const nextSlide = SLIDES[sceneIndex + 1];

  return (
    <div className="remote-shell">
      {/* Top Status & Timer Bar */}
      <header className="remote-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="remote-slide-counter">
              {slide.number} / {String(SLIDES.length).padStart(2, '0')}
            </span>
            <span
              className={`remote-pill ${
                hostLinked
                  ? 'remote-pill--ok'
                  : status === 'connected'
                  ? 'remote-pill--ready'
                  : 'remote-pill--warn'
              }`}
            >
              {status === 'connected' ? <Wifi size={11} /> : <WifiOff size={11} />}
              {hostLinked
                ? 'Подключён'
                : status === 'connected'
                ? 'Канал открыт'
                : 'Переподключение…'}
            </span>
          </div>
          <div className="remote-room-tag">Код: {roomCode}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              color: elapsedSeconds > TOTAL_DURATION_SECONDS ? '#d9848a' : 'var(--accent-gold)',
              marginRight: '4px',
            }}
          >
            {formatClock(elapsedSeconds)}
          </span>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ height: '32px', padding: '0 9px' }}
            onClick={toggleTimer}
            aria-label={timerRunning ? 'Пауза таймера' : 'Запустить таймер'}
          >
            {timerRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ height: '32px', padding: '0 9px' }}
            onClick={resetTimer}
            aria-label="Сбросить таймер"
          >
            <TimerReset size={14} />
          </button>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ height: '32px', padding: '0 9px' }}
            onClick={handleReplay}
            aria-label="Повторить анимацию слайда"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Scrollable Speaker Notes Body (also supports horizontal swipe) */}
      <main
        className="remote-notes"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              fontWeight: 500,
              lineHeight: 1.18,
              color: 'var(--ink-ivory)',
            }}
          >
            {slide.title}
          </h1>
          <span className="museum-label" style={{ flexShrink: 0 }}>
            {slide.approxTimeLabel}
          </span>
        </div>

        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(183, 155, 104, 0.1)',
            borderLeft: '2px solid var(--accent-gold)',
            fontSize: '0.86rem',
            lineHeight: 1.45,
            color: 'var(--accent-gold)',
          }}
        >
          {slide.keyIdea}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {slide.speakerNotes.map((para, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '1.08rem',
                lineHeight: 1.62,
                color: 'var(--ink-ivory)',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {slide.deliveryCue && (
          <div
            className="museum-footnote"
            style={{
              paddingTop: '10px',
              borderTop: '1px solid rgba(119, 115, 108, 0.25)',
              fontSize: '0.82rem',
            }}
          >
            Ремарка: {slide.deliveryCue}
          </div>
        )}

        {nextSlide && (
          <div
            style={{
              marginTop: '6px',
              padding: '10px 12px',
              background: '#11100d',
              border: '1px solid rgba(183, 155, 104, 0.18)',
              fontSize: '0.82rem',
              color: 'rgba(234, 228, 216, 0.72)',
            }}
          >
            <span style={{ color: 'var(--accent-gold)', marginRight: '6px' }}>
              Далее {nextSlide.number}:
            </span>
            {nextSlide.title} ({nextSlide.approxTimeLabel})
          </div>
        )}

        {/* Quick Jump Slide Strip */}
        <div className="remote-jump-strip" aria-label="Быстрый выбор слайда">
          {SLIDES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`remote-jump-btn ${s.id === sceneIndex ? 'remote-jump-btn--active' : ''}`}
              onClick={() => goTo(s.id)}
            >
              {s.number}
            </button>
          ))}
        </div>
      </main>

      {/* Large Thumb-Friendly Bottom Clicker Controls */}
      <footer className="remote-controls">
        <button
          type="button"
          className="remote-btn remote-btn--prev"
          onClick={handlePrev}
          disabled={sceneIndex === 0}
          aria-label="Предыдущий слайд"
        >
          <ChevronLeft size={24} />
          <span>Назад</span>
        </button>

        <button
          type="button"
          className="remote-btn remote-btn--next"
          onClick={handleNext}
          disabled={sceneIndex === SLIDES.length - 1}
          aria-label="Следующий слайд"
        >
          <span>{sceneIndex === SLIDES.length - 1 ? 'Финал' : 'Следующий слайд'}</span>
          <ChevronRight size={26} />
        </button>
      </footer>
    </div>
  );
}
