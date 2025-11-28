import { Vector3 } from 'three';

export enum ParticleShape {
  SPHERE = 'SPHERE',
  HEART = 'HEART',
  TREE = 'TREE',
  SATURN = 'SATURN',
  DNA = 'DNA'
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResults {
  multiHandLandmarks: HandLandmark[][];
  multiHandedness: any[];
}

export interface AppState {
  currentShape: ParticleShape;
  baseColor: string;
  particleCount: number;
  isPlaying: boolean;
  audioReady: boolean;
}

// Global declaration for MediaPipe scripts loaded via CDN
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}
