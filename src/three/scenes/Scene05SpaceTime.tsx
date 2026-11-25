import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

const GRID_DIV = 16;
const GRID_EXTENT = 8.4;

function buildGridPositions(curvedAmount: number): Float32Array {
  const segsPerLine = 32;
  const lineCount = (GRID_DIV + 1) * 2 * 2;
  const totalVerts = lineCount * segsPerLine * 2;
  const arr = new Float32Array(totalVerts * 3);
  let ptr = 0;

  const layers = [-1.85, 1.85];

  const transformPoint = (x: number, yBase: number, z: number): [number, number, number] => {
    const r2 = x * x + z * z;
    const bend = Math.exp(-r2 * 0.085) * 1.45 * (yBase < 0 ? -1 : 1) * curvedAmount;
    const radialPull = 1 - Math.exp(-r2 * 0.14) * 0.2 * curvedAmount;
    return [x * radialPull, yBase + bend, z * radialPull];
  };

  for (const yLayer of layers) {
    for (let i = 0; i <= GRID_DIV; i++) {
      const z = -GRID_EXTENT + (i / GRID_DIV) * (GRID_EXTENT * 2);
      for (let s = 0; s < segsPerLine; s++) {
        const x0 = -GRID_EXTENT + (s / segsPerLine) * (GRID_EXTENT * 2);
        const x1 = -GRID_EXTENT + ((s + 1) / segsPerLine) * (GRID_EXTENT * 2);
        const p0 = transformPoint(x0, yLayer, z);
        const p1 = transformPoint(x1, yLayer, z);
        arr[ptr++] = p0[0];
        arr[ptr++] = p0[1];
        arr[ptr++] = p0[2];
        arr[ptr++] = p1[0];
        arr[ptr++] = p1[1];
        arr[ptr++] = p1[2];
      }
    }
    for (let i = 0; i <= GRID_DIV; i++) {
      const x = -GRID_EXTENT + (i / GRID_DIV) * (GRID_EXTENT * 2);
      for (let s = 0; s < segsPerLine; s++) {
        const z0 = -GRID_EXTENT + (s / segsPerLine) * (GRID_EXTENT * 2);
        const z1 = -GRID_EXTENT + ((s + 1) / segsPerLine) * (GRID_EXTENT * 2);
        const p0 = transformPoint(x, yLayer, z0);
        const p1 = transformPoint(x, yLayer, z1);
        arr[ptr++] = p0[0];
        arr[ptr++] = p0[1];
        arr[ptr++] = p0[2];
        arr[ptr++] = p1[0];
        arr[ptr++] = p1[1];
        arr[ptr++] = p1[2];
      }
    }
  }

  return arr;
}

const EVENT_NODES: [number, number, number][] = [
  [-4.4, 0.85, -1.6],
  [-3.2, -0.38, -0.6],
  [-2.0, 0.62, 0.45],
  [-0.95, -0.35, 1.35],
  [0.2, 0.82, 1.55],
  [1.45, -0.25, 1.05],
  [2.6, 0.7, 0.15],
  [3.75, -0.45, -0.85],
  [4.8, 0.58, -1.8],
];

/**
 * SLIDE 05 — SPACE, TIME & CATEGORIES OF UNDERSTANDING ("Пространство и время")
 * Pre-directed 2.3s animation: flat grid bends smoothly around central luminous sphere
 * and causal tube illuminates across nodes, then settles completely still.
 */
export function Scene05SpaceTime({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const gridRef = useRef<THREE.LineSegments>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const causalTubeMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const flatPositions = useMemo(() => buildGridPositions(0), []);
  const curvedPositions = useMemo(() => buildGridPositions(1), []);
  const activePositions = useMemo(() => new Float32Array(curvedPositions), [curvedPositions]);

  const causalTubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      EVENT_NODES.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    );
    return new THREE.TubeGeometry(curve, 96, 0.022, 8, false);
  }, []);

  useEffect(() => {
    return () => causalTubeGeo.dispose();
  }, [causalTubeGeo]);

  useEffect(() => {
    const lookTarget = new THREE.Vector3(0, 0, 0);
    const camEnd = { x: 0.35, y: 0.85, z: 6.45 };
    const morphState = { t: 0 };

    const applyMorph = (t: number) => {
      if (!gridRef.current) return;
      const posAttr = gridRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        arr[i] = flatPositions[i] + (curvedPositions[i] - flatPositions[i]) * t;
      }
      posAttr.needsUpdate = true;
    };

    if (reducedMotion) {
      applyMorph(1);
      camera.position.set(camEnd.x, camEnd.y, camEnd.z);
      camera.lookAt(lookTarget);
      if (causalTubeMatRef.current) causalTubeMatRef.current.opacity = 0.88;
      if (haloRef.current) haloRef.current.rotation.set(Math.PI / 2 + 0.12, 0, 0.5);
      return;
    }

    applyMorph(0);
    camera.position.set(0, 2.25, 9.4);
    camera.lookAt(lookTarget);
    if (causalTubeMatRef.current) causalTubeMatRef.current.opacity = 0;
    if (haloRef.current) haloRef.current.rotation.set(Math.PI / 2, 0, 0);

    const tl = gsap.timeline();

    tl.to(
      camera.position,
      {
        x: camEnd.x,
        y: camEnd.y,
        z: camEnd.z,
        duration: 2.2,
        ease: 'power3.out',
        onUpdate: () => camera.lookAt(lookTarget),
      },
      0
    )
      .to(
        morphState,
        {
          t: 1,
          duration: 1.8,
          ease: 'power2.inOut',
          onUpdate: () => applyMorph(morphState.t),
        },
        0.25
      )
      .to(
        haloRef.current!.rotation,
        { x: Math.PI / 2 + 0.12, z: 0.55, duration: 2.1, ease: 'power2.out' },
        0.15
      )
      .to(
        causalTubeMatRef.current!,
        { opacity: 0.88, duration: 1.15, ease: 'power2.out' },
        1.15
      );

    return () => {
      tl.kill();
    };
  }, [camera, flatPositions, curvedPositions, replayNonce, reducedMotion]);

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 6.5, 19]} />

      <ambientLight intensity={0.2} color="#d6c8b0" />
      <pointLight position={[0, 0, 0]} intensity={24} distance={15} decay={1.6} color="#ebd5a7" />
      <directionalLight position={[4, 6, 4]} intensity={0.9} color="#eae4d8" />

      {/* 3D Transcendental Space-Time Grid */}
      <lineSegments ref={gridRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={activePositions.length / 3}
            array={activePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#B79B68" transparent opacity={0.34} />
      </lineSegments>

      {/* Central Luminous Sphere */}
      <group>
        <mesh>
          <sphereGeometry args={[0.92, 48, 48]} />
          <meshStandardMaterial
            color="#f0e8d8"
            emissive="#c9ab74"
            emissiveIntensity={0.62}
            roughness={0.28}
            metalness={0.18}
          />
        </mesh>

        <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.38, 0.012, 12, 80]} />
          <meshStandardMaterial
            color="#B79B68"
            emissive="#B79B68"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Categories of Understanding: Event Nodes Connected by Causality */}
      <group>
        {EVENT_NODES.map((pos, idx) => (
          <group key={idx} position={pos}>
            <mesh>
              <octahedronGeometry args={[0.13, 0]} />
              <meshStandardMaterial
                color="#EAE4D8"
                emissive="#B79B68"
                emissiveIntensity={0.95}
                roughness={0.35}
                metalness={0.4}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, 0.225, 24]} />
              <meshBasicMaterial color="#B79B68" side={THREE.DoubleSide} transparent opacity={0.65} />
            </mesh>
          </group>
        ))}

        <mesh geometry={causalTubeGeo}>
          <meshStandardMaterial
            ref={causalTubeMatRef}
            color="#e5c88e"
            emissive="#B79B68"
            emissiveIntensity={1.15}
            transparent
            opacity={0.88}
            roughness={0.3}
          />
        </mesh>
      </group>

      <AtmosphericDust
        count={isMobile ? 60 : 130}
        spread={[15, 7, 12]}
        color="#d4be92"
        size={0.023}
        opacity={0.28}
        speed={0.07}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
