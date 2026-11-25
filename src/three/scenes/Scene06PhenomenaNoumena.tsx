import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { createNoumenonVeilMaterial } from '../shaders';
import { getStoneTextures } from '../proceduralTextures';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

/**
 * SLIDE 06 — PHENOMENA AND NOUMENA ("Явление и вещь в себе")
 * Pre-directed 2.3s cinematic entrance: the illuminated Phenomenon dodecahedron
 * executes a graceful revealing turn while the veiled Thing in Itself behind the
 * translucent boundary remains dark and impenetrable; settles completely still.
 */
export function Scene06PhenomenaNoumena({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const phenomenonRef = useRef<THREE.Group>(null);
  const noumenonRef = useRef<THREE.Group>(null);
  const veilMat = useMemo(() => createNoumenonVeilMaterial(), []);
  const stoneTex = useMemo(() => getStoneTextures(), []);

  useEffect(() => {
    return () => {
      veilMat.dispose();
    };
  }, [veilMat]);

  useEffect(() => {
    const lookTarget = new THREE.Vector3(0, 0.1, 0);
    const camEnd = { x: 0.15, y: 0.2, z: 6.25 };

    if (reducedMotion) {
      camera.position.set(camEnd.x, camEnd.y, camEnd.z);
      camera.lookAt(lookTarget);
      if (phenomenonRef.current) phenomenonRef.current.rotation.set(0.18, 0.42, 0);
      if (noumenonRef.current) noumenonRef.current.rotation.set(0.08, 0.25, 0);
      veilMat.uniforms.uReveal.value = 1;
      return;
    }

    camera.position.set(0.65, 0.45, 7.6);
    camera.lookAt(lookTarget);
    if (phenomenonRef.current) phenomenonRef.current.rotation.set(-0.22, -0.55, 0);
    if (noumenonRef.current) noumenonRef.current.rotation.set(0, 0, 0);
    veilMat.uniforms.uReveal.value = 0;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(
      camera.position,
      {
        x: camEnd.x,
        y: camEnd.y,
        z: camEnd.z,
        duration: 2.15,
        onUpdate: () => camera.lookAt(lookTarget),
      },
      0
    )
      .to(veilMat.uniforms.uReveal, { value: 1, duration: 1.5, ease: 'power2.out' }, 0.25)
      .to(
        phenomenonRef.current!.rotation,
        { x: 0.18, y: 0.42, duration: 2.35, ease: 'power2.out' },
        0.1
      )
      .to(
        noumenonRef.current!.rotation,
        { x: 0.08, y: 0.25, duration: 2.2, ease: 'power2.out' },
        0.1
      );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion, veilMat]);

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 6.5, 17]} />

      <ambientLight intensity={0.1} color="#cfc3ae" />

      <spotLight
        position={[-3.8, 3.8, 4.2]}
        angle={0.5}
        penumbra={0.85}
        intensity={48}
        distance={16}
        color="#f0dcc0"
        castShadow
      />
      <pointLight position={[-1.8, 0.3, 2.2]} intensity={9} distance={7} color="#d6b984" />
      <pointLight position={[2.6, -0.4, -2.2]} intensity={4.5} distance={8} color="#4A2427" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.85, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial map={stoneTex.map} color="#100f0d" roughness={0.85} />
      </mesh>

      {/* ACCESSIBLE SIDE: ЯВЛЕНИЕ */}
      <group ref={phenomenonRef} position={[-1.65, 0.22, 0.72]}>
        <mesh castShadow>
          <dodecahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial
            color="#e5dccb"
            roughness={0.34}
            metalness={0.28}
            emissive="#635133"
            emissiveIntensity={0.24}
          />
        </mesh>
        <mesh scale={1.24}>
          <icosahedronGeometry args={[1.0, 0]} />
          <meshBasicMaterial color="#B79B68" wireframe transparent opacity={0.48} />
        </mesh>
        <mesh rotation={[0.5, 0.2, 0]}>
          <torusGeometry args={[1.52, 0.013, 12, 84]} />
          <meshStandardMaterial color="#B79B68" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2.3, -0.4, 0]}>
          <torusGeometry args={[1.3, 0.01, 12, 72]} />
          <meshStandardMaterial color="#EAE4D8" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* EPISTEMIC BOUNDARY PLANE */}
      <group position={[0.15, 0.1, 0]} rotation={[0, -0.24, 0]}>
        <mesh material={veilMat}>
          <planeGeometry args={[5.4, 5.4, 1, 1]} />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[5.42, 0.022, 0.022]} />
          <meshStandardMaterial color="#B79B68" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -2.7, 0]}>
          <boxGeometry args={[5.42, 0.022, 0.022]} />
          <meshStandardMaterial color="#B79B68" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-2.7, 0, 0]}>
          <boxGeometry args={[0.022, 5.42, 0.022]} />
          <meshStandardMaterial color="#B79B68" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[2.7, 0, 0]}>
          <boxGeometry args={[0.022, 5.42, 0.022]} />
          <meshStandardMaterial color="#B79B68" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* INACCESSIBLE REGION: ВЕЩЬ В СЕБЕ */}
      <group ref={noumenonRef} position={[1.95, 0.2, -1.25]}>
        <mesh>
          <icosahedronGeometry args={[1.26, 2]} />
          <meshStandardMaterial
            color="#070706"
            roughness={0.96}
            metalness={0.08}
            emissive="#1a1112"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh scale={1.38}>
          <dodecahedronGeometry args={[1.02, 0]} />
          <meshBasicMaterial color="#4A2427" wireframe transparent opacity={0.38} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.35, 0]}>
          <torusGeometry args={[1.72, 0.008, 10, 72]} />
          <meshBasicMaterial color="#77736C" transparent opacity={0.28} />
        </mesh>
      </group>

      <AtmosphericDust
        count={isMobile ? 60 : 120}
        spread={[11, 6, 8]}
        color="#d9c39a"
        size={0.022}
        opacity={0.28}
        speed={0.06}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
