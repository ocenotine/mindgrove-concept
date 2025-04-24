
import React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface BookProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  title?: string;
  size?: [number, number, number];
}

// This is the inner component that uses Three.js hooks
const BookModel: React.FC<BookProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#1a365d',
  title = '',
  size = [1, 1.5, 0.2],
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.001;
    }
  });

  return (
    <group position={position} rotation={rotation as any}>
      {/* Book body */}
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Book title on spine (if provided) */}
      {title && (
        <Text
          position={[size[0] / 2 + 0.01, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      )}
    </group>
  );
};

// This is the outer component that provides the Canvas context
const BookAnimation: React.FC<BookProps> = (props) => {
  return (
    <Canvas
      style={{ width: '100%', height: '300px' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <BookModel {...props} />
    </Canvas>
  );
};

export default BookAnimation;
