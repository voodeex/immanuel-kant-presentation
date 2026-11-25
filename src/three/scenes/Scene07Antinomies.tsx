import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getStoneTextures } from '../proceduralTextures';
import type { SceneProps } from './Scene01Philosopher';

/**
 * SLIDE 07 — ANTINOMIES OF REASON ("Когда разум противоречит себе")
 * Pre-directed 2.2s choreography: warm light weighs Thesis (finite cosmos),
 * then Antithesis (infinite expanse), then settles into balanced solemn tension.
 */
export function Scene07Antinomies({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const finiteGroupRef = useRef<THREE.Group>(null);
  const leftLightRef = useRef<THREE.PointLight>(null);
  const rightLightRef = useRef<THREE.PointLight>(null);
  const stoneTex = useMemo(() => getStoneTextures(), []);

  const rightStars = useMemo(() => {
    const count = isMobile ? 220 : 480;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r1 = Math.sin(i * 19.19 + 3.1) * 43758.5453;
      const r2 = Math.sin(i * 47.73 + 7.4) * 43758.5453;
      const r3 = Math.sin(i * 91.37 + 1.9) * 43758.5453;
      const fx = r1 - Math.floor(r1);
      const fy = r2 - Math.floor(r2) - 0.5;
      const fz = r3 - Math.floor(r3);

      positions[i * 3] = 0.65 + fx * 8.5;
      positions[i * 3 + 1] = fy * 9.5;
      positions[i * 3 + 2] = 1.5 - fz * 26.0;
    }
    return positions;
  }, [isMobile]);

  useEffect(() => {
    const lookTarget = new THREE.Vector3(0, 0, -2.5);

    if (reducedMotion) {
      camera.position.set(0, 0.15, 7.1);
      camera.lookAt(lookTarget);
      if (leftLightRef.current) leftLightRef.current.intensity = 22;
      if (rightLightRef.current) rightLightRef.current.intensity = 22;
      if (finiteGroupRef.current) finiteGroupRef.current.rotation.set(0.15, 0.45, 0);
      return;
    }

    camera.position.set(0, 0.25, 8.2);
    camera.lookAt(lookTarget);
    if (leftLightRef.current) leftLightRef.current.intensity = 4;
    if (rightLightRef.current) rightLightRef.current.intensity = 4;
    if (finiteGroupRef.current) finiteGroupRef.current.rotation.set(0, -0.35, 0);

    const tl = gsap.timeline();

    tl.to(
      camera.position,
      {
        x: 0,
        y: 0.15,
        z: 7.1,
        duration: 2.0,
        ease: 'power3.out',
        onUpdate: () => camera.lookAt(lookTarget),
      },
      0
    )
      .to(leftLightRef.current!, { intensity: 30, duration: 0.85, ease: 'power2.out' }, 0.15)
      .to(rightLightRef.current!, { intensity: 30, duration: 0.85, ease: 'power2.out' }, 0.75)
      .to(leftLightRef.current!, { intensity: 22, duration: 0.65, ease: 'power2.inOut' }, 1.55)
      .to(rightLightRef.current!, { intensity: 22, duration: 0.65, ease: 'power2.inOut' }, 1.55)
      .to(
        finiteGroupRef.current!.rotation,
        { x: 0.15, y: 0.45, duration: 2.1, ease: 'power2.out' },
        0.1
      );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion]);

  const infiniteDepths = [-0.5, -2.8, -5.4, -8.4, -12.0, -16.5, -21.5];

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 8, 28]} />

      <ambientLight intensity={0.14} color="#c8bca8" />

      <pointLight
        ref={leftLightRef}
        position={[-2.9, 0.4, 1.4]}
        intensity={22}
        distance={12}
        color="#e5c891"
      />
      <pointLight
        ref={rightLightRef}
        position={[3.0, 0.4, 0.5]}
        intensity={22}
        distance={16}
        color="#d7d2c8"
      />

      {/* Central Dark Dividing Axis */}
      <group position={[0, 0, -2]}>
        <mesh>
          <boxGeometry args={[0.14, 14, 24]} />
          <meshStandardMaterial color="#070706" roughness={0.95} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 12.01]}>
          <boxGeometry args={[0.018, 12, 0.02]} />
          <meshBasicMaterial color="#4A2427" />
        </mesh>
      </group>

      {/* LEFT SIDE: FINITE UNIVERSE */}
      <group position={[-2.85, 0.1, -0.6]}>
        <mesh rotation={[0, 0.22, 0]}>
          <torusGeometry args={[2.05, 0.11, 18, 64]} />
          <meshStandardMaterial
            map={stoneTex.map}
            color="#36322b"
            roughness={0.82}
            metalness={0.18}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.25, 0]}>
          <torusGeometry args={[1.88, 0.035, 14, 64]} />
          <meshStandardMaterial color="#B79B68" metalness={0.78} roughness={0.28} />
        </mesh>

        <group ref={finiteGroupRef}>
          <mesh>
            <icosahedronGeometry args={[1.45, 0]} />
            <meshBasicMaterial color="#B79B68" wireframe transparent opacity={0.48} />
          </mesh>
          <mesh rotation={[0.7, 0.4, 0]}>
            <torusGeometry args={[1.15, 0.02, 12, 56]} />
            <meshStandardMaterial color="#EAE4D8" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.42, 32, 32]} />
            <meshStandardMaterial
              color="#efe5d1"
              emissive="#c9a86a"
              emissiveIntensity={0.85}
              roughness={0.25}
            />
          </mesh>
        </group>
      </group>

      {/* RIGHT SIDE: ENDLESS COSMIC EXPANSE */}
      <group position={[0, 0, 0]}>
        <group position={[3.0, 0.1, 0]}>
          {infiniteDepths.map((zPos, i) => {
            const scale = 1.45 + i * 0.52;
            const opacity = Math.max(0.08, 0.45 - i * 0.055);
            return (
              <mesh key={i} position={[0, 0, zPos]}>
                <ringGeometry args={[scale, scale + 0.025, 64]} />
                <meshBasicMaterial
                  color={i % 2 === 0 ? '#EAE4D8' : '#B79B68'}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={opacity}
                />
              </mesh>
            );
          })}
        </group>

        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={rightStars.length / 3}
              array={rightStars}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#eae4d8"
            size={0.05}
            transparent
            opacity={0.75}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
}
