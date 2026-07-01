import { useState, useEffect, useRef } from 'react';

export function useAudio(url: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize audio object only on the client side
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
      
      const storageKey = `noir-vol-${url.replace(/[^a-zA-Z0-9]/g, '')}`;
      const savedVol = localStorage.getItem(storageKey);
      
      if (savedVol !== null) {
        const parsedVol = parseFloat(savedVol);
        setVolume(parsedVol);
        audioRef.current.volume = parsedVol;
      } else {
        audioRef.current.volume = 0.5;
        setVolume(0.5);
      }
      setIsLoaded(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    if (audioRef.current && isLoaded) {
      audioRef.current.volume = volume;
      const storageKey = `noir-vol-${url.replace(/[^a-zA-Z0-9]/g, '')}`;
      localStorage.setItem(storageKey, volume.toString());
    }
  }, [volume, url, isLoaded]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn(`[Noir Focus] Missing audio file: ${url}. Please add it to the public/audio folder.`);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const toggle = () => setIsPlaying(prev => !prev);

  return { isPlaying, toggle, volume, setVolume };
}
