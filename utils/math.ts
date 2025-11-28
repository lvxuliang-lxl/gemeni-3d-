import * as THREE from 'three';
import { ParticleShape } from '../types';

export const generateParticles = (shape: ParticleShape, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vector = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    switch (shape) {
      case ParticleShape.HEART: {
        // Parametric Heart Equation
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        // Basic distribution
        const t = Math.random() * Math.PI * 2;
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // Extrude slightly in Z for 3D volume
        
        // Let's use a 3D heart approximation
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 4; 
        
        // Scale down
        vector.set(x, y, z).multiplyScalar(0.3);
        break;
      }

      case ParticleShape.TREE: {
        // Cone/Spiral for Christmas Tree
        const height = 15;
        const y = (Math.random() * height) - (height / 2); // -7.5 to 7.5
        const radius = ((height / 2) - y) * 0.4; // Wide at bottom, narrow at top
        const angle = Math.random() * Math.PI * 2;
        
        vector.set(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        );
        break;
      }

      case ParticleShape.SATURN: {
        // Sphere + Ring
        const isRing = Math.random() > 0.6;
        if (isRing) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 6 + Math.random() * 3;
          vector.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 0.5, Math.sin(angle) * dist);
          // Tilt the ring
          vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.3);
        } else {
          // Planet body
          const r = 3.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          vector.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
          );
        }
        break;
      }

      case ParticleShape.DNA: {
        const t = Math.random() * 20 - 10; // Height
        const angle = t * 1.5;
        const r = 3;
        // Double helix offset
        const strand = Math.random() > 0.5 ? 0 : Math.PI;
        
        vector.set(
          Math.cos(angle + strand) * r,
          t,
          Math.sin(angle + strand) * r
        );
        break;
      }

      case ParticleShape.SPHERE:
      default: {
        // Uniform Sphere
        const r = 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        vector.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        break;
      }
    }

    positions[i3] = vector.x;
    positions[i3 + 1] = vector.y;
    positions[i3 + 2] = vector.z;
  }

  return positions;
};
