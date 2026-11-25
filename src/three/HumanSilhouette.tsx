import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Shared sculptural human silhouette geometry (classical museum monolith figure)
 * Built with LatheGeometry + sculpted head/shoulders so it casts authentic shadows
 * and looks refined both solo and instanced in hundreds.
 */
export function createHumanFigureGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.24, 0.0),
    new THREE.Vector2(0.22, 0.06),
    new THREE.Vector2(0.16, 0.14),
    new THREE.Vector2(0.14, 0.52),
    new THREE.Vector2(0.155, 0.88),
    new THREE.Vector2(0.19, 1.18),
    new THREE.Vector2(0.245, 1.44), // Broad cloak / shoulders
    new THREE.Vector2(0.21, 1.54),
    new THREE.Vector2(0.095, 1.59), // Neck
    new THREE.Vector2(0.088, 1.66),
    new THREE.Vector2(0.135, 1.75), // Jaw / Head
    new THREE.Vector2(0.145, 1.86),
    new THREE.Vector2(0.115, 1.96),
    new THREE.Vector2(0.05, 2.02),
    new THREE.Vector2(0.0, 2.04),
  ];

  const geom = new THREE.LatheGeometry(points, 28);
  // Subtle anatomical flattening front-to-back so silhouette reads unmistakably human
  geom.scale(1.08, 1.0, 0.68);
  geom.computeVertexNormals();
  return geom;
}

interface HumanSilhouetteProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export function HumanSilhouette({
  position = [0, 0, 0],
  scale = 1,
  color = '#24211c',
  metalness = 0.25,
  roughness = 0.72,
  emissive = '#120f0a',
  emissiveIntensity = 0.2,
}: HumanSilhouetteProps) {
  const geometry = useMemo(() => createHumanFigureGeometry(), []);

  return (
    <mesh
      geometry={geometry}
      position={position}
      scale={scale}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}
