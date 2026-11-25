import { X } from 'lucide-react';
import { REPORT_CREDIT, SLIDES } from '../data/scenes';
import { usePresentationStore } from '../store/usePresentationStore';

export function OverviewModal() {
  const overviewOpen = usePresentationStore((s) => s.overviewOpen);
  const currentScene = usePresentationStore((s) => s.currentScene);
  const goToScene = usePresentationStore((s) => s.goToScene);
  const setOverviewOpen = usePresentationStore((s) => s.setOverviewOpen);

  if (!overviewOpen) return null;

  return (
    <div
      className="overview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Обзор всех слайдов презентации"
      data-hud-control="true"
    >
      <div className="overview-header">
        <div>
          <div className="museum-label" style={{ marginBottom: '8px' }}>
            Структура доклада · {SLIDES.length} слайдов
          </div>
          <h2 className="display-monumental display-md">ИММАНУИЛ КАНТ</h2>
          <p className="museum-footnote" style={{ marginTop: '6px' }}>
            {REPORT_CREDIT}
          </p>
        </div>

        <button
          type="button"
          className="museum-btn"
          onClick={() => setOverviewOpen(false)}
          aria-label="Закрыть обзор"
        >
          <X size={15} />
          Закрыть (Esc)
        </button>
      </div>

      <div className="overview-grid">
        {SLIDES.map((slide) => {
          const active = slide.id === currentScene;
          return (
            <button
              key={slide.id}
              type="button"
              className={`overview-card ${active ? 'overview-card--active' : ''}`}
              onClick={() => goToScene(slide.id)}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '10px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.25rem',
                      color: active ? 'var(--accent-gold)' : 'var(--stone-gray)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {slide.number}
                  </span>
                  <span className="museum-footnote">{slide.approxTimeLabel}</span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.12rem',
                    lineHeight: 1.24,
                    color: 'var(--ink-ivory)',
                    marginBottom: '8px',
                  }}
                >
                  {slide.title}
                </div>
              </div>

              <div className="museum-footnote" style={{ lineHeight: 1.42 }}>
                {slide.keyIdea}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="museum-footnote"
        style={{
          marginTop: '20px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(119, 115, 108, 0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 24px',
        }}
      >
        <span>Пробел / → / Клик — следующий слайд</span>
        <span>← — предыдущий слайд</span>
        <span>F — полный экран</span>
        <span>Esc — выход / закрыть</span>
        <span>P — заметки докладчика</span>
      </div>
    </div>
  );
}
