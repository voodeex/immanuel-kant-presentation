import { usePresentationStore } from '../store/usePresentationStore';

/**
 * Pure, distraction-free Keynote editorial overlays for all 12 slides.
 * Zero in-slide buttons or interactive widgets — one central idea per slide,
 * monumental projector-legible typography, and asymmetrical museum composition.
 */
export function SceneEditorialOverlay() {
  const currentScene = usePresentationStore((s) => s.currentScene);
  const replayNonce = usePresentationStore((s) => s.replayNonce);

  const animKey = `${currentScene}-${replayNonce}`;

  return (
    <div className="scene-overlay" key={animKey}>
      {/* SLIDE 01 — TITLE */}
      {currentScene === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            maxWidth: '58%',
          }}
        >
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <div
              className="museum-label anim-reveal"
              style={{ animationDelay: '0.2s', marginBottom: '18px' }}
            >
              1724 — 1804
            </div>
            <h1
              className="display-monumental display-xl anim-reveal-light"
              style={{ animationDelay: '0.35s' }}
            >
              ИММАНУИЛ
              <br />
              КАНТ
            </h1>
            <div
              className="gold-rule anim-rule"
              style={{ animationDelay: '0.8s', margin: '26px 0 22px' }}
            />
            <p
              className="editorial-subtitle anim-reveal"
              style={{
                animationDelay: '0.95s',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontStyle: 'normal',
                fontSize: 'clamp(1.05rem, 1.6vw, 1.7rem)',
                color: 'var(--ink-ivory)',
              }}
            >
              ГРАНИЦЫ РАЗУМА
              <br />И НРАВСТВЕННЫЙ ЗАКОН
            </p>
          </div>
          <div className="museum-footnote anim-reveal" style={{ animationDelay: '1.25s' }}>
            Мраморный бюст И. Канта · Ф. Хагеман, 1801 (Гамбургский кунстхалле)
          </div>
        </div>
      )}

      {/* SLIDE 02 — BIOGRAPHY */}
      {currentScene === 1 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            maxWidth: '54%',
          }}
        >
          <div style={{ marginTop: '3vh' }}>
            <h2
              className="display-monumental display-lg anim-reveal"
              style={{ animationDelay: '0.18s' }}
            >
              ТИХАЯ ЖИЗНЬ.
              <br />
              ВЕЛИКИЕ ИДЕИ.
            </h2>

            <div
              className="anim-reveal"
              style={{
                animationDelay: '0.5s',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px 26px',
                marginTop: '26px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(183, 155, 104, 0.28)',
              }}
            >
              <span className="museum-label" style={{ color: 'var(--ink-ivory)' }}>
                1724 — РОЖДЕНИЕ
              </span>
              <span className="museum-label" style={{ color: 'var(--accent-gold)' }}>
                КЁНИГСБЕРГ
              </span>
              <span className="museum-label" style={{ color: 'var(--ink-ivory)' }}>
                ПРОФЕССОР В 46 ЛЕТ
              </span>
            </div>
          </div>

          <div
            className="anim-reveal"
            style={{
              animationDelay: '1.35s',
              padding: '16px 20px',
              background: 'rgba(11, 11, 10, 0.72)',
              borderLeft: '1px solid var(--accent-gold)',
              maxWidth: '520px',
            }}
          >
            <p className="display-monumental display-md" style={{ color: 'var(--ink-ivory)' }}>
              ГЛАВНЫЕ СОБЫТИЯ
              <br />
              ПРОИСХОДИЛИ В МЫСЛИ.
            </p>
            <p className="museum-footnote" style={{ marginTop: '10px' }}>
              По легенде, горожане сверяли по нему часы · ректор Кёнигсбергского университета
            </p>
          </div>
        </div>
      )}

      {/* SLIDE 03 — PHILOSOPHICAL TURN */}
      {currentScene === 2 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ maxWidth: '760px' }}>
            <div className="museum-label anim-reveal" style={{ animationDelay: '0.15s', marginBottom: '12px' }}>
              Давид Юм · перелом критического периода
            </div>
            <h2
              className="display-monumental display-lg anim-reveal"
              style={{ animationDelay: '0.3s' }}
            >
              ПРОБУЖДЕНИЕ ОТ
              <br />
              ДОГМАТИЧЕСКОГО СНА
            </h2>
          </div>

          <div
            className="anim-reveal"
            style={{
              animationDelay: '0.95s',
              maxWidth: '640px',
              padding: '16px 20px',
              background: 'rgba(11, 11, 10, 0.72)',
              borderLeft: '1px solid var(--accent-gold)',
            }}
          >
            <p
              className="display-quote"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--accent-gold)',
                fontSize: 'clamp(1.2rem, 2.1vw, 2.1rem)',
              }}
            >
              Можно ли надёжно вывести причинность из опыта?
            </p>
            <p className="museum-caption" style={{ marginTop: '10px' }}>
              Прежде чем строить метафизику, нужно проверить сам разум — на что он вообще способен.
            </p>
          </div>
        </div>
      )}

      {/* SLIDE 04 — CRITIQUE OF PURE REASON */}
      {currentScene === 3 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            maxWidth: '58%',
          }}
        >
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <div className="museum-label anim-reveal" style={{ animationDelay: '0.15s', marginBottom: '14px' }}>
              «Критика чистого разума»
            </div>
            <h2
              className="display-monumental display-xl anim-reveal"
              style={{ animationDelay: '0.3s' }}
            >
              ЧТО МЫ
              <br />
              МОЖЕМ ЗНАТЬ?
            </h2>
            <div
              className="gold-rule anim-rule"
              style={{ animationDelay: '0.75s', margin: '26px 0 22px' }}
            />
            <p
              className="display-quote anim-reveal"
              style={{
                animationDelay: '0.9s',
                fontSize: 'clamp(1.2rem, 1.9vw, 1.95rem)',
                maxWidth: '560px',
              }}
            >
              Возможно ли знание, которое не берётся из опыта, но расширяет его?
            </p>
            <p className="museum-caption anim-reveal" style={{ animationDelay: '1.15s', marginTop: '14px', maxWidth: '520px' }}>
              Синтетические априорные суждения (пример — математика). От ответа зависит, возможна ли метафизика как наука.
            </p>
          </div>
        </div>
      )}

      {/* SLIDE 05 — SPACE AND TIME */}
      {currentScene === 4 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
            <div>
              <div className="museum-label anim-reveal" style={{ animationDelay: '0.15s', marginBottom: '10px' }}>
                Формы восприятия и категории рассудка
              </div>
              <h2
                className="display-monumental display-lg anim-reveal"
                style={{ animationDelay: '0.28s' }}
              >
                ПРОСТРАНСТВО
                <br />
                <span style={{ color: 'var(--accent-gold)' }}>И ВРЕМЯ</span>
              </h2>
            </div>

            <div className="anim-reveal" style={{ animationDelay: '0.7s', textAlign: 'right', maxWidth: '380px' }}>
              <div className="museum-label" style={{ color: 'var(--ink-ivory)', marginBottom: '8px' }}>
                Шаг 1 · Чувственность
              </div>
              <p className="museum-caption">
                Не свойства вещей, а формы нашего восприятия.
              </p>
            </div>
          </div>

          <div
            className="anim-reveal"
            style={{
              animationDelay: '1.15s',
              maxWidth: '620px',
              padding: '14px 20px',
              background: 'rgba(11, 11, 10, 0.72)',
              borderLeft: '1px solid var(--accent-gold)',
            }}
          >
            <div className="museum-label" style={{ marginBottom: '6px' }}>
              Шаг 2 · Категории рассудка (причинность)
            </div>
            <p className="museum-caption" style={{ color: 'var(--ink-ivory)' }}>
              Законы природы мы не вычитываем из мира, а сами вносим в опыт.
            </p>
          </div>
        </div>
      )}

      {/* SLIDE 06 — PHENOMENA AND NOUMENA */}
      {currentScene === 5 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2
              className="display-monumental display-md anim-reveal"
              style={{ animationDelay: '0.18s' }}
            >
              ЯВЛЕНИЕ <span style={{ color: 'var(--accent-gold)' }}>И ВЕЩЬ В СЕБЕ</span>
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 'auto',
              marginBottom: '22px',
              gap: '20px',
            }}
          >
            <div
              className="anim-reveal"
              style={{
                animationDelay: '0.75s',
                padding: '12px 18px',
                background: 'rgba(11, 11, 10, 0.78)',
                borderLeft: '1px solid var(--accent-gold)',
              }}
            >
              <div
                className="display-monumental"
                style={{ fontSize: 'clamp(1.25rem, 2.1vw, 2.15rem)', letterSpacing: '0.14em' }}
              >
                ЯВЛЕНИЕ
              </div>
              <div className="museum-footnote" style={{ marginTop: '4px' }}>
                Мир, открытый нашему опыту
              </div>
            </div>

            <div
              className="anim-reveal"
              style={{
                animationDelay: '0.95s',
                textAlign: 'right',
                padding: '12px 18px',
                background: 'rgba(11, 11, 10, 0.78)',
                borderRight: '1px solid rgba(183, 155, 104, 0.4)',
              }}
            >
              <div
                className="display-monumental"
                style={{
                  fontSize: 'clamp(1.25rem, 2.1vw, 2.15rem)',
                  letterSpacing: '0.14em',
                  color: 'rgba(234, 228, 216, 0.7)',
                }}
              >
                ВЕЩЬ В СЕБЕ
              </div>
              <div className="museum-footnote" style={{ marginTop: '4px' }}>
                Закрыта для теоретического знания
              </div>
            </div>
          </div>

          <p
            className="museum-caption anim-reveal"
            style={{
              animationDelay: '1.2s',
              textAlign: 'center',
              maxWidth: '720px',
              margin: '0 auto',
              color: 'var(--ink-ivory)',
            }}
          >
            Человек тоже «вещь в себе» — он не целиком подчинён времени и причинам. Значит, свобода возможна.
          </p>
        </div>
      )}

      {/* SLIDE 07 — ANTINOMIES */}
      {currentScene === 6 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="museum-label anim-reveal" style={{ animationDelay: '0.12s', marginBottom: '8px' }}>
              Шаг 3 · Попытка познать мир как целое
            </div>
            <h2
              className="display-monumental display-md anim-reveal"
              style={{ animationDelay: '0.24s' }}
            >
              КОГДА РАЗУМ ПРОТИВОРЕЧИТ СЕБЕ
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 'clamp(16px, 3vw, 48px)',
            }}
          >
            <div className="anim-reveal" style={{ animationDelay: '0.5s' }}>
              <div className="museum-label" style={{ marginBottom: '10px' }}>
                Тезис
              </div>
              <div
                className="display-monumental"
                style={{ fontSize: 'clamp(1.45rem, 2.8vw, 2.9rem)' }}
              >
                МИР ИМЕЕТ
                <br />
                НАЧАЛО
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                className="display-monumental anim-reveal"
                style={{
                  animationDelay: '0.85s',
                  fontSize: 'clamp(1.05rem, 1.5vw, 1.55rem)',
                  letterSpacing: '0.26em',
                  color: 'var(--accent-gold)',
                  padding: '12px 20px',
                  background: 'rgba(11, 11, 10, 0.9)',
                  border: '1px solid rgba(183, 155, 104, 0.4)',
                }}
              >
                АНТИНОМИЯ
              </div>
            </div>

            <div className="anim-reveal" style={{ animationDelay: '0.7s', textAlign: 'right' }}>
              <div className="museum-label" style={{ marginBottom: '10px' }}>
                Антитезис
              </div>
              <div
                className="display-monumental"
                style={{ fontSize: 'clamp(1.45rem, 2.8vw, 2.9rem)' }}
              >
                МИР
                <br />
                БЕСКОНЕЧЕН
              </div>
            </div>
          </div>

          <p
            className="museum-caption anim-reveal"
            style={{ animationDelay: '1.15s', textAlign: 'center', maxWidth: '660px', margin: '0 auto' }}
          >
            Пары одинаково доказуемых утверждений разума о душе, мире в целом и Боге.
          </p>
        </div>
      )}

      {/* SLIDE 08 — MORAL LAW */}
      {currentScene === 7 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ maxWidth: '720px' }}>
            <div className="museum-label anim-reveal" style={{ animationDelay: '0.15s', marginBottom: '10px' }}>
              «Критика практического разума»
            </div>
            <h2
              className="display-monumental display-lg anim-reveal"
              style={{ animationDelay: '0.28s' }}
            >
              КАТЕГОРИЧЕСКИЙ
              <br />
              ИМПЕРАТИВ
            </h2>
          </div>

          <div
            className="anim-reveal"
            style={{
              animationDelay: '0.95s',
              maxWidth: '780px',
              padding: '18px 24px',
              background: 'rgba(11, 11, 10, 0.78)',
              borderLeft: '2px solid var(--accent-gold)',
            }}
          >
            <p
              className="display-quote"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              ПОСТУПАЙ ТАК, ЧТОБЫ ПРАВИЛО ТВОЕГО ПОСТУПКА МОГЛО СТАТЬ ВСЕОБЩИМ ЗАКОНОМ.
            </p>
            <p className="museum-footnote" style={{ marginTop: '10px' }}>
              Источник морали заключён в самом разуме · краткая формулировка
            </p>
          </div>
        </div>
      )}

      {/* SLIDE 09 — FREEDOM AND DUTY */}
      {currentScene === 8 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ maxWidth: '760px' }}>
            <div className="museum-label anim-reveal" style={{ animationDelay: '0.15s', marginBottom: '12px' }}>
              Свобода и нравственный долг
            </div>
            <h2
              className="display-monumental display-md anim-reveal"
              style={{ animationDelay: '0.28s', color: 'rgba(234, 228, 216, 0.86)' }}
            >
              СВОБОДА — ЭТО НЕ ОТСУТСТВИЕ ЗАКОНА,
            </h2>
            <div className="gold-rule anim-rule" style={{ animationDelay: '0.68s', margin: '18px 0' }} />
            <p
              className="display-monumental display-md anim-reveal"
              style={{ animationDelay: '0.82s', color: 'var(--accent-gold)' }}
            >
              А СПОСОБНОСТЬ ДАТЬ ЕГО СЕБЕ.
            </p>
          </div>

          <div
            className="anim-reveal"
            style={{
              animationDelay: '1.15s',
              maxWidth: '620px',
              padding: '14px 20px',
              background: 'rgba(11, 11, 10, 0.74)',
              borderLeft: '1px solid var(--accent-gold)',
            }}
          >
            <p className="museum-caption" style={{ color: 'var(--ink-ivory)' }}>
              Императив безусловен: он определяет волю изнутри. Человек свободен не только «от», но и «для» — это внутреннее законодательство разума.
            </p>
          </div>
        </div>
      )}

      {/* SLIDE 10 — HIGHEST GOOD */}
      {currentScene === 9 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ maxWidth: '660px' }}>
            <div className="museum-label anim-reveal" style={{ animationDelay: '0.15s', marginBottom: '10px' }}>
              Высшее благо
            </div>
            <h2
              className="display-monumental display-lg anim-reveal"
              style={{ animationDelay: '0.28s' }}
            >
              ДОБРОДЕТЕЛЬ
              <br />
              <span style={{ color: 'var(--accent-gold)' }}>И СЧАСТЬЕ</span>
            </h2>
          </div>

          <div
            className="anim-reveal"
            style={{
              animationDelay: '0.85s',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxWidth: '680px',
              padding: '18px 24px',
              background: 'rgba(11, 11, 10, 0.78)',
              borderLeft: '1px solid var(--accent-gold)',
            }}
          >
            <div className="museum-label">Постулаты практического разума</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 40px' }}>
              <div>
                <div
                  className="display-monumental"
                  style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.7rem)', letterSpacing: '0.1em' }}
                >
                  БЕССМЕРТИЕ ДУШИ
                </div>
                <div className="museum-footnote" style={{ marginTop: '4px' }}>
                  Бесконечное движение от добродетели к святости
                </div>
              </div>
              <div>
                <div
                  className="display-monumental"
                  style={{
                    fontSize: 'clamp(1.15rem, 1.8vw, 1.7rem)',
                    letterSpacing: '0.1em',
                    color: 'var(--accent-gold)',
                  }}
                >
                  БОГ
                </div>
                <div className="museum-footnote" style={{ marginTop: '4px' }}>
                  Соединяет добродетель со счастьем · достойность счастья
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE 11 — CONCLUSION */}
      {currentScene === 10 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%',
            gap: '24px',
          }}
        >
          <div className="museum-label anim-reveal" style={{ animationDelay: '0.15s' }}>
            Границы знания и свобода
          </div>

          <blockquote
            className="display-monumental display-md anim-reveal-light"
            style={{
              animationDelay: '0.4s',
              lineHeight: 1.24,
              letterSpacing: '0.07em',
              maxWidth: '880px',
            }}
          >
            «ЗВЁЗДНОЕ НЕБО НАДО МНОЙ
            <br />
            <span style={{ color: 'var(--accent-gold)' }}>
              И НРАВСТВЕННЫЙ ЗАКОН ВО МНЕ»
            </span>
          </blockquote>

          <div
            className="museum-footnote anim-reveal"
            style={{
              animationDelay: '0.75s',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Иммануил Кант · «Критика практического разума»
          </div>

          <div
            className="gold-rule-center anim-rule-center"
            style={{ animationDelay: '0.95s' }}
          />

          <p
            className="display-quote anim-reveal"
            style={{
              animationDelay: '1.15s',
              maxWidth: '780px',
              fontSize: 'clamp(1.1rem, 1.75vw, 1.7rem)',
              color: 'rgba(234, 228, 216, 0.92)',
            }}
          >
            То, что закрыто для теоретического знания, открывается через нравственность — как её необходимые условия.
          </p>
        </div>
      )}

      {/* SLIDE 12 — FINAL */}
      {currentScene === 11 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%',
            gap: '22px',
          }}
        >
          <div className="museum-label anim-reveal" style={{ animationDelay: '0.2s' }}>
            Иммануил Кант · 1724 — 1804
          </div>

          <h2
            className="display-monumental display-xl anim-reveal-light"
            style={{ animationDelay: '0.45s' }}
          >
            СПАСИБО
            <br />
            ЗА ВНИМАНИЕ
          </h2>

          <div
            className="gold-rule-center anim-rule-center"
            style={{ animationDelay: '0.85s', margin: '6px 0' }}
          />

          <p
            className="museum-caption anim-reveal"
            style={{
              animationDelay: '1.05s',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(234, 228, 216, 0.78)',
            }}
          >
            Немецкая классическая философия · Фихте · Шеллинг · Гегель
          </p>
        </div>
      )}
    </div>
  );
}
