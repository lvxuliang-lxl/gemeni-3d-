import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { generateParticles } from '../utils/math';
import { ParticleShape, HandResults } from '../types';
import { audioService } from '../services/audioService';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface ParticleSystemProps {
  shape: ParticleShape;
  count: number;
  baseColor: string;
  handData: React.MutableRefObject<HandResults | null>;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ shape, count, baseColor, handData }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store target positions for all shapes to avoid recalculating
  const shapePositions = useMemo(() => {
    return {
      [ParticleShape.SPHERE]: generateParticles(ParticleShape.SPHERE, count),
      [ParticleShape.HEART]: generateParticles(ParticleShape.HEART, count),
      [ParticleShape.TREE]: generateParticles(ParticleShape.TREE, count),
      [ParticleShape.SATURN]: generateParticles(ParticleShape.SATURN, count),
      [ParticleShape.DNA]: generateParticles(ParticleShape.DNA, count),
    };
  }, [count]);

  // Current positions of particles (for interpolation)
  const currentPositions = useMemo(() => new Float32Array(count * 3), [count]);
  // Initialize current positions to sphere initially
  useLayoutEffect(() => {
    currentPositions.set(shapePositions[ParticleShape.SPHERE]);
  }, [currentPositions, shapePositions]);

  // Temporary color object
  const color = useMemo(() => new THREE.Color(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const targetPositions = shapePositions[shape];
    
    // Audio Data
    const freqData = audioService.getFrequencyData();
    const bass = audioService.getBass(); // 0-255
    const highs = audioService.getHighs(); // 0-255
    const beatScale = 1 + (bass / 255) * 0.5; // Scale multiplier based on bass

    // Hand Interaction Logic
    let interactionDistance = 0;
    let hasHands = false;
    let handCenter = new THREE.Vector3(0, 0, 0);

    if (handData.current && handData.current.multiHandLandmarks.length > 0) {
      hasHands = true;
      const hands = handData.current.multiHandLandmarks;
      
      // Calculate center of interaction (average of wrist positions)
      // Landmark 0 is wrist
      if (hands.length === 1) {
        // Map 2D (0..1) to 3D roughly (-10..10)
        handCenter.set(
            (0.5 - hands[0][0].x) * 20, 
            (0.5 - hands[0][0].y) * 15, 
            0
        );
      } else if (hands.length === 2) {
        const h1 = hands[0][0];
        const h2 = hands[1][0];
        // Distance between hands affects color/chaos
        const dist = Math.sqrt(Math.pow(h1.x - h2.x, 2) + Math.pow(h1.y - h2.y, 2));
        interactionDistance = dist; // 0 to ~1
        
        handCenter.set(
            ((0.5 - h1.x) + (0.5 - h2.x)) * 10,
            ((0.5 - h1.y) + (0.5 - h2.y)) * 7.5,
            0
        );
      }
    }

    // Update Particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Morphing Logic: Lerp current position to target position
      // Speed up lerp on beat
      const lerpSpeed = 0.03 + (highs / 255) * 0.05;

      currentPositions[i3] += (targetPositions[i3] - currentPositions[i3]) * lerpSpeed;
      currentPositions[i3 + 1] += (targetPositions[i3 + 1] - currentPositions[i3 + 1]) * lerpSpeed;
      currentPositions[i3 + 2] += (targetPositions[i3 + 2] - currentPositions[i3 + 2]) * lerpSpeed;

      // Set Position
      dummy.position.set(
        currentPositions[i3],
        currentPositions[i3 + 1],
        currentPositions[i3 + 2]
      );

      // Add Audio Noise/Jitter
      if (bass > 50) {
        dummy.position.x += (Math.random() - 0.5) * (bass / 1000);
        dummy.position.y += (Math.random() - 0.5) * (bass / 1000);
        dummy.position.z += (Math.random() - 0.5) * (bass / 1000);
      }

      // Add Rotation based on global time
      // Rotate entire system slightly, plus individual variation
      const radius = Math.sqrt(
          dummy.position.x ** 2 + dummy.position.z ** 2
      );
      const angleOffset = radius * 0.1 * Math.sin(time * 0.5);
      
      const px = dummy.position.x;
      const pz = dummy.position.z;
      
      // Swirl effect
      dummy.position.x = px * Math.cos(angleOffset) - pz * Math.sin(angleOffset);
      dummy.position.z = px * Math.sin(angleOffset) + pz * Math.cos(angleOffset);

      // Apply Beat Scale
      dummy.position.multiplyScalar(beatScale);

      // Hand Interaction: Repel or Attract
      if (hasHands) {
         const distToHand = dummy.position.distanceTo(handCenter);
         if (distToHand < 5) {
             // Push away slightly
             const repelDir = dummy.position.clone().sub(handCenter).normalize();
             dummy.position.add(repelDir.multiplyScalar(0.2));
         }
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color Management
      color.set(baseColor);
      
      // Audio frequency mapped to HSL
      // Highs shift hue slightly
      const hueShift = (freqData[i % freqData.length] / 255) * 0.2;
      color.offsetHSL(hueShift, 0, 0);

      // Hand Distance shifts color dramatically (e.g., bringing hands together heats it up)
      if (interactionDistance > 0) {
          color.lerp(tempColor.set('hotpink'), 1 - interactionDistance); // Close = Pink, Far = Base
      }

      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    
    // Rotate the whole mesh slowly
    meshRef.current.rotation.y += 0.001 + (bass / 255) * 0.005;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.08, 6, 6]} /> {/* Low poly sphere for particles */}
      <meshStandardMaterial 
        toneMapped={false}
        emissive={new THREE.Color(0x222222)}
        emissiveIntensity={2}
        roughness={0.1}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

export default ParticleSystem;