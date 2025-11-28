import React, { useEffect, useRef } from 'react';
import { HandResults } from '../types';

interface WebcamControllerProps {
  onHandsUpdate: (results: HandResults) => void;
  onCameraReady: () => void;
}

const WebcamController: React.FC<WebcamControllerProps> = ({ onHandsUpdate, onCameraReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let camera: any = null;
    let hands: any = null;

    const setupMediaPipe = async () => {
      if (!window.Hands || !videoRef.current) return;

      hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        onHandsUpdate({
          multiHandLandmarks: results.multiHandLandmarks,
          multiHandedness: results.multiHandedness
        });
      });

      if (window.Camera && videoRef.current) {
        camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && hands) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        
        try {
            await camera.start();
            onCameraReady();
        } catch(e) {
            console.error("Camera start failed", e);
        }
      }
    };

    setupMediaPipe();

    return () => {
        // Cleanup if possible, though MediaPipe global instances are tricky
        if (camera) camera.stop();
        if (hands) hands.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <video
      ref={videoRef}
      className="fixed bottom-0 right-0 w-32 h-24 opacity-0 pointer-events-none"
      playsInline
      muted
    />
  );
};

export default WebcamController;
