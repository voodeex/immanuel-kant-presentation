import { Component, ReactNode, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { usePresentationStore } from '../store/usePresentationStore';
import { preloadKantBust, Scene01Philosopher } from './scenes/Scene01Philosopher';
import { Scene02Konigsberg } from './scenes/Scene02Konigsberg';
import { Scene03DogmaticSlumber } from './scenes/Scene03DogmaticSlumber';
import { Scene04PureReason } from './scenes/Scene04PureReason';
import { Scene05SpaceTime } from './scenes/Scene05SpaceTime';
import { Scene06PhenomenaNoumena } from './scenes/Scene06PhenomenaNoumena';
import { Scene07Antinomies } from './scenes/Scene07Antinomies';
import { Scene08MoralLaw } from './scenes/Scene08MoralLaw';
import { Scene09FreedomDuty } from './scenes/Scene09FreedomDuty';
import { Scene10HighestGood } from './scenes/Scene10HighestGood';
import { Scene11StarrySky } from './scenes/Scene11StarrySky';

/**
 * Three.js r170 strictly requires WebGL2.
 * Interactive whiteboards / older Smart TV Chromium builds often expose only WebGL1
 * (or broken software WebGL), which would crash Three.js into a black screen if not detected.
 */
function detectWebGL2(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      powerPreference: 'default',
    });
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    return true;
  } catch {
    return false;
  }
}

class CanvasErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Rich museum-grade 2D/SVG fallback rendered automatically on devices without WebGL2
 * (e.g. older classroom interactive whiteboards / Smart TV browsers).
 */
function CinematicFallbackStage({ sceneIndex }: { sceneIndex: number }) {
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

          {/* Slide 02: Antique Königsberg Clock */}
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

          {/* Slide 03: Fracturing Monolith & Golden System */}
          {sceneIndex === 2 && (
            <g>
              <rect x="440" y="160" width="210" height="580" fill="#181714" stroke="#3a362e" transform="rotate(-6 545 450)" />
              <rect x="950" y="160" width="210" height="580" fill="#181714" stroke="#3a362e" transform="rotate(6 1055 450)" />
              <circle cx="800" cy="450" r="190" fill="none" stroke="#B79B68" strokeWidth="2" opacity="0.7" />
              <circle cx="800" cy="450" r="130" fill="none" stroke="#EAE4D8" strokeWidth="1" opacity="0.5" />
              <polygon points="800,320 915,450 800,580 685,450" fill="none" stroke="#B79B68" strokeWidth="1.5" />
            </g>
          )}

          {/* Slides 04 & 05: Mathematical Space & Curved Space-Time */}
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

          {/* Slide 06: Phenomenon vs Thing in Itself */}
          {sceneIndex === 5 && (
            <g>
              <polygon points="480,260 640,350 610,550 430,580 340,410" fill="#3a3224" stroke="#B79B68" strokeWidth="2" />
              <line x1="800" y1="80" x2="800" y2="820" stroke="#B79B68" strokeWidth="2" opacity="0.75" />
              <circle cx="1120" cy="450" r="165" fill="#070706" stroke="#4A2427" strokeWidth="2" />
            </g>
          )}

          {/* Slide 07: Antinomies Split */}
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

          {/* Slides 08 & 09: Moral Law & Freedom */}
          {(sceneIndex === 7 || sceneIndex === 8) && (
            <g>
              <polygon points="680,0 920,0 1060,900 540,900" fill="url(#beamGrad)" />
              <ellipse cx="800" cy="700" rx="220" ry="44" fill="none" stroke="#B79B68" strokeWidth="2" opacity="0.75" />
              <circle cx="800" cy="465" r="24" fill="#2b2620" />
              <path d="M770,500 L830,500 L816,695 L784,695 Z" fill="#2b2620" />
            </g>
          )}

          {/* Slide 10: Monumental Staircase */}
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

          {/* Slides 11 & 12: Starry Sky */}
          {sceneIndex >= 10 && (
            <g>
              {Array.from({ length: 110 }, (_, i) => {
                const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
                const y = ((Math.sin(i * 78.233) * 43758.5453) % 1 + 1) % 1;
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

function ActiveSceneRouter() {
  const currentScene = usePresentationStore((s) => s.currentScene);
  const replayNonce = usePresentationStore((s) => s.replayNonce);
  const reducedMotion = usePresentationStore((s) => s.reducedMotion);
  const isMobile = usePresentationStore((s) => s.isMobile);

  const props = { replayNonce, reducedMotion, isMobile };

  switch (currentScene) {
    case 0:
      return <Scene01Philosopher key="s0" {...props} />;
    case 1:
      return <Scene02Konigsberg key="s1" {...props} />;
    case 2:
      return <Scene03DogmaticSlumber key="s2" {...props} />;
    case 3:
      return <Scene04PureReason key="s3" {...props} />;
    case 4:
      return <Scene05SpaceTime key="s4" {...props} />;
    case 5:
      return <Scene06PhenomenaNoumena key="s5" {...props} />;
    case 6:
      return <Scene07Antinomies key="s6" {...props} />;
    case 7:
      return <Scene08MoralLaw key="s7" {...props} />;
    case 8:
      return <Scene09FreedomDuty key="s8" {...props} />;
    case 9:
      return <Scene10HighestGood key="s9" {...props} />;
    case 10:
      return <Scene11StarrySky key="s10" {...props} />;
    case 11:
      return <Scene11StarrySky key="s11" minimal {...props} />;
    default:
      return <Scene01Philosopher key="s0" {...props} />;
  }
}

export function SceneStage() {
  const currentScene = usePresentationStore((s) => s.currentScene);
  const isMobile = usePresentationStore((s) => s.isMobile);
  const [webgl2Supported, setWebgl2Supported] = useState<boolean>(() => detectWebGL2());
  const [contextFailed, setContextFailed] = useState(false);

  useEffect(() => {
    const ok = detectWebGL2();
    setWebgl2Supported(ok);
    if (ok) {
      preloadKantBust();
    }
  }, []);

  if (!webgl2Supported || contextFailed) {
    return <CinematicFallbackStage sceneIndex={currentScene} />;
  }

  return (
    <div className="stage-canvas-layer" aria-hidden="true">
      <CanvasErrorBoundary fallback={<CinematicFallbackStage sceneIndex={currentScene} />}>
        <Canvas
          shadows={!isMobile}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          camera={{ position: [0, 0.2, 6.2], fov: 44, near: 0.1, far: 120 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setContextFailed(true);
            });
          }}
        >
          <ActiveSceneRouter />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
