import React from 'react';
import { ParticleShape } from '../types';

interface ControlsProps {
  currentShape: ParticleShape;
  setShape: (s: ParticleShape) => void;
  baseColor: string;
  setBaseColor: (c: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  audioFileName: string | null;
  isPlaying: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  currentShape,
  setShape,
  baseColor,
  setBaseColor,
  onUpload,
  audioFileName,
  isPlaying
}) => {
  return (
    <div className="absolute top-4 left-4 z-10 w-72 bg-gray-900/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl text-white transition-all hover:bg-gray-900/90">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Sonic Flow
        </h1>
        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} title="Audio Status" />
      </div>

      {/* Shapes Grid */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
          Particle Shape
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(ParticleShape).map((shape) => (
            <button
              key={shape}
              onClick={() => setShape(shape)}
              className={`
                px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 border
                ${currentShape === shape 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                  : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:border-white/20'}
              `}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
          Base Theme
        </label>
        <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-lg border border-white/5">
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
          />
          <span className="text-xs text-gray-400 font-mono">{baseColor}</span>
        </div>
      </div>

      {/* Audio Upload */}
      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
          Audio Source
        </label>
        <label className="flex flex-col items-center justify-center w-full h-12 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-white/5 transition-colors group">
          <div className="flex items-center space-x-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
             </svg>
             <span className="text-xs text-gray-300 group-hover:text-white truncate max-w-[150px]">
               {audioFileName || "Select MP3 File"}
             </span>
          </div>
          <input type="file" className="hidden" accept="audio/*" onChange={onUpload} />
        </label>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="text-cyan-400 font-bold">Gestures:</span> Hands closer = Hot color. Pinch = Interaction. 
          <br/>
          <span className="text-purple-400 font-bold">Audio:</span> Bass controls jitter. Highs control speed.
        </p>
      </div>
    </div>
  );
};

export default Controls;
