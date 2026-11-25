import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { HumanSilhouette } from '../HumanSilhouette';
import { getStoneTextures } from '../proceduralTextures';
import { createVolumetricBeamMaterial } from '../shaders';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

const STEP_COUNT = 54;

/**
 * SLIDE 10 — THE HIGHEST GOOD ("Добродетель и счастье")
 * Pre-directed 2.3s upward camera elevation along an infinite stone staircase,
 * then settles completely still facing the warm upper horizon light.
 */
export function Scene10HighestGood({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const beamMat = useMemo(() => createVolumetricBeamMaterial('#e8cf9b', 0.14), []);
  const stoneTex = useMemo(() => getStoneTextures(), []);

  useEffect(() => {
    return () => beamMat.dispose();
  }, [beamMat]);

  const steps = useMemo(() => {
    return Array.from({ length: STEP_COUNT }, (_, i) => ({
      index: i,
      y: -2.2 + i * 0.28,
      z: 1.6 - i * 0.56,
      width: 3.4 - Math.min(1.1, i * 0.014),
    }));
  }, []);

  useEffect(() => {
    const lookState = { y: 1.2 };
    const endLookY = 2.45;
    const camEnd = { x: -1.35, y: 1.35, z: 6.2 };

    if (reducedMotion) {
      camera.position.set(camEnd.x, camEnd.y, camEnd.z);
      camera.lookAt(0.45, endLookY, -8.5);
      return;
    }

    camera.position.set(-1.55, -0.45, 7.6);
    camera.lookAt(0.45, lookState.y, -8.5);

    const tl = gsap.timeline();
    tl.to(
      camera.position,
      {
        x: camEnd.x,
        y: camEnd.y,
        z: camEnd.z,
        duration: 2.35,
        ease: 'power2.out',
      },
      0
    ).to(
      lookState,
      {
        y: endLookY,
        duration: 2.35,
        ease: 'power2.out',
        onUpdate: () => camera.lookAt(0.45, lookState.y, -8.5),
      },
      0
    );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion]);

  useFrame((state) => {
    beamMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fogExp2 attach="fog" args={['#0c0b09', 0.052]} />

      <ambientLight intensity={0.1} color="#cbbda6" />

      <directionalLight
        position={[1.5, 16, -12]}
        intensity={2.4}
        color="#edd4a2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight
        position={[0, 11.5, -16.5]}
        intensity={85}
        distance={34}
        decay={1.4}
        color="#e5c587"
      />

      <mesh position={[0, 7.2, -11.5]} rotation={[-0.35, 0, 0]} material={beamMat}>
        <coneGeometry args={[4.4, 15, 32, 1, true]} />
      </mesh>

      <mesh position={[-2.15, 4.5, -11]} rotation={[0.46, 0, 0]}>
        <boxGeometry args={[0.35, 2.2, 34]} />
        <meshStandardMaterial map={stoneTex.map} color="#161512" roughness={0.92} />
      </mesh>
      <mesh position={[2.15, 4.5, -11]} rotation={[0.46, 0, 0]}>
        <boxGeometry args={[0.35, 2.2, 34]} />
        <meshStandardMaterial map={stoneTex.map} color="#161512" roughness={0.92} />
      </mesh>

      <group>
        {steps.map((step) => (
          <mesh
            key={step.index}
            position={[0, step.y, step.z]}
            castShadow={step.index < 18}
            receiveShadow
          >
            <boxGeometry args={[step.width, 0.28, 0.62]} />
            <meshStandardMaterial
              map={stoneTex.map}
              bumpMap={stoneTex.bumpMap}
              bumpScale={0.04}
              color={step.index > 32 ? '#3e382e' : '#23211d'}
              roughness={0.86}
              metalness={0.08}
            />
          </mesh>
        ))}

        {[0, 12, 24, 36].map((idx) => {
          const s = steps[idx];
          return (
            <mesh key={idx} position={[0, s.y + 0.145, s.z + 0.31]}>
              <boxGeometry args={[s.width * 0.96, 0.015, 0.015]} />
              <meshBasicMaterial color="#B79B68" transparent opacity={0.55} />
            </mesh>
          );
        })}
      </group>

      <group position={[0, 12.6, -24.5]}>
        <mesh>
          <ringGeometry args={[2.1, 2.18, 64]} />
          <meshBasicMaterial color="#e8cf9b" transparent opacity={0.58} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <circleGeometry args={[2.05, 48]} />
          <meshBasicMaterial color="#c9a86b" transparent opacity={0.1} />
        </mesh>
      </group>

      <HumanSilhouette
        position={[0, -2.06, 1.75]}
        scale={0.76}
        color="#2a2620"
        metalness={0.28}
        roughness={0.62}
      />

      <AtmosphericDust
        count={isMobile ? 60 : 140}
        spread={[10, 14, 24]}
        color="#e5cc9b"
        size={0.025}
        opacity={0.34}
        speed={0.09}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
