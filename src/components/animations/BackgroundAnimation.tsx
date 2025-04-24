
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function generateRandomSpherePoints(numPoints: number, radius: number) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta) * (0.3 + Math.random() * 0.7);
    const y = radius * Math.sin(phi) * Math.sin(theta) * (0.3 + Math.random() * 0.7);
    const z = radius * Math.cos(phi) * (0.3 + Math.random() * 0.7);
    points.push(x, y, z);
  }
  return new Float32Array(points);
}

function ParticleField() {
  const points = useRef<THREE.Points>(null!);
  const sphere1 = useRef();
  const sphere2 = useRef();
  
  const sphere1Points = generateRandomSpherePoints(2000, 5);
  const sphere2Points = generateRandomSpherePoints(1000, 3);
  
  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.x += delta * 0.05;
      points.current.rotation.y += delta * 0.03;
    }
    
    if (sphere1.current) {
      (sphere1.current as any).rotation.y += delta * 0.08;
      (sphere1.current as any).rotation.z += delta * 0.03;
    }
    
    if (sphere2.current) {
      (sphere2.current as any).rotation.y -= delta * 0.06;
      (sphere2.current as any).rotation.z -= delta * 0.04;
    }
  });

  return (
    <>
      <Points ref={points} limit={2000}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
        />
        <primitive object={new THREE.BufferGeometry()}>
          <primitive
            attach="attributes-position"
            object={new THREE.BufferAttribute(sphere1Points, 3)}
          />
        </primitive>
      </Points>
      
      <Points ref={sphere1} limit={2000}>
        <PointMaterial
          transparent
          color="#818cf8"
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
        />
        <primitive object={new THREE.BufferGeometry()}>
          <primitive
            attach="attributes-position"
            object={new THREE.BufferAttribute(sphere1Points, 3)}
          />
        </primitive>
      </Points>
      
      <Points ref={sphere2} limit={1000}>
        <PointMaterial
          transparent
          color="#a5b4fc"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
        />
        <primitive object={new THREE.BufferGeometry()}>
          <primitive
            attach="attributes-position"
            object={new THREE.BufferAttribute(sphere2Points, 3)}
          />
        </primitive>
      </Points>
    </>
  );
}

export function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ParticleField />
      </Canvas>
    </div>
  );
}

export default BackgroundAnimation;
