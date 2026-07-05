import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Sparks() {
  const ref = useRef<THREE.Points>(null!);
  const count = 1500;
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15; // z
      
      spd[i] = 0.01 + Math.random() * 0.03; // speed
    }
    
    return [pos, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Slowly rotate the whole system
    ref.current.rotation.y -= delta * 0.05;
    ref.current.rotation.x -= delta * 0.02;

    const positionsArray = ref.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Move sparks upwards simulating heat
      positionsArray[i * 3 + 1] += speeds[i] * delta * 60;
      
      // Add slight horizontal drift
      positionsArray[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01;
      
      // Reset position if it goes too high
      if (positionsArray[i * 3 + 1] > 7.5) {
        positionsArray[i * 3 + 1] = -7.5;
        positionsArray[i * 3] = (Math.random() - 0.5) * 15;
      }
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FF7A00" // Laranja Incandescente
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <fog attach="fog" args={['#121212', 3, 10]} />
        <Sparks />
      </Canvas>
    </div>
  );
}
