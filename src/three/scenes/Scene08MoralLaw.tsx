import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { createHumanFigureGeometry, HumanSilhouette } from '../HumanSilhouette';
import { getStoneTextures } from '../proceduralTextures';
import { createVolumetricBeamMaterial } from '../shaders';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

const GRID_COLS = 11;
const GRID_ROWS = 9;

/**
 * SLIDE 08 — MORAL LAW / CATEGORICAL IMPERATIVE ("Категорический императив")
 * Pre-directed 2.4s choreography: begins illuminated on a solitary figure in the monumental hall,
 * then automatically universalizes as solemn architectural silhouettes emerge around it,
 * settling into a composed, stable final frame.
 */
export function Scene08MoralLaw({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const beamMat = useMemo(() => createVolumetricBeamMaterial('#e6cc98', 0.16), []);
  const stoneTex = useMemo(() => getStoneTextures(), []);
  const humanGeo = useMemo(() => createHumanFigureGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    return () => {
      beamMat.dispose();
      humanGeo.dispose();
    };
  }, [beamMat, humanGeo]);

  const crowdCoords = useMemo(() => {
    const coords: [number, number, number][] = [];
    const spacingX = 1.65;
    const spacingZ = 1.85;
    for (let r = -Math.floor(GRID_ROWS / 2); r <= Math.floor(GRID_ROWS / 2); r++) {
      for (let c = -Math.floor(GRID_COLS / 2); c <= Math.floor(GRID_COLS / 2); c++) {
        if (r === 0 && c === 0) continue;
        // Leave clear breathing space around the hero central figure
        if (Math.hypot(c, r) < 1.35) continue;
        coords.push([c * spacingX, -2.0, r * spacingZ]);
      }
    }
    return coords;
  }, []);

  const updateCrowd = (p: number) => {
    if (!instancedRef.current) return;
    for (let i = 0; i < crowdCoords.length; i++) {
      const [x, y, z] = crowdCoords[i];
      const dist = Math.hypot(x, z);
      const delay = Math.min(0.62, dist * 0.055);
      const localP = Math.max(0, Math.min(1, (p - delay) / (1 - delay + 0.001)));
      const ease = localP * localP * (3 - 2 * localP);

      dummy.position.set(x, y - (1 - ease) * 0.55, z);
      dummy.scale.set(ease * 0.88, ease * 0.88, ease * 0.88);
      dummy.rotation.y = Math.atan2(-x, -z);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    const lookTarget = new THREE.Vector3(0, -0.35, 0);
    const crowdState = { p: 0 };

    if (reducedMotion) {
      camera.position.set(0.35, 2.25, 8.9);
      camera.lookAt(lookTarget);
      updateCrowd(1);
      return;
    }

    camera.position.set(-0.6, 0.65, 5.4);
    camera.lookAt(lookTarget);
    updateCrowd(0);

    const tl = gsap.timeline();

    // 0.0–0.65s: Focus on solitary moral agent; 0.65–2.4s: Pull back as universal ranks emerge and settle
    tl.to(
      camera.position,
      {
        x: 0.35,
        y: 2.25,
        z: 8.9,
        duration: 2.15,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(lookTarget),
      },
      0.35
    ).to(
      crowdState,
      {
        p: 1,
        duration: 1.75,
        ease: 'power3.out',
        onUpdate: () => updateCrowd(crowdState.p),
      },
      0.65
    );

    return () => {
      tl.kill();
    };
  }, [camera, crowdCoords, replayNonce, reducedMotion]);

  useFrame((state) => {
    beamMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const hallPillars: [number, number, number][] = [
    [-7.2, 2.5, -5.5],
    [-7.2, 2.5, 0],
    [-7.2, 2.5, 5.5],
    [7.2, 2.5, -5.5],
    [7.2, 2.5, 0],
    [7.2, 2.5, 5.5],
  ];

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 8, 24]} />

      <ambientLight intensity={0.14} color="#c9bda8" />

      <spotLight
        position={[0, 9.0, 0.4]}
        angle={0.56}
        penumbra={0.85}
        intensity={85}
        distance={24}
        color="#f2dbb0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <mesh position={[0, 2.2, 0]} material={beamMat}>
        <cylinderGeometry args={[0.95, 2.35, 9.2, 36, 1, true]} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
        <ringGeometry args={[1.42, 1.47, 64]} />
        <meshBasicMaterial color="#B79B68" transparent opacity={0.62} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial
          map={stoneTex.map}
          bumpMap={stoneTex.bumpMap}
          bumpScale={0.04}
          color="#151411"
          roughness={0.82}
          metalness={0.14}
        />
      </mesh>

      {hallPillars.map((pos, idx) => (
        <mesh key={idx} position={pos} receiveShadow>
          <boxGeometry args={[0.85, 11, 0.85]} />
          <meshStandardMaterial map={stoneTex.map} color="#171613" roughness={0.9} />
        </mesh>
      ))}

      {/* Central Solitary Human Silhouette */}
      <HumanSilhouette
        position={[0, -2.0, 0]}
        scale={1.08}
        color="#2a2620"
        metalness={0.3}
        roughness={0.62}
      />

      {/* Automatically Universalized Architectural Ranks */}
      <instancedMesh
        ref={instancedRef}
        args={[humanGeo, undefined, crowdCoords.length]}
        castShadow={!isMobile}
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#24201a"
          roughness={0.72}
          metalness={0.24}
          emissive="#3a2f1e"
          emissiveIntensity={0.22}
        />
      </instancedMesh>

      <AtmosphericDust
        count={isMobile ? 60 : 130}
        spread={[10, 7, 10]}
        color="#e0c694"
        size={0.023}
        opacity={0.3}
        speed={0.07}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
