import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { HumanSilhouette } from '../HumanSilhouette';
import { getStoneTextures } from '../proceduralTextures';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

/**
 * SLIDE 09 — FREEDOM AND MORAL DUTY ("Свобода и нравственный долг")
 * Pre-directed 2.3s choreography: rigid bronze mechanical causality rings
 * expand outward into the exterior perimeter while a balanced golden colonnade
 * rises around the central human silhouette, then settles completely still.
 */
export function Scene09FreedomDuty({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const mechCageRef = useRef<THREE.Group>(null);
  const archSanctumRef = useRef<THREE.Group>(null);
  const gearARef = useRef<THREE.Group>(null);
  const gearBRef = useRef<THREE.Group>(null);
  const stoneTex = useMemo(() => getStoneTextures(), []);

  const sanctumColumns = useMemo(() => {
    const count = 8;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        angle,
        x: Math.cos(angle) * 2.55,
        z: Math.sin(angle) * 2.55,
      };
    });
  }, []);

  const gearTeeth = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
  }, []);

  useEffect(() => {
    const lookTarget = new THREE.Vector3(0, 0.15, 0);

    if (reducedMotion) {
      camera.position.set(0.15, 0.72, 7.35);
      camera.lookAt(lookTarget);
      if (mechCageRef.current) mechCageRef.current.scale.set(1.92, 1.92, 1.92);
      if (archSanctumRef.current) archSanctumRef.current.scale.set(1, 1, 1);
      if (gearARef.current) gearARef.current.rotation.z = 0.45;
      if (gearBRef.current) gearBRef.current.rotation.x = -0.35;
      return;
    }

    camera.position.set(0.5, 0.85, 6.2);
    camera.lookAt(lookTarget);
    if (mechCageRef.current) mechCageRef.current.scale.set(1.0, 1.0, 1.0);
    if (archSanctumRef.current) archSanctumRef.current.scale.set(1, 0.01, 1);
    if (gearARef.current) gearARef.current.rotation.z = 0;
    if (gearBRef.current) gearBRef.current.rotation.x = 0;

    const tl = gsap.timeline();

    tl.to(gearARef.current!.rotation, { z: 0.55, duration: 2.1, ease: 'power2.out' }, 0)
      .to(gearBRef.current!.rotation, { x: -0.4, duration: 2.1, ease: 'power2.out' }, 0)
      .to(
        mechCageRef.current!.scale,
        { x: 1.92, y: 1.92, z: 1.92, duration: 1.85, ease: 'power3.inOut' },
        0.4
      )
      .to(
        archSanctumRef.current!.scale,
        { y: 1.0, duration: 1.65, ease: 'power3.out' },
        0.65
      )
      .to(
        camera.position,
        {
          x: 0.15,
          y: 0.72,
          z: 7.35,
          duration: 2.1,
          ease: 'power2.out',
          onUpdate: () => camera.lookAt(lookTarget),
        },
        0.25
      );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion]);

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 7.5, 22]} />

      <ambientLight intensity={0.28} color="#d6cab4" />
      <spotLight
        position={[0, 8.2, 3.2]}
        angle={0.58}
        penumbra={0.82}
        intensity={96}
        distance={24}
        color="#f5dfb5"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 4, 4]} intensity={1.45} color="#c9b48d" />
      <directionalLight position={[5, 2, -2]} intensity={0.95} color="#a89370" />
      <pointLight position={[0, 1.4, 2.2]} intensity={14} distance={10} color="#e5c994" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial map={stoneTex.map} color="#141310" roughness={0.86} />
      </mesh>

      <HumanSilhouette
        position={[0, -2.0, 0]}
        scale={1.08}
        color="#2a2620"
        metalness={0.32}
        roughness={0.58}
      />

      {/* Exterior Natural Causality Mechanical Rings */}
      <group ref={mechCageRef} position={[0, -0.35, 0]}>
        <group ref={gearARef}>
          <mesh>
            <torusGeometry args={[1.65, 0.06, 12, 64]} />
            <meshStandardMaterial color="#3c3730" metalness={0.72} roughness={0.42} />
          </mesh>
          {gearTeeth.map((ang, i) => (
            <mesh
              key={i}
              position={[Math.cos(ang) * 1.76, Math.sin(ang) * 1.76, 0]}
              rotation={[0, 0, ang]}
            >
              <boxGeometry args={[0.16, 0.075, 0.09]} />
              <meshStandardMaterial color="#4a443c" metalness={0.76} roughness={0.38} />
            </mesh>
          ))}
        </group>

        <group ref={gearBRef} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <torusGeometry args={[1.88, 0.05, 12, 64]} />
            <meshStandardMaterial color="#2e2a24" metalness={0.78} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.88, 0]}>
            <boxGeometry args={[0.08, 0.55, 0.08]} />
            <meshStandardMaterial color="#595248" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, -1.88, 0]}>
            <boxGeometry args={[0.08, 0.55, 0.08]} />
            <meshStandardMaterial color="#595248" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.1, 0.04, 12, 64]} />
          <meshStandardMaterial color="#4a443b" metalness={0.7} roughness={0.44} />
        </mesh>
      </group>

      {/* Balanced Interior Architectural Colonnade (Moral Autonomy) */}
      <group ref={archSanctumRef} position={[0, -2.0, 0]}>
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[2.85, 2.95, 0.1, 48]} />
          <meshStandardMaterial map={stoneTex.map} color="#1d1b17" roughness={0.82} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
          <ringGeometry args={[2.45, 2.52, 64]} />
          <meshBasicMaterial color="#B79B68" transparent opacity={0.75} />
        </mesh>

        {sanctumColumns.map((col, idx) => (
          <group key={idx} position={[col.x, 0, col.z]}>
            <mesh position={[0, 2.05, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.095, 0.115, 3.9, 16]} />
              <meshStandardMaterial
                map={stoneTex.map}
                color="#7c7467"
                roughness={0.62}
                metalness={0.18}
              />
            </mesh>
            <mesh position={[0, 4.02, 0]}>
              <boxGeometry args={[0.28, 0.1, 0.28]} />
              <meshStandardMaterial color="#B79B68" metalness={0.72} roughness={0.32} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 4.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.55, 0.065, 16, 64]} />
          <meshStandardMaterial color="#B79B68" metalness={0.8} roughness={0.28} />
        </mesh>
      </group>

      <AtmosphericDust
        count={isMobile ? 55 : 120}
        spread={[11, 7, 10]}
        color="#d8be90"
        size={0.022}
        opacity={0.28}
        speed={0.07}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
