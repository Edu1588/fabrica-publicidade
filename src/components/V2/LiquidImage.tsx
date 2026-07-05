import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MathUtils } from 'three';

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Liquid distortion effect
  float frequency = 10.0;
  float amplitude = 0.03 * uHover;
  
  // Complex wave for liquid feel
  uv.x += sin(uv.y * frequency + uTime) * amplitude;
  uv.y += cos(uv.x * frequency + uTime * 0.8) * amplitude;
  uv.x += sin(uv.x * frequency * 2.0 - uTime * 1.5) * (amplitude * 0.5);
  
  vec4 color = texture2D(uTexture, uv);
  gl_FragColor = color;
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function Scene({ imageUrl, isHovered }: { imageUrl: string, isHovered: boolean }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Target value for smooth interpolation
  const targetHover = isHovered ? 1 : 0;
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly interpolate hover state
      materialRef.current.uniforms.uHover.value = MathUtils.lerp(
        materialRef.current.uniforms.uHover.value, 
        targetHover, 
        0.1
      );
    }
  });

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uHover: { value: 0 },
      uTime: { value: 0 }
    }),
    [texture]
  );

  return (
    <mesh>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface LiquidImageProps {
  src: string;
  className?: string;
}

export default function LiquidImage({ src, className = "" }: LiquidImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer bg-neutral-900 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={src}
        alt=""
        crossOrigin="anonymous"
        className="absolute inset-0 z-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 z-10 mix-blend-normal">
        <Canvas 
          camera={{ position: [0, 0, 1], left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 1000 }} 
          orthographic
        >
          <React.Suspense fallback={null}>
            <Scene imageUrl={src} isHovered={isHovered} />
          </React.Suspense>
        </Canvas>
      </div>
    </div>
  );
}
