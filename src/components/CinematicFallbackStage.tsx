/**
 * Lightweight zero-Three.js museum 2D/SVG renderer used automatically on
 * interactive whiteboards / older browsers without WebGL2, and while WebGL2 initializes.
 */
export function CinematicFallbackStage({ sceneIndex }: { sceneIndex: number }) {
  const bustUrl = `${import.meta.env.BASE_URL}assets/kant-bust-hagemann-1801.jpg`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background:
          sceneIndex >= 10
            ? 'radial-gradient(ellipse 85% 65% at 50% 28%, #1c1914 0%, #090908 74%)'
            : 'radial-gradient(ellipse 68% 70% at 68% 48%, #262118 0%, #0B0B0A 72%)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Slide 01: Authentic Kant Marble Bust in warm gallery spotlight */}
      {sceneIndex === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: '8%',
            bottom: '8%',
            width: '44%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={bustUrl}
            alt="Мраморный бюст Иммануила Канта"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'sepia(22%) contrast(1.08) brightness(0.92)',
              maskImage: 'radial-gradient(ellipse 66% 74% at 50% 48%, #000 56%, transparent 96%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 66% 74% at 50% 48%, #000 56%, transparent 96%)',
            }}
          />
        </div>
      )}

      {/* Slides 02..12: Architectural & Celestial Museum Compositions */}
      {sceneIndex > 0 && (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: 'block', opacity: 0.78 }}
        >
          <defs>
            <radialGradient id="goldGlow" cx="65%" cy="48%" r="44%">
              <stop offset="0%" stopColor="#B79B68" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#0B0B0A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6CC98" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0B0B0A" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="1600" height="900" fill="url(#goldGlow)" />

          {sceneIndex === 1 && (
            <g transform="translate(1110, 450)">
              <circle r="290" fill="#14120f" stroke="#B79B68" strokeWidth="6" opacity="0.85" />
              <circle r="265" fill="none" stroke="#B79B68" strokeWidth="1.5" opacity="0.45" />
              <circle r="175" fill="none" stroke="#B79B68" strokeWidth="1" opacity="0.35" />
              <line x1="0" y1="0" x2="110" y2="55" stroke="#EAE4D8" strokeWidth="7" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-90" y2="-135" stroke="#B79B68" strokeWidth="4" strokeLinecap="round" />
              <circle r="14" fill="#B79B68" />
              <text x="0" y="95" textAnchor="middle" fill="#B79B68" fontSize="18" letterSpacing="4" opacity="0.7">
                KÖNIGSBERG · MDCCXXIV
              </text>
            </g>
          )}

          {sceneIndex === 2 && (
            <g>
              <rect x="440" y="160" width="210" height="580" fill="#181714" stroke="#3a362e" transform="rotate(-6 545 450)" />
              <rect x="950" y="160" width="210" height="580" fill="#181714" stroke="#3a362e" transform="rotate(6 1055 450)" />
              <circle cx="800" cy="450" r="190" fill="none" stroke="#B79B68" strokeWidth="2" opacity="0.7" />
              <circle cx="800" cy="450" r="130" fill="none" stroke="#EAE4D8" strokeWidth="1" opacity="0.5" />
              <polygon points="800,320 915,450 800,580 685,450" fill="none" stroke="#B79B68" strokeWidth="1.5" />
            </g>
          )}

          {(sceneIndex === 3 || sceneIndex === 4) && (
            <g>
              {[180, 270, 360, 450, 540, 630, 720].map((y) => (
                <line key={y} x1="80" y1={y} x2="1520" y2={y} stroke="#B79B68" strokeWidth="0.7" opacity="0.22" />
              ))}
              {[240, 420, 600, 780, 960, 1140, 1320].map((x) => (
                <line key={x} x1={x} y1="90" x2={x} y2="810" stroke="#B79B68" strokeWidth="0.7" opacity="0.22" />
              ))}
              <circle
                cx={sceneIndex === 3 ? 1080 : 800}
                cy="450"
                r="155"
                fill="#1d1a14"
                stroke="#B79B68"
                strokeWidth="2"
              />
              <ellipse
                cx={sceneIndex === 3 ? 1080 : 800}
                cy="450"
                rx="265"
                ry="78"
                fill="none"
                stroke="#EAE4D8"
                strokeWidth="1.2"
                opacity="0.65"
              />
            </g>
          )}

          {sceneIndex === 5 && (
            <g>
              <polygon points="480,260 640,350 610,550 430,580 340,410" fill="#3a3224" stroke="#B79B68" strokeWidth="2" />
              <line x1="800" y1="80" x2="800" y2="820" stroke="#B79B68" strokeWidth="2" opacity="0.75" />
              <circle cx="1120" cy="450" r="165" fill="#070706" stroke="#4A2427" strokeWidth="2" />
            </g>
          )}

          {sceneIndex === 6 && (
            <g>
              <circle cx="430" cy="450" r="210" fill="none" stroke="#B79B68" strokeWidth="2" opacity="0.7" />
              <circle cx="430" cy="450" r="120" fill="none" stroke="#EAE4D8" strokeWidth="1" opacity="0.5" />
              <line x1="800" y1="0" x2="800" y2="900" stroke="#4A2427" strokeWidth="4" />
              {[130, 210, 300, 410].map((r) => (
                <circle key={r} cx="1180" cy="450" r={r} fill="none" stroke="#EAE4D8" strokeWidth="1" opacity="0.28" />
              ))}
            </g>
          )}

          {(sceneIndex === 7 || sceneIndex === 8) && (
            <g>
              <polygon points="680,0 920,0 1060,900 540,900" fill="url(#beamGrad)" />
              <ellipse cx="800" cy="700" rx="220" ry="44" fill="none" stroke="#B79B68" strokeWidth="2" opacity="0.75" />
              <circle cx="800" cy="465" r="24" fill="#2b2620" />
              <path d="M770,500 L830,500 L816,695 L784,695 Z" fill="#2b2620" />
            </g>
          )}

          {sceneIndex === 9 && (
            <g>
              {Array.from({ length: 16 }, (_, i) => (
                <rect
                  key={i}
                  x={520 + i * 16}
                  y={740 - i * 38}
                  width={560 - i * 32}
                  height="22"
                  fill="#1f1d18"
                  stroke="#B79B68"
                  strokeOpacity={0.14 + i * 0.03}
                />
              ))}
              <circle cx="800" cy="150" r="95" fill="none" stroke="#E8CF9B" strokeWidth="1.5" opacity="0.55" />
            </g>
          )}

          {sceneIndex >= 10 && (
            <g>
              {Array.from({ length: 110 }, (_, i) => {
                const x = (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;
                const y = (((Math.sin(i * 78.233) * 43758.5453) % 1) + 1) % 1;
                const r = 0.7 + (i % 4) * 0.55;
                return (
                  <circle
                    key={i}
                    cx={x * 1600}
                    cy={y * 680}
                    r={r}
                    fill={i % 3 === 0 ? '#DFC89D' : '#EAE4D8'}
                    opacity={0.35 + (i % 5) * 0.14}
                  />
                );
              })}
              <line x1="0" y1="740" x2="1600" y2="740" stroke="#B79B68" strokeWidth="1" opacity="0.35" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
