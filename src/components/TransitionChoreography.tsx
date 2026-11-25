import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePresentationStore } from '../store/usePresentationStore';

/**
 * Brisk, directed cinematic slide transitions (0.55–0.9s):
 * - Slide 01 -> 02: Golden vertical light slit opens from darkness
 * - Slide 06 -> 07: Deep chiaroscuro breath across the boundary of reason
 * - Other slides: Subtle architectural fade synchronized with 3D camera choreography
 * Never blocks or delays rapid speaker navigation.
 */
export function TransitionChoreography() {
  const transitionNonce = usePresentationStore((s) => s.transitionNonce);
  const previousScene = usePresentationStore((s) => s.previousScene);
  const currentScene = usePresentationStore((s) => s.currentScene);
  const reducedMotion = usePresentationStore((s) => s.reducedMotion);

  const veilRef = useRef<HTMLDivElement>(null);
  const slitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transitionNonce === 0 || reducedMotion) return;
    const veil = veilRef.current;
    const slit = slitRef.current;
    if (!veil) return;

    gsap.killTweensOf([veil, slit]);

    const isSlitTransition = previousScene === 0 && currentScene === 1;
    const tl = gsap.timeline();

    if (isSlitTransition && slit) {
      tl.set(veil, { backgroundColor: '#080807', opacity: 0.92 })
        .set(slit, { opacity: 1, scaleY: 0, scaleX: 1 })
        .to(slit, { scaleY: 1, duration: 0.34, ease: 'power3.inOut' })
        .to(slit, { scaleX: 46, opacity: 0, duration: 0.45, ease: 'power2.out' }, 0.3)
        .to(veil, { opacity: 0, duration: 0.48, ease: 'power2.out' }, 0.28);
    } else {
      tl.fromTo(
        veil,
        { backgroundColor: '#0B0B0A', opacity: 0.72 },
        { opacity: 0, duration: 0.65, ease: 'power2.out' }
      );
    }

    return () => {
      tl.kill();
    };
  }, [transitionNonce, previousScene, currentScene, reducedMotion]);

  return (
    <div className="transition-veil" ref={veilRef} style={{ opacity: 0 }}>
      <div className="transition-slit" ref={slitRef} />
    </div>
  );
}
