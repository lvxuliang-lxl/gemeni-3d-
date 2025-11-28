import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import WebcamController from './components/WebcamController';
import { ParticleShape, HandResults } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ParticleShape>(ParticleShape.HEART);
  const [baseColor, setBaseColor] = useState<string>('#00f2ff');
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  // Use a Ref for hand data to avoid re-rendering the 3D scene on every frame update
  const handDataRef = useRef<HandResults | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file.name);
    const objectUrl = URL.createObjectURL(file);
    
    if (audioRef.current) {
      audioRef.current.src = objectUrl;
      audioRef.current.load();
      try {
          await audioRef.current.play();
          await audioService.initialize(audioRef.current);
          setIsPlaying(true);
      } catch (err) {
          console.error("Audio play failed", err);
      }
    }
  };

  const handleHandUpdate = (results: HandResults) => {
    handDataRef.current = results;
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene 
            currentShape={currentShape} 
            baseColor={baseColor} 
            handData={handDataRef}
        />
      </div>

      {/* UI Overlay */}
      <Controls 
        currentShape={currentShape} 
        setShape={setCurrentShape}
        baseColor={baseColor}
        setBaseColor={setBaseColor}
        onUpload={handleAudioUpload}
        audioFileName={audioFile}
        isPlaying={isPlaying}
      />

      {/* Logic Layer: Webcam & MediaPipe */}
      <WebcamController 
        onHandsUpdate={handleHandUpdate}
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        crossOrigin="anonymous" 
        loop 
        onEnded={() => setIsPlaying(false)}
      />

      {/* Loading State Overlay */}
      {(!cameraReady) && (
        <div className="absolute bottom-4 right-4 bg-black/80 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 z-50">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
          <span className="text-xs text-gray-300">Initializing Camera & AI...</span>
        </div>
      )}
    </div>
  );
};

export default App;
