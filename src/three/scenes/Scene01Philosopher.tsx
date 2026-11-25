import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getMarbleTextures, getStoneTextures } from '../proceduralTextures';
import { createVolumetricBeamMaterial } from '../shaders';
import { AtmosphericDust } from '../AtmosphericDust';

export interface SceneProps {
  replayNonce: number;
  reducedMotion: boolean;
  isMobile: boolean;
}

interface BustMaps {
  colorMap: THREE.CanvasTexture;
  displacementMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  alphaMap: THREE.CanvasTexture;
}

// Module-level cache so returning to Slide 01 is instantaneous with zero reprocessing
let cachedBustMaps: BustMaps | null = null;
let bustLoadingPromise: Promise<BustMaps> | null = null;

function buildSculpturalMaps(img: HTMLImageElement): BustMaps {
  const w = 512;
  const h = 640;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext('2d')!;

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const targetAspect = w / h;
  let sx = 0,
    sy = 0,
    sw = img.naturalWidth,
    sh = img.naturalHeight;
  if (imgAspect > targetAspect) {
    sw = img.naturalHeight * targetAspect;
    sx = (img.naturalWidth - sw) * 0.5;
  } else {
    sh = img.naturalWidth / targetAspect;
    sy = (img.naturalHeight - sh) * 0.36;
  }
  srcCtx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  const px = srcCtx.getImageData(0, 0, w, h).data;

  const colCanvas = document.createElement('canvas');
  colCanvas.width = w;
  colCanvas.height = h;
  const colCtx = colCanvas.getContext('2d')!;
  const colImg = colCtx.createImageData(w, h);

  const dispCanvas = document.createElement('canvas');
  dispCanvas.width = w;
  dispCanvas.height = h;
  const dispCtx = dispCanvas.getContext('2d')!;
  const dispImg = dispCtx.createImageData(w, h);

  const alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = w;
  alphaCanvas.height = h;
  const alphaCtx = alphaCanvas.getContext('2d')!;
  const alphaImg = alphaCtx.createImageData(w, h);

  const heightBuf = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    const ny = (y / h) * 2 - 1;
    for (let x = 0; x < w; x++) {
      const nx = (x / w) * 2 - 1;
      const i = y * w + x;
      const idx = i * 4;

      const r = px[idx] / 255;
      const g = px[idx + 1] / 255;
      const b = px[idx + 2] / 255;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC > 0.001 ? (maxC - minC) / maxC : 0;

      const radial = Math.sqrt((nx * nx) / 0.82 + ((ny + 0.04) * (ny + 0.04)) / 0.92);
      const edgeMask = Math.max(0, Math.min(1, 1 - Math.max(0, (radial - 0.52) / 0.44)));
      const smoothEdge = edgeMask * edgeMask * (3 - 2 * edgeMask);

      const bgCut = Math.max(0, Math.min(1, (lum - 0.16) / 0.24));
      const marbleConfidence = Math.max(0.15, Math.min(1, bgCut * (1.15 - sat * 0.55)));
      const alpha = smoothEdge * (0.25 + 0.75 * marbleConfidence);

      const graded = Math.pow(lum, 0.94);
      colImg.data[idx] = Math.min(255, Math.round((graded * 238 + 10) * (0.7 + 0.3 * smoothEdge)));
      colImg.data[idx + 1] = Math.min(255, Math.round((graded * 228 + 8) * (0.7 + 0.3 * smoothEdge)));
      colImg.data[idx + 2] = Math.min(255, Math.round((graded * 212 + 6) * (0.7 + 0.3 * smoothEdge)));
      colImg.data[idx + 3] = 255;

      const dome = Math.max(0, 1 - radial * radial);
      heightBuf[i] = Math.max(0, Math.min(1, (graded * 0.65 + dome * 0.45) * alpha));

      const av = Math.round(Math.max(0, Math.min(1, smoothEdge * 1.15)) * 255);
      alphaImg.data[idx] = av;
      alphaImg.data[idx + 1] = av;
      alphaImg.data[idx + 2] = av;
      alphaImg.data[idx + 3] = 255;
    }
  }

  colCtx.putImageData(colImg, 0, 0);
  alphaCtx.putImageData(alphaImg, 0, 0);

  // Smooth height buffer to keep sculptural relief artifact-free
  const smoothHeight = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += heightBuf[(y + dy) * w + (x + dx)];
        }
      }
      smoothHeight[y * w + x] = sum / 9;
    }
  }

  for (let i = 0; i < w * h; i++) {
    const hv = Math.round(smoothHeight[i] * 255);
    const idx = i * 4;
    dispImg.data[idx] = hv;
    dispImg.data[idx + 1] = hv;
    dispImg.data[idx + 2] = hv;
    dispImg.data[idx + 3] = 255;
  }
  dispCtx.putImageData(dispImg, 0, 0);

  const normCanvas = document.createElement('canvas');
  normCanvas.width = w;
  normCanvas.height = h;
  const normCtx = normCanvas.getContext('2d')!;
  const normImg = normCtx.createImageData(w, h);
  const strength = 3.2;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = smoothHeight[(y - 1) * w + (x - 1)];
      const t = smoothHeight[(y - 1) * w + x];
      const tr = smoothHeight[(y - 1) * w + (x + 1)];
      const l = smoothHeight[y * w + (x - 1)];
      const r = smoothHeight[y * w + (x + 1)];
      const bl = smoothHeight[(y + 1) * w + (x - 1)];
      const b = smoothHeight[(y + 1) * w + x];
      const br = smoothHeight[(y + 1) * w + (x + 1)];

      const dx = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dy = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;
      const dz = 1.0;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const idx = (y * w + x) * 4;
      normImg.data[idx] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      normImg.data[idx + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      normImg.data[idx + 2] = Math.round(((dz / len) * 0.5 + 0.5) * 255);
      normImg.data[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normImg, 0, 0);

  const colorMap = new THREE.CanvasTexture(colCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 8;

  return {
    colorMap,
    displacementMap: new THREE.CanvasTexture(dispCanvas),
    normalMap: new THREE.CanvasTexture(normCanvas),
    alphaMap: new THREE.CanvasTexture(alphaCanvas),
  };
}

export function preloadKantBust(): Promise<BustMaps> {
  if (cachedBustMaps) return Promise.resolve(cachedBustMaps);
  if (bustLoadingPromise) return bustLoadingPromise;

  bustLoadingPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `${import.meta.env.BASE_URL}assets/kant-bust-hagemann-1801.jpg`;
    img.onload = () => {
      cachedBustMaps = buildSculpturalMaps(img);
      resolve(cachedBustMaps);
    };
  });
  return bustLoadingPromise;
}

export function Scene01Philosopher({ replayNonce, reducedMotion, isMobile }: SceneProps) {
  const { camera } = useThree();
  const bustGroupRef = useRef<THREE.Group>(null);
  const keyLightRef = useRef<THREE.SpotLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const beamMat = useMemo(() => createVolumetricBeamMaterial('#e0c794', 0.15), []);
  const marbleTex = useMemo(() => getMarbleTextures(), []);
  const stoneTex = useMemo(() => getStoneTextures(), []);
  const [bustMaps, setBustMaps] = useState<BustMaps | null>(cachedBustMaps);

  useEffect(() => {
    let mounted = true;
    if (!cachedBustMaps) {
      preloadKantBust().then((maps) => {
        if (mounted) setBustMaps(maps);
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      beamMat.dispose();
    };
  }, [beamMat]);

  const steleGeometry = useMemo(() => {
    const segs = isMobile ? 64 : 128;
    const geo = new THREE.PlaneGeometry(3.2, 4.1, segs, segs);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const curveZ = -0.32 * (x * x) * 0.28 - 0.04 * (y * y) * 0.15;
      pos.setZ(i, curveZ);
    }
    geo.computeVertexNormals();
    return geo;
  }, [isMobile]);

  useEffect(() => {
    return () => steleGeometry.dispose();
  }, [steleGeometry]);

  // Pre-directed 2.2s entrance: darkness -> warm spotlight sweeps across sculpture -> settles completely still
  useEffect(() => {
    const camStart = { x: 0.55, y: 0.34, z: 7.55 };
    const camEnd = { x: 0.25, y: 0.18, z: 6.2 };

    if (reducedMotion) {
      camera.position.set(camEnd.x, camEnd.y, camEnd.z);
      camera.lookAt(0.48, 0.12, 0);
      if (keyLightRef.current) {
        keyLightRef.current.position.set(3.4, 4.6, 5.2);
        keyLightRef.current.intensity = 62;
      }
      if (rimLightRef.current) rimLightRef.current.intensity = 0.48;
      if (bustGroupRef.current) bustGroupRef.current.rotation.set(0, -0.1, 0);
      beamMat.uniforms.uOpacity.value = 0.14;
      return;
    }

    camera.position.set(camStart.x, camStart.y, camStart.z);
    camera.lookAt(0.48, 0.12, 0);
    if (keyLightRef.current) {
      keyLightRef.current.position.set(5.2, 5.4, 4.0);
      keyLightRef.current.intensity = 0;
    }
    if (rimLightRef.current) rimLightRef.current.intensity = 0;
    if (bustGroupRef.current) bustGroupRef.current.rotation.set(0, -0.22, 0);
    beamMat.uniforms.uOpacity.value = 0;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(keyLightRef.current!, { intensity: 64, duration: 1.9, ease: 'power2.inOut' }, 0.1)
      .to(keyLightRef.current!.position, { x: 3.4, y: 4.6, z: 5.2, duration: 2.2, ease: 'power2.out' }, 0.1)
      .to(beamMat.uniforms.uOpacity, { value: 0.15, duration: 1.8 }, 0.15)
      .to(rimLightRef.current!, { intensity: 0.48, duration: 1.6 }, 0.45)
      .to(bustGroupRef.current!.rotation, { y: -0.1, duration: 2.2, ease: 'power2.out' }, 0)
      .to(
        camera.position,
        {
          x: camEnd.x,
          y: camEnd.y,
          z: camEnd.z,
          duration: 2.3,
          ease: 'power2.out',
          onUpdate: () => camera.lookAt(0.48, 0.12, 0),
        },
        0
      );

    return () => {
      tl.kill();
    };
  }, [camera, replayNonce, reducedMotion, beamMat]);

  // Subtle volumetric light shimmer only — zero mouse tracking or camera drift
  useFrame((state) => {
    beamMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const columnPositions: [number, number, number][] = [
    [-4.8, 0, -4.4],
    [-2.4, 0, -5.2],
    [2.8, 0, -5.0],
    [5.4, 0, -4.2],
  ];

  return (
    <group>
      <color attach="background" args={['#0B0B0A']} />
      <fog attach="fog" args={['#0B0B0A', 6.5, 16.5]} />

      <ambientLight intensity={0.14} color="#d8ccb8" />

      <spotLight
        ref={keyLightRef}
        position={[3.4, 4.6, 5.2]}
        angle={0.46}
        penumbra={0.9}
        intensity={64}
        distance={18}
        decay={1.7}
        color="#f2dfc4"
      />

      <directionalLight
        ref={rimLightRef}
        position={[-3.2, 2.2, 2.5]}
        intensity={0.48}
        color="#9c8b6e"
      />

      <mesh position={[2.0, 2.0, 1.4]} rotation={[0.26, 0.18, 0.42]} material={beamMat}>
        <coneGeometry args={[2.15, 7.2, 32, 1, true]} />
      </mesh>

      <group ref={bustGroupRef} position={[1.48, -0.32, 0.15]}>
        <mesh geometry={steleGeometry} position={[0, 0.48, 0.14]}>
          {bustMaps ? (
            <meshStandardMaterial
              map={bustMaps.colorMap}
              displacementMap={bustMaps.displacementMap}
              displacementScale={0.34}
              normalMap={bustMaps.normalMap}
              normalScale={new THREE.Vector2(1.15, 1.15)}
              alphaMap={bustMaps.alphaMap}
              transparent
              roughness={0.6}
              metalness={0.05}
            />
          ) : (
            <meshStandardMaterial
              map={marbleTex.map}
              bumpMap={marbleTex.bumpMap}
              bumpScale={0.05}
              color="#ded6c7"
              roughness={0.62}
              metalness={0.05}
            />
          )}
        </mesh>

        <mesh position={[0, 0.48, -0.26]} receiveShadow>
          <boxGeometry args={[2.95, 4.15, 0.26]} />
          <meshStandardMaterial
            map={stoneTex.map}
            bumpMap={stoneTex.bumpMap}
            bumpScale={0.03}
            color="#151412"
            roughness={0.86}
            metalness={0.12}
          />
        </mesh>

        <group position={[0, -2.15, -0.02]}>
          <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.15, 0.16, 1.15]} />
            <meshStandardMaterial
              map={marbleTex.map}
              bumpMap={marbleTex.bumpMap}
              bumpScale={0.03}
              color="#7a746a"
              roughness={0.65}
              metalness={0.08}
            />
          </mesh>
          <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.82, 1.58, 0.92]} />
            <meshStandardMaterial
              map={stoneTex.map}
              bumpMap={stoneTex.bumpMap}
              bumpScale={0.04}
              color="#22201c"
              roughness={0.82}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.48, 0.47]}>
            <boxGeometry args={[1.35, 0.022, 0.02]} />
            <meshStandardMaterial color="#B79B68" metalness={0.75} roughness={0.32} />
          </mesh>
        </group>
      </group>

      <group>
        {columnPositions.map((pos, idx) => (
          <mesh key={idx} position={pos} receiveShadow>
            <cylinderGeometry args={[0.38, 0.42, 11, 20]} />
            <meshStandardMaterial map={stoneTex.map} color="#161512" roughness={0.92} metalness={0.05} />
          </mesh>
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]} receiveShadow>
          <planeGeometry args={[28, 22]} />
          <meshStandardMaterial map={stoneTex.map} color="#11100e" roughness={0.78} metalness={0.12} />
        </mesh>
      </group>

      <AtmosphericDust
        count={isMobile ? 70 : 160}
        spread={[9, 6.5, 6]}
        color="#e0c896"
        size={0.024}
        opacity={0.38}
        speed={0.09}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
