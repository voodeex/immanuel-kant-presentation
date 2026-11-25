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

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
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

function ArchitecturalWebGLFallback({ sceneIndex }: { sceneIndex: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          sceneIndex >= 10
            ? 'radial-gradient(ellipse 80% 60% at 50% 25%, #191815 0%, #0B0B0A 75%)'
            : 'radial-gradient(ellipse 65% 65% at 62% 45%, #1f1c16 0%, #0B0B0A 74%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.4 }}
      >
        <defs>
          <radialGradient id="museumGlow" cx="62%" cy="46%" r="48%">
            <stop offset="0%" stopColor="#B79B68" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0B0B0A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#museumGlow)" />
        <circle cx="980" cy="440" r="240" fill="none" stroke="#B79B68" strokeWidth="1" opacity="0.5" />
        <circle cx="980" cy="440" r="320" fill="none" stroke="#77736C" strokeWidth="0.7" opacity="0.35" />
      </svg>
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
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    setWebglSupported(detectWebGL());
    preloadKantBust();
  }, []);

  if (!webglSupported) {
    return <ArchitecturalWebGLFallback sceneIndex={currentScene} />;
  }

  return (
    <div className="stage-canvas-layer" aria-hidden="true">
      <CanvasErrorBoundary fallback={<ArchitecturalWebGLFallback sceneIndex={currentScene} />}>
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
            });
          }}
        >
          <ActiveSceneRouter />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
