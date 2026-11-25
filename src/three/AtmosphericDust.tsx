import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AtmosphericDustProps {
  count?: number;
  spread?: [number, number, number];
  color?: string;
  size?: number;
  opacity?: number;
  speed?: number;
  reducedMotion?: boolean;
}

export function AtmosphericDust({
  count = 240,
  spread = [14, 9, 10],
  color = '#d9c49e',
  size = 0.032,
  opacity = 0.48,
  speed = 0.14,
  reducedMotion = false,
}: AtmosphericDustProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const s = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random distribution
      const r1 = Math.sin(i * 12.9898 + 1.1) * 43758.5453;
      const r2 = Math.sin(i * 78.233 + 2.3) * 43758.5453;
      const r3 = Math.sin(i * 39.425 + 4.7) * 43758.5453;
      const fx = r1 - Math.floor(r1) - 0.5;
      const fy = r2 - Math.floor(r2) - 0.5;
      const fz = r3 - Math.floor(r3) - 0.5;

      pos[i * 3] = fx * spread[0];
      pos[i * 3 + 1] = fy * spread[1];
      pos[i * 3 + 2] = fz * spread[2];

      s[i * 3] = (fx + 0.5) * Math.PI * 2;
      s[i * 3 + 1] = 0.5 + (fy + 0.5) * 0.8;
      s[i * 3 + 2] = (fz + 0.5) * Math.PI * 2;
    }
    return { positions: pos, seeds: s };
  }, [count, spread]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    const t = state.clock.elapsedTime * speed;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx + 1] += dt * 0.07 * seeds[idx + 1];
      arr[idx] += Math.sin(t + seeds[idx]) * dt * 0.035;
      if (arr[idx + 1] > spread[1] * 0.5) {
        arr[idx + 1] = -spread[1] * 0.5;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry key={count}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
