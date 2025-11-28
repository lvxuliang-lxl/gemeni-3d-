export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor() {
    // Lazy init
  }

  async initialize(audioElement: HTMLAudioElement) {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256; // 128 data points
    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  getFrequencyData(): Uint8Array {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return new Uint8Array(0);
  }

  // Helper to get average bass (lower frequencies)
  getBass(): number {
    if (!this.dataArray) return 0;
    // Arbitrary range for bass: first 20 bins
    let sum = 0;
    for(let i=0; i<20; i++) {
        sum += this.dataArray[i];
    }
    return sum / 20;
  }
  
  // Helper to get average mid/high
  getHighs(): number {
    if (!this.dataArray) return 0;
    let sum = 0;
    const start = 50;
    const end = Math.min(this.dataArray.length, 100);
    for(let i=start; i<end; i++) {
        sum += this.dataArray[i];
    }
    return sum / (end - start);
  }
}

export const audioService = new AudioService();
