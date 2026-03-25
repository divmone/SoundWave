import { useState, useEffect, useRef } from 'react';
import { getProductAudioUrl } from '../api/services/productsService';

const manager = {
  audio: null,
  audioCtx: null,
  analyser: null,
  stopCurrent: null,
  currentId: null,

  play(id, url, onStop, onAnalyser, onDuration) {
    // Останавливаем текущий
    if (this.stopCurrent) this.stopCurrent();
    if (this.audio) { this.audio.pause(); this.audio = null; }
    if (this.audioCtx) { this.audioCtx.close(); this.audioCtx = null; this.analyser = null; }

    this.currentId = id;
    const audio = new Audio(url);
    this.audio = audio;
    this.stopCurrent = onStop;

    // Web Audio API — реальная частотная визуализация
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      this.audioCtx = ctx;
      this.analyser = analyser;
      // iOS Safari: AudioContext starts suspended even in click handlers
      ctx.resume().then(() => onAnalyser(analyser));
    } catch {
      onAnalyser(null);
    }

    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration)) onDuration(audio.duration);
    });

    audio.onended = () => {
      onStop();
      onAnalyser(null);
      this.audio = null;
      this.stopCurrent = null;
      this.analyser = null;
      this.currentId = null;
    };

    const tryPlay = () => audio.play().catch(() => {
      onStop();
      onAnalyser(null);
      this.audio = null;
      this.stopCurrent = null;
    });

    // On iOS the AudioContext may still be suspended — resume first, then play
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().then(tryPlay);
    } else {
      tryPlay();
    }
  },

  stop() {
    if (this.stopCurrent) this.stopCurrent();
    if (this.audio) { this.audio.pause(); this.audio = null; }
    if (this.audioCtx) { this.audioCtx.close(); this.audioCtx = null; }
    this.analyser = null;
    this.stopCurrent = null;
    this.currentId = null;
  },
};

export function stopAll() {
  manager.stop();
}

export function useAudioPlayer(productId) {
  const [playing,  setPlaying]  = useState(false);
  const [analyser, setAnalyser] = useState(null);
  const [duration, setDuration] = useState(null);
  const idRef = useRef(Symbol());

  useEffect(() => {
    return () => {
      if (manager.currentId === idRef.current) manager.stop();
    };
  }, []);

  const toggle = () => {
    if (playing) {
      manager.stop();
      setPlaying(false);
      setAnalyser(null);
    } else {
      manager.play(
        idRef.current,
        getProductAudioUrl(productId),
        () => { setPlaying(false); setAnalyser(null); },
        setAnalyser,
        setDuration,
      );
      setPlaying(true);
    }
  };

  return { playing, toggle, analyser, duration };
}
