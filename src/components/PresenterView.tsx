import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  TimerReset,
  X,
} from 'lucide-react';
import { REPORT_CREDIT, SLIDES, TOTAL_DURATION_SECONDS } from '../data/scenes';
import {
  requestPresenterSync,
  usePresentationStore,
} from '../store/usePresentationStore';

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useElapsedSeconds(): number {
  const timerRunning = usePresentationStore((s) => s.timerRunning);
  const timerStartedAt = usePresentationStore((s) => s.timerStartedAt);
  const timerAccumulatedMs = usePresentationStore((s) => s.timerAccumulatedMs);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [timerRunning]);

  const liveMs =
    timerAccumulatedMs + (timerRunning && timerStartedAt ? Date.now() - timerStartedAt : 0);
  return liveMs / 1000;
}

export function PresenterOverlay({
  onOpenStandaloneWindow,
}: {
  onOpenStandaloneWindow: () => void;
}) {
  const open = usePresentationStore((s) => s.presenterOverlayOpen);
  const setOpen = usePresentationStore((s) => s.setPresenterOverlayOpen);
  const currentScene = usePresentationStore((s) => s.currentScene);
  const timerRunning = usePresentationStore((s) => s.timerRunning);
  const toggleTimer = usePresentationStore((s) => s.toggleTimer);
  const resetTimer = usePresentationStore((s) => s.resetTimer);
  const elapsed = useElapsedSeconds();

  if (!open) return null;

  const slide = SLIDES[currentScene];
  const next = SLIDES[currentScene + 1];

  return (
    <aside
      className="presenter-overlay"
      aria-label="Заметки докладчика"
      data-hud-control="true"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(183, 155, 104, 0.2)',
          background: '#11100d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="museum-label">Заметки докладчика</span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.05rem',
              color: elapsed > TOTAL_DURATION_SECONDS ? '#c77c81' : 'var(--ink-ivory)',
            }}
          >
            {formatClock(elapsed)} / {formatClock(TOTAL_DURATION_SECONDS)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ height: '28px', padding: '0 8px' }}
            onClick={toggleTimer}
            title={timerRunning ? 'Пауза таймера' : 'Запустить таймер'}
          >
            {timerRunning ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ height: '28px', padding: '0 8px' }}
            onClick={resetTimer}
            title="Сбросить таймер"
          >
            <TimerReset size={13} />
          </button>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ height: '28px', padding: '0 8px' }}
            onClick={onOpenStandaloneWindow}
            title="Открыть в отдельном окне"
          >
            <ExternalLink size={13} />
          </button>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ height: '28px', padding: '0 8px' }}
            onClick={() => setOpen(false)}
            aria-label="Закрыть заметки"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '16px 18px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          userSelect: 'text',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500 }}>
            {slide.number}. {slide.title}
          </strong>
          <span className="museum-label">{slide.approxTimeLabel}</span>
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--accent-gold)',
            padding: '8px 10px',
            background: 'rgba(183, 155, 104, 0.08)',
            borderLeft: '2px solid var(--accent-gold)',
          }}
        >
          Ключевая мысль: {slide.keyIdea}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {slide.speakerNotes.map((para, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '0.94rem',
                lineHeight: 1.62,
                color: 'var(--ink-ivory)',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {slide.deliveryCue && (
          <div className="museum-footnote" style={{ borderTop: '1px solid rgba(119,115,108,0.2)', paddingTop: '8px' }}>
            Ремарка: {slide.deliveryCue}
          </div>
        )}

        {next && (
          <div
            style={{
              marginTop: '4px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(183, 155, 104, 0.16)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--stone-gray)',
            }}
          >
            <span>Далее: {next.number} · {next.title}</span>
            <span>{next.approxTimeLabel}</span>
          </div>
        )}
      </div>
    </aside>
  );
}

export function PresenterStandaloneWindow() {
  const currentScene = usePresentationStore((s) => s.currentScene);
  const goToScene = usePresentationStore((s) => s.goToScene);
  const prevScene = usePresentationStore((s) => s.prevScene);
  const nextScene = usePresentationStore((s) => s.nextScene);
  const replayCurrentScene = usePresentationStore((s) => s.replayCurrentScene);
  const timerRunning = usePresentationStore((s) => s.timerRunning);
  const toggleTimer = usePresentationStore((s) => s.toggleTimer);
  const resetTimer = usePresentationStore((s) => s.resetTimer);
  const elapsed = useElapsedSeconds();

  useEffect(() => {
    document.title = 'Пульт докладчика — Иммануил Кант';
    requestPresenterSync();
  }, []);

  const slide = SLIDES[currentScene];
  const next = SLIDES[currentScene + 1];

  return (
    <div className="presenter-standalone">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(183, 155, 104, 0.24)',
          paddingBottom: '16px',
        }}
      >
        <div>
          <div className="museum-label">Режим докладчика · Синхронизация активна</div>
          <h1 className="display-monumental" style={{ fontSize: '1.85rem', marginTop: '4px' }}>
            {slide.number} / {SLIDES.length} — {slide.title}
          </h1>
          <div className="museum-footnote" style={{ marginTop: '4px' }}>
            {REPORT_CREDIT}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="museum-footnote">Прошло времени</div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                lineHeight: 1,
                color: elapsed > TOTAL_DURATION_SECONDS ? '#c77c81' : 'var(--accent-gold)',
              }}
            >
              {formatClock(elapsed)}
            </div>
            <div className="museum-footnote">
              Ориентир: {formatClock(TOTAL_DURATION_SECONDS)} · Слайд: {slide.approxTimeLabel}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button type="button" className="museum-btn" onClick={toggleTimer}>
              {timerRunning ? <Pause size={14} /> : <Play size={14} />}
              {timerRunning ? 'Пауза' : 'Старт'}
            </button>
            <button type="button" className="hud-icon-btn" onClick={resetTimer}>
              <TimerReset size={14} /> Сброс
            </button>
          </div>
        </div>
      </header>

      <main className="presenter-grid">
        <section className="presenter-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="museum-label">Текст доклада ({slide.sectionLabel})</span>
            <span className="museum-label" style={{ color: 'var(--ink-ivory)' }}>
              {slide.approxTimeLabel}
            </span>
          </div>

          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(183, 155, 104, 0.09)',
              borderLeft: '2px solid var(--accent-gold)',
              fontSize: '0.96rem',
              color: 'var(--accent-gold)',
            }}
          >
            <strong>Ключевая мысль:</strong> {slide.keyIdea}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {slide.speakerNotes.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: '1.22rem',
                  lineHeight: 1.68,
                  color: 'var(--ink-ivory)',
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {slide.deliveryCue && (
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '14px',
                borderTop: '1px solid rgba(119, 115, 108, 0.25)',
                color: 'var(--stone-gray)',
                fontSize: '0.9rem',
              }}
            >
              Подсказка: {slide.deliveryCue}
            </div>
          )}
        </section>

        <section className="presenter-panel">
          <div>
            <div className="museum-label" style={{ marginBottom: '10px' }}>
              Следующий слайд
            </div>
            {next ? (
              <div
                style={{
                  padding: '14px 16px',
                  background: '#11100e',
                  border: '1px solid rgba(183, 155, 104, 0.22)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '6px' }}>
                  {next.number}. {next.title}
                </div>
                <div className="museum-footnote" style={{ lineHeight: 1.5 }}>
                  {next.keyIdea}
                </div>
              </div>
            ) : (
              <div className="museum-footnote">Финальный слайд доклада.</div>
            )}
          </div>

          <div style={{ marginTop: '12px' }}>
            <div className="museum-label" style={{ marginBottom: '10px' }}>
              Быстрый переход
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {SLIDES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToScene(s.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px 11px',
                    background: s.id === currentScene ? 'rgba(183, 155, 104, 0.16)' : '#12110f',
                    border: `1px solid ${
                      s.id === currentScene ? 'var(--accent-gold)' : 'rgba(119, 115, 108, 0.2)'
                    }`,
                    color: s.id === currentScene ? 'var(--ink-ivory)' : 'rgba(234, 228, 216, 0.72)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>
                    <strong style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>
                      {s.number}
                    </strong>
                    {s.chapter}
                  </span>
                  <span className="museum-footnote">{s.approxTimeLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid rgba(183, 155, 104, 0.2)',
        }}
      >
        <button type="button" className="museum-btn" onClick={replayCurrentScene}>
          <RotateCcw size={14} /> Повторить слайд
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="museum-btn"
            onClick={prevScene}
            disabled={currentScene === 0}
          >
            <ChevronLeft size={15} /> Предыдущий
          </button>
          <button
            type="button"
            className="museum-btn museum-btn--active"
            onClick={nextScene}
            disabled={currentScene === SLIDES.length - 1}
          >
            Следующий <ChevronRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
}
