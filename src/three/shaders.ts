import * as THREE from 'three';

/**
 * Volumetric warm spotlight cone shader for museum gallery & moral hall scenes
 */
export function createVolumetricBeamMaterial(
  color = '#d9be8c',
  opacity = 0.16
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(abs(dot(normalize(vNormal), viewDir)), 1.65);
        float verticalFade = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.2, vUv.y);
        float shimmer = 0.92 + 0.08 * sin(vUv.y * 8.0 - uTime * 0.5);
        float alpha = fresnel * verticalFade * uOpacity * shimmer;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
}

/**
 * Custom GLSL boundary veil separating ЯВЛЕНИЕ (Phenomenon) from ВЕЩЬ В СЕБЕ (Thing in Itself)
 */
export function createNoumenonVeilMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uReveal: { value: 1 },
      uGold: { value: new THREE.Color('#B79B68') },
      uIvory: { value: new THREE.Color('#EAE4D8') },
      uVoid: { value: new THREE.Color('#0B0B0A') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uReveal;
      uniform vec3 uGold;
      uniform vec3 uIvory;
      uniform vec3 uVoid;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vec2 centered = vUv * 2.0 - 1.0;
        float dist = length(centered);

        // WebGL1-safe architectural metric lines (no fwidth/OES_standard_derivatives needed)
        vec2 gUv = abs(fract((vUv - 0.5) * 14.0) - 0.5);
        float lineX = smoothstep(0.47, 0.5, gUv.x);
        float lineY = smoothstep(0.47, 0.5, gUv.y);
        float line = max(lineX, lineY);

        // Pointer-induced phenomenal ripple only on the accessible veil surface
        vec2 p = uPointer * 0.45;
        float pDist = length(centered - p);
        float ring = smoothstep(0.02, 0.0, abs(fract(pDist * 4.5 - uTime * 0.25) - 0.5) - 0.47);
        float pointerMask = exp(-pDist * 2.4);

        // Circular architectural aperture frame
        float circle = smoothstep(0.014, 0.0, abs(dist - 0.72));
        float outerFade = smoothstep(1.0, 0.72, max(abs(centered.x), abs(centered.y)));

        vec3 col = mix(uVoid, uGold, line * 0.24 + circle * 0.65);
        col = mix(col, uIvory, ring * pointerMask * 0.55);

        float alpha = (0.12 + line * 0.12 + circle * 0.42 + ring * pointerMask * 0.24) * outerFade * uReveal;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/**
 * Astronomically restrained starfield point shader for Scene 10
 */
export function createStarfieldMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aPhase;
      attribute vec3 aColor;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float twinkle = 0.84 + 0.16 * sin(uTime * 0.9 + aPhase * 6.2831);
        vAlpha = twinkle;
        gl_PointSize = aSize * uPixelRatio * (260.0 / max(10.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float core = exp(-d * d * 24.0);
        float halo = smoothstep(0.5, 0.0, d) * 0.28;
        float strength = (core + halo) * vAlpha * uOpacity;
        gl_FragColor = vec4(vColor, strength);
      }
    `,
  });
}
