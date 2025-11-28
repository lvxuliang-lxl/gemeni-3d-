import React, { Suspense } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Environment, EffectComposer, Bloom } from '@react-three/drei';
import ParticleSystem from './ParticleSystem';
import { ParticleShape, HandResults } from '../types';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  currentShape: ParticleShape;
  baseColor: string;
  handData: React.MutableRefObject<HandResults | null>;
}

const Scene: React.FC<SceneProps> = ({ currentShape, baseColor, handData }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 45 }}
      dpr={[1, 2]} // Handle high DPI screens
      gl={{ antialias: false, alpha: false }} // Performance optimizations
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

      <Suspense fallback={null}>
        <ParticleSystem 
            shape={currentShape} 
            count={4000} 
            baseColor={baseColor}
            handData={handData}
        />
        
        {/* Post Processing for Glow */}
        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.5} />
        </EffectComposer>
      </Suspense>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={60} 
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default Scene;