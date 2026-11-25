import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  getClockFaceTexture,
  getCobblestoneTextures,
  getStoneTextures,
} from '../proceduralTextures';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

interface BuildingSpec {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  roofH: number;
  windows: Array<[number, number]>;
}

const KONIGSBERG_BUILDINGS: BuildingSpec[] = [
  { x: -4.4, z: -2.0, w: 2.2, h: 4.4, d: 2.6, roofH: 1.7, windows: [[-0.5, 0.9], [0.45, 2.2]] },
  { x: -4.6, z: -5.0, w: 2.5, h: 5.2, d: 2.8, roofH: 2.1, windows: [[-0.55, 1.1], [0, 2.7]] },
  { x: -4.3, z: -8.2, w: 2.3, h: 4.1, d: 2.6, roofH: 1.6, windows: [[-0.4, 1.2], [0.4, 2.2]] },
  { x: -4.5, z: -11.4, w: 2.6, h: 5.8, d: 2.9, roofH: 2.3, windows: [[0, 1.8], [0.55, 3.2]] },
  { x: 4.2, z: -2.2, w: 2.3, h: 4.8, d: 2.6, roofH: 1.9, windows: [[-0.5, 1.0], [0.5, 1.0], [-0.5, 2.5]] },
  { x: 4.5, z: -5.4, w: 2.6, h: 5.6, d: 2.8, roofH: 2.2, windows: [[-0.6, 1.4], [0.5, 1.4], [0.5, 2.9]] },
  { x: 4.1, z: -8.6, w: 2.2, h: 4.3, d: 2.6, roofH: 1.7, windows: [[-0.45, 1.5], [0.45, 2.5]] },
  { x: 4.4, z: -11.8, w: 2.8, h: 6.1, d: 3.0, roofH: 2.4, windows: [[0, 2.0], [0, 3.6]] },
];

export function Scene02Konigsberg({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const minuteHandRef = useRef<THREE.Mesh>(null);
  const hourHandRef = useRef<THREE.Mesh>(null);
  const pendulumRef = useRef<THREE.Group>(null);

  const cobbleTex = useMemo(() => getCobblestoneTextures(), []);
  const stoneTex = useMemo(() => getStoneTextures(), []);
  const clockTex = useMemo(() => getClockFaceTexture(), []);

  // Pre-directed 2.2s entrance: camera moves toward Königsberg & antique clock; hands tick briefly then freeze cleanly
  useEffect(() => {
    const targetLook = new THREE.Vector3(0.55, 0.35, -3.5);
    const camEnd = { x: 0.0, y: 0.52, z: 3.7 };

    if (reducedMotion) {
      camera.position.set(camEnd.x, camEnd.y, camEnd.z);
      camera.lookAt(targetLook);
      if (minuteHandRef.current) minuteHandRef.current.rotation.z = Math.PI * 0.25;
      if (hourHandRef.current) hourHandRef.current.rotation.z = -Math.PI * 0.62;
      if (pendulumRef.current) pendulumRef.current.rotation.z = 0;
      return;
    }

    camera.position.set(-0.35, 0.72, 6.1);
    camera.lookAt(targetLook);
    if (minuteHandRef.current) minuteHandRef.current.rotation.z = Math.PI * 0.95;
    if (hourHandRef.current) hourHandRef.current.rotation.z = -Math.PI * 0.56;
    if (pendulumRef.current) pendulumRef.current.rotation.z = 0.14;

    const tl = gsap.timeline();
    tl.to(
      camera.position,
      {
        x: camEnd.x,
        y: camEnd.y,
        z: camEnd.z,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate: () => camera.lookAt(targetLook),
      },
      0
    )
      .to(
        minuteHandRef.current!.rotation,
        {
          z: Math.PI * 0.25,
          duration: 1.9,
          ease: 'power3.out',
        },
        0.15
      )
      .to(
        hourHandRef.current!.rotation,
        {
          z: -Math.PI * 0.62,
          duration: 1.9,
          ease: 'power3.out',
        },
        0.15
      )
      .to(
        pendulumRef.current!.rotation,
        {
          z: -0.12,
          duration: 0.6,
          ease: 'sine.inOut',
        },
        0.1
      )
      .to(
        pendulumRef.current!.rotation,
        {
          z: 0.06,
          duration: 0.6,
          ease: 'sine.inOut',
        },
        0.7
      )
      .to(
        pendulumRef.current!.rotation,
        {
          z: 0,
          duration: 0.7,
          ease: 'power2.out',
        },
        1.3
      );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion]);

  const lanterns: [number, number, number][] = [
    [-2.5, 0.4, -0.8],
    [2.5, 0.4, -3.4],
    [-2.5, 0.4, -6.4],
    [2.5, 0.4, -9.2],
  ];

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fogExp2 attach="fog" args={['#0e0d0b', 0.095]} />

      <ambientLight intensity={0.18} color="#9e927f" />
      <directionalLight
        position={[4, 7, 5]}
        intensity={1.4}
        color="#d7be92"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight position={[-2.4, 1.5, -0.8]} intensity={3.2} distance={6.5} color="#c2924c" />
      <pointLight position={[2.4, 1.5, -3.4]} intensity={4.0} distance={7} color="#d9a156" />
      <pointLight position={[1.55, 0.9, 0.95]} intensity={5.6} distance={6.5} color="#f0d39d" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -5]} receiveShadow>
        <planeGeometry args={[12, 24]} />
        <meshStandardMaterial
          map={cobbleTex.map}
          bumpMap={cobbleTex.bumpMap}
          bumpScale={0.08}
          roughness={0.76}
          metalness={0.14}
          color="#5c574f"
        />
      </mesh>

      {KONIGSBERG_BUILDINGS.map((b, i) => (
        <group key={i} position={[b.x, -1.6, b.z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial map={stoneTex.map} color="#191714" roughness={0.92} metalness={0.05} />
          </mesh>
          <mesh position={[0, b.h + b.roofH / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[Math.max(b.w, b.d) * 0.72, b.roofH, 4]} />
            <meshStandardMaterial color="#12110f" roughness={0.95} />
          </mesh>
          {b.windows.map(([wx, wy], wi) => {
            const sideSign = b.x < 0 ? 1 : -1;
            return (
              <mesh
                key={wi}
                position={[sideSign * (b.w / 2 + 0.015), wy, wx]}
                rotation={[0, sideSign > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
              >
                <planeGeometry args={[0.3, 0.52]} />
                <meshBasicMaterial color={b.x < 0 ? '#5c4627' : wi % 2 === 0 ? '#d8a65a' : '#a87d43'} />
              </mesh>
            );
          })}
        </group>
      ))}

      <group position={[0, -1.6, -14.2]}>
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[2.2, 8.4, 2.2]} />
          <meshStandardMaterial color="#131210" roughness={0.95} />
        </mesh>
        <mesh position={[0, 10.1, 0]}>
          <coneGeometry args={[1.35, 3.6, 4]} />
          <meshStandardMaterial color="#100f0d" roughness={0.95} />
        </mesh>
      </group>

      {lanterns.map(([lx, , lz], i) => (
        <group key={i} position={[lx, -1.6, lz]}>
          <mesh position={[0, 1.35, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 2.7, 8]} />
            <meshStandardMaterial color="#1d1a16" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.75, 0]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshBasicMaterial color={lx < 0 ? '#b8945c' : '#e8be76'} />
          </mesh>
        </group>
      ))}

      {/* Monumental Antique Bronze & Ivory Clock */}
      <group position={[1.55, 0.4, -0.35]} rotation={[0, -0.22, 0]}>
        <mesh castShadow>
          <torusGeometry args={[1.42, 0.11, 20, 64]} />
          <meshStandardMaterial color="#8b734b" metalness={0.78} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[1.28, 0.028, 12, 64]} />
          <meshStandardMaterial color="#B79B68" metalness={0.84} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[1.36, 64]} />
          <meshStandardMaterial map={clockTex} roughness={0.55} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.42, 1.46, 0.22, 48]} />
          <meshStandardMaterial color="#1b1814" metalness={0.55} roughness={0.62} />
        </mesh>

        <mesh ref={hourHandRef} position={[0, 0, 0.04]} rotation={[0, 0, -Math.PI * 0.62]}>
          <boxGeometry args={[0.055, 0.72, 0.022]} />
          <meshStandardMaterial color="#EAE4D8" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh ref={minuteHandRef} position={[0, 0, 0.065]} rotation={[0, 0, Math.PI * 0.25]}>
          <boxGeometry args={[0.034, 1.06, 0.022]} />
          <meshStandardMaterial color="#d4bc8c" metalness={0.65} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 20]} />
          <meshStandardMaterial color="#B79B68" metalness={0.85} roughness={0.22} />
        </mesh>

        <group ref={pendulumRef} position={[0, -1.36, -0.06]}>
          <mesh position={[0, -0.65, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.3, 8]} />
            <meshStandardMaterial color="#9e8559" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -1.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.06, 28]} />
            <meshStandardMaterial color="#B79B68" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      </group>

      <AtmosphericDust
        count={isMobile ? 55 : 110}
        spread={[11, 5.5, 14]}
        color="#c8b087"
        size={0.024}
        opacity={0.24}
        speed={0.07}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
