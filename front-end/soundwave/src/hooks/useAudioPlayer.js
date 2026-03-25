import { useState, useEffect } from 'react';
import { getProductAudioUrl } from '../api/services/productsService';

// Singleton — один инстанс на всё приложение
const manager = {
  audio: null,
  stopCurrent: null,

  async play(url, onStop) {
    if (this.stopCurrent) this.stopCurrent();
    if (this.audio) { this.audio.pause(); this.audio = null; }

    const audio = new Audio(url);
    this.audio = audio;
    this.stopCurrent = onStop;

    audio.onended = () => {
      onStop();
      this.audio = null;
      this.stopCurrent = null;
    };

    await audio.play().catch(() => {
      onStop();
      this.audio = null;
      this.stopCurrent = null;
    });
  },

  stop() {
    if (this.stopCurrent) this.stopCurrent();
    if (this.audio) this.audio.pause();
    this.audio = null;
    this.stopCurrent = null;
  },
};

export function useAudioPlayer(productId) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (manager.stopCurrent === setPlaying) manager.stop();
    };
  }, []);

  const toggle = () => {
    if (playing) {
      manager.stop();
      setPlaying(false);
    } else {
      manager.play(getProductAudioUrl(productId), () => setPlaying(false));
      setPlaying(true);
    }
  };

  return { playing, toggle };
}
