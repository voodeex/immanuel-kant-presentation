import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { AtmosphericDust } from '../AtmosphericDust';
import type { SceneProps } from './Scene01Philosopher';

/**
 * SLIDE 04 — CRITIQUE OF PURE REASON ("Что мы можем знать?")
 * Immense three-dimensional mathematical space symbolizing synthetic a priori knowledge
 * (e.g. mathematics) and the question of whether metaphysics can stand as a science.
 */
export function Scene04PureReason({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const polyGroupRef = useRef<THREE.Group>(null);
  const planesGroupRef = useRef<THREE.Group>(null);

  // Architectural 3D Euclidean lattice lines receding into deep perspective
  const latticeGeometry = useMemo(() => {
    const verts: number[] = [];
    const extent = 12;
    const step = 2.0;

    // Floor & ceiling coordinate planes
    for (const y of [-3.0, 3.0]) {
      for (let x = -extent; x <= extent; x += step) {
        verts.push(x, y, 4, x, y, -22);
      }
      for (let z = 4; z >= -22; z -= step) {
        verts.push(-extent, y, z, extent, y, z);
      }
    }

    // Vertical plumb lines connecting upper and lower mathematical strata
    for (let x = -8; x <= 8; x += 4) {
      for (let z = -2; z >= -18; z -= 4) {
        verts.push(x, -3.0, z, x, 3.0, z);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => latticeGeometry.dispose();
  }, [latticeGeometry]);

  // Pre-directed 2.0s entrance: glide through mathematical corridor -> geometry aligns -> settles completely still
  useEffect(() => {
    const lookTarget = new THREE.Vector3(0.4, 0.05, -5.0);
    const camEnd = { x: -0.35, y: 0.45, z: 5.8 };

    if (reducedMotion) {
      camera.position.set(camEnd.x, camEnd.y, camEnd.z);
      camera.lookAt(lookTarget);
      if (polyGroupRef.current) {
        polyGroupRef.current.rotation.set(0.22, 0.55, 0.08);
        polyGroupRef.current.scale.set(1, 1, 1);
      }
      if (planesGroupRef.current) planesGroupRef.current.rotation.z = 0;
      return;
    }

    camera.position.set(-0.9, 1.15, 9.4);
    camera.lookAt(lookTarget);
    if (polyGroupRef.current) {
      polyGroupRef.current.rotation.set(-0.25, -0.5, -0.15);
      polyGroupRef.current.scale.set(0.75, 0.75, 0.75);
    }
    if (planesGroupRef.current) planesGroupRef.current.rotation.z = -0.14;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(
      camera.position,
      {
        x: camEnd.x,
        y: camEnd.y,
        z: camEnd.z,
        duration: 2.05,
        onUpdate: () => camera.lookAt(lookTarget),
      },
      0
    )
      .to(
        polyGroupRef.current!.rotation,
        { x: 0.22, y: 0.55, z: 0.08, duration: 2.15 },
        0.05
      )
      .to(
        polyGroupRef.current!.scale,
        { x: 1, y: 1, z: 1, duration: 1.8 },
        0.05
      )
      .to(
        planesGroupRef.current!.rotation,
        { z: 0, duration: 2.0 },
        0
      );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion]);

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 7, 25]} />

      <ambientLight intensity={0.22} color="#d6cab4" />
      <directionalLight position={[4, 6, 6]} intensity={1.35} color="#f0dfc1" />
      <pointLight position={[1.4, 0.2, -2.5]} intensity={24} distance={16} color="#dfc28b" />

      {/* Soaring 3D Euclidean Mathematical Lattice */}
      <group ref={planesGroupRef}>
        <lineSegments geometry={latticeGeometry}>
          <lineBasicMaterial color="#B79B68" transparent opacity={0.24} />
        </lineSegments>
      </group>

      {/* Monumental Nested Euclidean Geometry (Synthetic A Priori Structure) */}
      <group ref={polyGroupRef} position={[1.45, 0.05, -2.4]}>
        {/* Outer architectural bronze meridian rings */}
        <mesh rotation={[Math.PI / 2, 0.18, 0]}>
          <torusGeometry args={[2.35, 0.018, 14, 96]} />
          <meshStandardMaterial color="#B79B68" metalness={0.82} roughness={0.24} />
        </mesh>
        <mesh rotation={[0.35, 0.6, 0]}>
          <torusGeometry args={[2.0, 0.012, 12, 84]} />
          <meshStandardMaterial color="#EAE4D8" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Nested Platonic solids representing pure mathematical form */}
        <mesh>
          <octahedronGeometry args={[1.65, 0]} />
          <meshBasicMaterial color="#B79B68" wireframe transparent opacity={0.58} />
        </mesh>
        <mesh rotation={[0.4, 0.4, 0]}>
          <dodecahedronGeometry args={[1.08, 0]} />
          <meshStandardMaterial
            color="#e7decb"
            roughness={0.34}
            metalness={0.25}
            emissive="#5c4a2d"
            emissiveIntensity={0.22}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.38, 0]} />
          <meshBasicMaterial color="#EAE4D8" wireframe transparent opacity={0.22} />
        </mesh>
      </group>

      {/* Receding architectural proportion frames */}
      {[-6, -11, -16].map((z, idx) => (
        <mesh key={idx} position={[1.45, 0.05, z]}>
          <ringGeometry args={[2.6 + idx * 0.55, 2.63 + idx * 0.55, 4]} />
          <meshBasicMaterial
            color="#B79B68"
            side={THREE.DoubleSide}
            transparent
            opacity={0.28 - idx * 0.07}
          />
        </mesh>
      ))}

      <AtmosphericDust
        count={isMobile ? 60 : 130}
        spread={[15, 7, 16]}
        color="#d9c39a"
        size={0.022}
        opacity={0.3}
        speed={0.06}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
