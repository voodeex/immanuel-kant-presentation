import { Component, lazy, ReactNode, Suspense, useState } from 'react';
import { usePresentationStore } from '../store/usePresentationStore';
import { CinematicFallbackStage } from './CinematicFallbackStage';

const LazyThreeStage = lazy(() =>
  import('../three/SceneStage').then((m) => ({ default: m.SceneStage }))
);

function detectWebGL2Safe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Require modern browser globals that Three.js r170 + R3F depend on
    if (typeof ResizeObserver === 'undefined') return false;
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

class StageBoundary extends Component<
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
 * Loads Three.js / R3F lazily ONLY when WebGL2 + ResizeObserver are supported.
 * Older interactive whiteboards and lightweight mobile remotes never even parse Three.js!
 */
export function AdaptiveStage() {
  const currentScene = usePresentationStore((s) => s.currentScene);
  const [canUse3D] = useState<boolean>(() => detectWebGL2Safe());

  const fallback = <CinematicFallbackStage sceneIndex={currentScene} />;

  if (!canUse3D) {
    return fallback;
  }

  return (
    <StageBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LazyThreeStage />
      </Suspense>
    </StageBoundary>
  );
}
