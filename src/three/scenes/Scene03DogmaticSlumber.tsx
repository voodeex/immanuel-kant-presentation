import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getStoneTextures } from '../proceduralTextures';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

interface MonolithBlock {
  id: number;
  size: [number, number, number];
  closedPos: [number, number, number];
  openPos: [number, number, number];
  openRot: [number, number, number];
}

const MONOLITH_BLOCKS: MonolithBlock[] = [
  { id: 0, size: [1.55, 1.65, 1.1], closedPos: [-0.8, 1.65, 0], openPos: [-2.75, 2.35, 0.45], openRot: [0.06, -0.22, 0.11] },
  { id: 1, size: [1.55, 1.65, 1.1], closedPos: [0.8, 1.65, 0], openPos: [2.85, 2.25, 0.3], openRot: [-0.05, 0.24, -0.09] },
  { id: 2, size: [1.55, 1.6, 1.1], closedPos: [-0.8, 0.0, 0], openPos: [-3.25, 0.12, 0.65], openRot: [0.02, -0.32, 0.05] },
  { id: 3, size: [1.55, 1.6, 1.1], closedPos: [0.8, 0.0, 0], openPos: [3.3, -0.1, 0.55], openRot: [-0.04, 0.28, -0.06] },
  { id: 4, size: [1.55, 1.65, 1.1], closedPos: [-0.8, -1.65, 0], openPos: [-2.65, -2.05, 0.25], openRot: [-0.05, -0.16, -0.07] },
  { id: 5, size: [1.55, 1.65, 1.1], closedPos: [0.8, -1.65, 0], openPos: [2.75, -2.1, 0.35], openRot: [0.04, 0.19, 0.08] },
];

export function Scene03DogmaticSlumber({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const blockRefs = useRef<(THREE.Mesh | null)[]>([]);
  const systemGroupRef = useRef<THREE.Group>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);

  const stoneTex = useMemo(() => getStoneTextures(), []);

  // Pre-directed 2.3s entrance: tremor -> monolith separates -> golden critical geometry emerges -> settles still
  useEffect(() => {
    const meshes = blockRefs.current.filter(Boolean) as THREE.Mesh[];
    const lookTarget = new THREE.Vector3(0, 0.08, -2.5);

    if (reducedMotion) {
      meshes.forEach((m, i) => {
        const b = MONOLITH_BLOCKS[i];
        m.position.set(b.openPos[0], b.openPos[1], b.openPos[2]);
        m.rotation.set(b.openRot[0], b.openRot[1], b.openRot[2]);
      });
      camera.position.set(0, 0.12, 5.2);
      camera.lookAt(lookTarget);
      if (innerLightRef.current) innerLightRef.current.intensity = 30;
      if (systemGroupRef.current) systemGroupRef.current.rotation.set(0.06, 0.45, 0);
      return;
    }

    meshes.forEach((m, i) => {
      const b = MONOLITH_BLOCKS[i];
      m.position.set(b.closedPos[0], b.closedPos[1], b.closedPos[2]);
      m.rotation.set(0, 0, 0);
    });
    camera.position.set(0, 0.2, 6.85);
    camera.lookAt(lookTarget);
    if (innerLightRef.current) innerLightRef.current.intensity = 2;
    if (systemGroupRef.current) systemGroupRef.current.rotation.set(0, -0.35, 0);

    const tl = gsap.timeline();

    // Brief tremor
    meshes.forEach((m, i) => {
      const b = MONOLITH_BLOCKS[i];
      tl.to(
        m.position,
        {
          x: b.closedPos[0] + (i % 2 === 0 ? -0.045 : 0.045),
          duration: 0.06,
          repeat: 3,
          yoyo: true,
          ease: 'sine.inOut',
        },
        0.18
      );
    });

    if (innerLightRef.current) {
      tl.to(innerLightRef.current, { intensity: 32, duration: 1.6, ease: 'power2.inOut' }, 0.45);
    }

    meshes.forEach((m, i) => {
      const b = MONOLITH_BLOCKS[i];
      tl.to(
        m.position,
        {
          x: b.openPos[0],
          y: b.openPos[1],
          z: b.openPos[2],
          duration: 1.65,
          ease: 'power3.inOut',
        },
        0.5 + i * 0.035
      );
      tl.to(
        m.rotation,
        {
          x: b.openRot[0],
          y: b.openRot[1],
          z: b.openRot[2],
          duration: 1.65,
          ease: 'power3.inOut',
        },
        0.5 + i * 0.035
      );
    });

    if (systemGroupRef.current) {
      tl.to(
        systemGroupRef.current.rotation,
        { x: 0.06, y: 0.45, duration: 1.9, ease: 'power2.out' },
        0.5
      );
    }

    tl.to(
      camera.position,
      {
        x: 0,
        y: 0.12,
        z: 5.2,
        duration: 1.9,
        ease: 'power2.out',
        onUpdate: () => camera.lookAt(lookTarget),
      },
      0.55
    );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion]);

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 7, 20]} />

      <ambientLight intensity={0.14} color="#b8ac98" />
      <directionalLight position={[4, 6, 5]} intensity={1.3} color="#e6d6bc" castShadow />
      <directionalLight position={[-5, -2, 3]} intensity={0.45} color="#7c7060" />

      <pointLight
        ref={innerLightRef}
        position={[0, 0.1, -2.2]}
        intensity={30}
        distance={14}
        decay={1.7}
        color="#d4b47a"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, -2]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial map={stoneTex.map} color="#12110f" roughness={0.88} />
      </mesh>
      <mesh position={[-7.5, 0, -4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial map={stoneTex.map} color="#100f0d" roughness={0.95} />
      </mesh>
      <mesh position={[7.5, 0, -4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial map={stoneTex.map} color="#100f0d" roughness={0.95} />
      </mesh>

      <group position={[0, 0.05, 0.2]}>
        {MONOLITH_BLOCKS.map((block, idx) => (
          <mesh
            key={block.id}
            ref={(el) => {
              blockRefs.current[idx] = el;
            }}
            position={block.openPos}
            castShadow
            receiveShadow
          >
            <boxGeometry args={block.size} />
            <meshStandardMaterial
              map={stoneTex.map}
              bumpMap={stoneTex.bumpMap}
              bumpScale={0.08}
              color="#2c2924"
              roughness={0.86}
              metalness={0.08}
            />
          </mesh>
        ))}
      </group>

      <group ref={systemGroupRef} position={[0, 0.1, -3.2]}>
        <mesh rotation={[0.4, 0.2, 0]}>
          <torusGeometry args={[2.15, 0.016, 12, 96]} />
          <meshStandardMaterial
            color="#B79B68"
            emissive="#B79B68"
            emissiveIntensity={0.65}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2 - 0.3, 0.5, 0]}>
          <torusGeometry args={[1.65, 0.014, 12, 96]} />
          <meshStandardMaterial
            color="#EAE4D8"
            emissive="#c9b289"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
        <mesh rotation={[0.9, -0.6, 0.4]}>
          <torusGeometry args={[1.15, 0.012, 12, 72]} />
          <meshStandardMaterial color="#B79B68" emissive="#B79B68" emissiveIntensity={0.85} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.92, 1]} />
          <meshBasicMaterial color="#d4bc8c" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color="#f5ecd8"
            emissive="#d6b479"
            emissiveIntensity={1.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      <AtmosphericDust
        count={isMobile ? 65 : 140}
        spread={[12, 7, 10]}
        color="#d7be8f"
        size={0.025}
        opacity={0.34}
        speed={0.08}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
