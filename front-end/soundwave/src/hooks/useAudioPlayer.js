// Singleton — один инстанс на всё приложение
const manager = {
  audio: null,
  stopCurrent: null,

  play(url, onStop) {
    // Останавливаем текущий трек
    if (this.stopCurrent) {
      this.stopCurrent();
    }
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    const audio = new Audio(url);
    this.audio = audio;
    this.stopCurrent = onStop;

    audio.onended = () => {
      onStop();
      this.audio = null;
      this.stopCurrent = null;
    };

    return audio.play().catch(() => {
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

import { useState, useEffect } from 'react';
import { getProductAudioUrl } from '../api/services/productsService';

export function useAudioPlayer(productId) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // При размонтировании — если этот трек играет, остановить
      if (manager.stopCurrent === setPlaying) {
        manager.stop();
      }
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
