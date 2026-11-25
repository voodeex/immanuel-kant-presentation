import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { createStarfieldMaterial } from '../shaders';
import type { SceneProps } from './Scene01Philosopher';

/**
 * SLIDE 11 — CONCLUSION ("Границы знания и свобода")
 * SLIDE 12 — FINAL ("Спасибо за внимание") — minimal zenith variant via `minimal` prop
 * Pre-directed 2.2s upward tilt into a crisp, astronomically calibrated starry sky; settles completely still.
 */
export function Scene11StarrySky({
  replayNonce,
  reducedMotion,
  isMobile,
  minimal = false,
}: SceneProps & { minimal?: boolean }) {
  const { camera } = useThree();
  const starMat = useMemo(() => createStarfieldMaterial(), []);

  useEffect(() => {
    return () => starMat.dispose();
  }, [starMat]);

  const starGeometry = useMemo(() => {
    const count = minimal ? (isMobile ? 380 : 820) : isMobile ? 620 : 1350;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#f4efe6'),
      new THREE.Color('#eae4d8'),
      new THREE.Color('#d8dfec'),
      new THREE.Color('#dfc89d'),
    ];

    for (let i = 0; i < count; i++) {
      const seedOffset = minimal ? 31.4 : 0;
      const r1 = Math.sin(i * 12.9898 + 0.5 + seedOffset) * 43758.5453;
      const r2 = Math.sin(i * 78.233 + 1.7 + seedOffset) * 43758.5453;
      const r3 = Math.sin(i * 45.164 + 3.9 + seedOffset) * 43758.5453;
      const r4 = Math.sin(i * 93.719 + 6.2 + seedOffset) * 43758.5453;

      const u = r1 - Math.floor(r1);
      const v = r2 - Math.floor(r2);
      const mag = r3 - Math.floor(r3);
      const phase = r4 - Math.floor(r4);

      const theta = u * Math.PI * 2;
      const phi = Math.acos(0.06 + v * 0.94);
      const radius = 32 + (i % 7) * 3.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) - 1.2;
      positions[i * 3 + 2] = -Math.abs(radius * Math.sin(phi) * Math.sin(theta)) - 4;

      sizes[i] = 0.52 + Math.pow(mag, 6.2) * (minimal ? 1.85 : 2.35);
      phases[i] = phase;

      const c = palette[i % palette.length];
      const brightness = (minimal ? 0.42 : 0.55) + Math.pow(mag, 2.2) * 0.45;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [isMobile, minimal]);

  useEffect(() => {
    return () => starGeometry.dispose();
  }, [starGeometry]);

  const horizonGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(76, 12, 64, 4);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      if (y > 0) {
        const ridge =
          Math.sin(x * 0.14) * 0.55 +
          Math.cos(x * 0.31 + 1.2) * 0.25 +
          Math.sin(x * 0.06) * 0.7;
        pos.setY(i, y + ridge);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => horizonGeo.dispose();
  }, [horizonGeo]);

  useEffect(() => {
    const targetLookY = minimal ? 6.2 : 3.6;
    const startLookY = minimal ? 3.8 : -0.8;
    const lookState = { y: startLookY };

    if (reducedMotion) {
      camera.position.set(0, 0.45, 5.5);
      camera.lookAt(0, targetLookY, -24);
      starMat.uniforms.uOpacity.value = 1;
      return;
    }

    camera.position.set(0, minimal ? 0.2 : -0.35, 6.0);
    camera.lookAt(0, startLookY, -24);
    starMat.uniforms.uOpacity.value = minimal ? 0.35 : 0;

    const tl = gsap.timeline();
    tl.to(starMat.uniforms.uOpacity, { value: 1, duration: 1.9, ease: 'power2.out' }, 0.1)
      .to(camera.position, { y: 0.45, z: 5.5, duration: 2.25, ease: 'power2.out' }, 0)
      .to(
        lookState,
        {
          y: targetLookY,
          duration: 2.25,
          ease: 'power2.out',
          onUpdate: () => camera.lookAt(0, lookState.y, -24),
        },
        0
      );

    return () => {
      tl.kill();
    };
  }, [camera, minimal, replayNonce, reducedMotion, starMat]);

  // Subtle gentle star twinkle only — completely still sky
  useFrame((state) => {
    starMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <color attach="background" args={['#080807']} />

      <points geometry={starGeometry} material={starMat} frustumCulled={false} />

      <mesh position={[0, -3.4, -26]}>
        <planeGeometry args={[76, 4.2]} />
        <meshBasicMaterial color="#2a2216" transparent opacity={minimal ? 0.2 : 0.34} />
      </mesh>
      <mesh position={[0, -4.4, -25.5]}>
        <planeGeometry args={[76, 0.04]} />
        <meshBasicMaterial color="#B79B68" transparent opacity={minimal ? 0.28 : 0.4} />
      </mesh>

      <mesh geometry={horizonGeo} position={[0, -9.8, -24]}>
        <meshBasicMaterial color="#090908" />
      </mesh>
    </group>
  );
}
