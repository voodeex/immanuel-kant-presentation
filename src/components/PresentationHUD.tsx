import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { SLIDES } from '../data/scenes';
import { usePresentationStore } from '../store/usePresentationStore';

interface PresentationHUDProps {
  onToggleFullscreen: () => void;
  onOpenPresenterWindow: () => void;
}

/**
 * Whisper-quiet Keynote HUD:
 * Minimal slide index at top-left, subtle progress hairline & ghost arrows at bottom.
 * Discreet controls stay unobtrusive so the audience sees pure cinema.
 */
export function PresentationHUD({
  onToggleFullscreen,
  onOpenPresenterWindow,
}: PresentationHUDProps) {
  const currentScene = usePresentationStore((s) => s.currentScene);
  const presenterOverlayOpen = usePresentationStore((s) => s.presenterOverlayOpen);
  const goToScene = usePresentationStore((s) => s.goToScene);
  const prevScene = usePresentationStore((s) => s.prevScene);
  const nextScene = usePresentationStore((s) => s.nextScene);
  const toggleOverview = usePresentationStore((s) => s.toggleOverview);
  const togglePresenterOverlay = usePresentationStore((s) => s.togglePresenterOverlay);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const slide = SLIDES[currentScene];

  return (
    <>
      {/* Minimal Top Slide Index */}
      <header className="hud-top" role="banner" data-hud-control="true">
        <button
          type="button"
          className="hud-progress-trigger"
          onClick={toggleOverview}
          title="Открыть обзор слайдов (G)"
          aria-label={`Слайд ${slide.number} из ${SLIDES.length}: ${slide.chapter}. Открыть обзор`}
        >
          <span className="hud-progress-num">
            {slide.number} <span className="hud-progress-sep">/</span> {String(SLIDES.length).padStart(2, '0')}
          </span>
          <span className="hud-chapter">{slide.chapter}</span>
        </button>

        {/* Discreet Ghost Controls (low opacity at rest, surface on hover) */}
        <div className="hud-tools hud-ghost">
          <button
            type="button"
            className={`hud-icon-btn ${presenterOverlayOpen ? 'hud-icon-btn--active' : ''}`}
            onClick={togglePresenterOverlay}
            title="Заметки докладчика (P)"
            aria-label="Заметки докладчика"
          >
            <FileText size={14} />
          </button>

          <button
            type="button"
            className="hud-icon-btn"
            onClick={onOpenPresenterWindow}
            title="Отдельное окно докладчика"
            aria-label="Отдельное окно докладчика"
          >
            <ExternalLink size={14} />
          </button>

          <button
            type="button"
            className="hud-icon-btn"
            onClick={onToggleFullscreen}
            title="Полноэкранный режим (F)"
            aria-label="Полноэкранный режим"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Subtle Bottom Hairline Progress & Ghost Navigation Arrows */}
      <nav className="hud-bottom" aria-label="Навигация по слайдам" data-hud-control="true">
        <div className="hud-rail" role="tablist" aria-label="Слайды">
          {SLIDES.map((s) => {
            const isActive = s.id === currentScene;
            const isPassed = s.id < currentScene;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Слайд ${s.number}: ${s.title}`}
                title={`${s.number} — ${s.title}`}
                className={`hud-rail-seg ${
                  isActive ? 'hud-rail-seg--active' : isPassed ? 'hud-rail-seg--passed' : ''
                }`}
                onClick={() => goToScene(s.id)}
              />
            );
          })}
        </div>

        <div className="hud-nav-group hud-ghost">
          <button
            type="button"
            className="hud-icon-btn"
            onClick={prevScene}
            disabled={currentScene === 0}
            aria-label="Предыдущий слайд"
            title="Предыдущий слайд (←)"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            className="hud-icon-btn"
            onClick={nextScene}
            disabled={currentScene === SLIDES.length - 1}
            aria-label="Следующий слайд"
            title="Следующий слайд (→ / Пробел)"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>
    </>
  );
}
