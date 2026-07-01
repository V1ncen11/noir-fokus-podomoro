import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'WORK' | 'BREAK';

import { playSFX } from '@/utils/sfx';

const playBell = () => {
  playSFX('bell');
};

const showNotification = (title: string, body: string) => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.svg'
    });
  }
};

export function useTimer(initialWorkMinutes = 25, initialBreakMinutes = 5) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(initialWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(initialBreakMinutes);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [autoStartWork, setAutoStartWork] = useState(false);
  const [autoStartBreak, setAutoStartBreak] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('WORK');
  const [phaseId, setPhaseId] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const expectedEndTimeRef = useRef<number | null>(null);

  // Clear transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Load from local storage on mount
  useEffect(() => {
    const savedWork = localStorage.getItem('noir-workMinutes');
    const savedBreak = localStorage.getItem('noir-breakMinutes');
    const savedSessions = localStorage.getItem('noir-completedSessions');
    const savedDate = localStorage.getItem('noir-last-active-date');
    const savedAutoWork = localStorage.getItem('noir-autoStartWork');
    const savedAutoBreak = localStorage.getItem('noir-autoStartBreak');

    const work = savedWork ? parseInt(savedWork) : initialWorkMinutes;
    const brk = savedBreak ? parseInt(savedBreak) : initialBreakMinutes;
    const loadedMode = (localStorage.getItem('noir-timer-mode') as TimerMode) || 'WORK';
    
    setWorkMinutes(work);
    setBreakMinutes(brk);
    
    const today = new Date().toDateString();
    if (savedSessions && savedDate === today) {
      setCompletedSessions(parseInt(savedSessions));
    } else {
      setCompletedSessions(0);
    }
    
    if (savedAutoWork) setAutoStartWork(savedAutoWork === 'true');
    if (savedAutoBreak) setAutoStartBreak(savedAutoBreak === 'true');
    setMode(loadedMode);
    
    // Sync prevSettings so the settings watcher doesn't falsely trigger on mount
    prevSettings.current = { work, break: brk, mode: loadedMode };

    // Load active timer state
    const savedActive = localStorage.getItem('noir-timer-active') === 'true';
    const savedTimeLeft = localStorage.getItem('noir-timer-time-left');
    const savedEndTime = localStorage.getItem('noir-timer-end-time');

    if (savedActive && savedEndTime) {
       const end = parseInt(savedEndTime);
       const now = Date.now();
       if (end > now) {
         setTimeLeft(Math.round((end - now) / 1000));
         setIsActive(true);
         expectedEndTimeRef.current = end;
       } else {
         // Finished while away
         setTimeLeft(0);
         setIsActive(true);
       }
    } else if (savedTimeLeft) {
       setTimeLeft(parseInt(savedTimeLeft));
       setIsActive(savedActive);
    } else {
       setTimeLeft(loadedMode === 'WORK' ? work * 60 : brk * 60);
    }
    
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('noir-workMinutes', workMinutes.toString());
      localStorage.setItem('noir-breakMinutes', breakMinutes.toString());
      localStorage.setItem('noir-completedSessions', completedSessions.toString());
      localStorage.setItem('noir-last-active-date', new Date().toDateString());
      localStorage.setItem('noir-autoStartWork', autoStartWork.toString());
      localStorage.setItem('noir-autoStartBreak', autoStartBreak.toString());
      localStorage.setItem('noir-timer-mode', mode);
      localStorage.setItem('noir-timer-active', isActive.toString());
      localStorage.setItem('noir-timer-time-left', timeLeft.toString());
      
      if (!isActive) {
        localStorage.removeItem('noir-timer-end-time');
      }
    }
  }, [workMinutes, breakMinutes, completedSessions, autoStartWork, autoStartBreak, mode, isActive, timeLeft, isLoaded]);

  const prevSettings = useRef({ work: initialWorkMinutes, break: initialBreakMinutes, mode: 'WORK' as TimerMode });

  // Update timeLeft when durations change, if timer is not active and loaded
  useEffect(() => {
    if (!isLoaded) return;

    const hasSettingsChanged = 
      prevSettings.current.work !== workMinutes || 
      prevSettings.current.break !== breakMinutes ||
      prevSettings.current.mode !== mode;

    if (hasSettingsChanged && !isActive) {
      setTimeLeft(mode === 'WORK' ? workMinutes * 60 : breakMinutes * 60);
    }

    prevSettings.current = { work: workMinutes, break: breakMinutes, mode };
  }, [workMinutes, breakMinutes, mode, isActive, isLoaded]);

  useEffect(() => {
    if (!isActive) {
      expectedEndTimeRef.current = null;
    }
  }, [isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0 && !isTransitioning) {
      if (!expectedEndTimeRef.current) {
        expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
        localStorage.setItem('noir-timer-end-time', expectedEndTimeRef.current.toString());
      }

      interval = setInterval(() => {
        if (expectedEndTimeRef.current) {
          const now = Date.now();
          const remaining = Math.round((expectedEndTimeRef.current - now) / 1000);
          setTimeLeft(Math.max(0, remaining));
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive && !isTransitioning) {
      if (interval) clearInterval(interval);
      expectedEndTimeRef.current = null;
      localStorage.removeItem('noir-timer-end-time');
      
      playBell();
      
      if (mode === 'WORK') {
        setCompletedSessions(prev => prev + 1);
        showNotification("Deep Work Complete", "Great job! Time to rest and recover.");
      } else {
        showNotification("Rest Complete", "Time to focus. Silence the noise.");
      }
      
      setPhaseId(p => p + 1);
      setIsTransitioning(true);
      
      transitionTimeoutRef.current = setTimeout(() => {
        const nextMode = mode === 'WORK' ? 'BREAK' : 'WORK';
        
        let shouldAutoStart = false;
        if (nextMode === 'WORK' && autoStartWork) shouldAutoStart = true;
        if (nextMode === 'BREAK' && autoStartBreak) shouldAutoStart = true;
        
        setIsActive(shouldAutoStart);
        setMode(nextMode);
        setTimeLeft(nextMode === 'WORK' ? workMinutes * 60 : breakMinutes * 60);
        setIsTransitioning(false);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, workMinutes, breakMinutes, autoStartWork, autoStartBreak, isTransitioning]);

  const toggleTimer = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    setIsActive((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === 'WORK' ? workMinutes * 60 : breakMinutes * 60);
  }, [mode, workMinutes, breakMinutes]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'WORK' ? workMinutes * 60 : breakMinutes * 60);
  }, [workMinutes, breakMinutes]);

  return {
    timeLeft,
    isActive,
    mode,
    completedSessions,
    workMinutes,
    breakMinutes,
    isLoaded,
    setWorkMinutes,
    setBreakMinutes,
    toggleTimer,
    resetTimer,
    switchMode,
    phaseId,
    autoStartWork,
    setAutoStartWork,
    autoStartBreak,
    setAutoStartBreak,
    isTransitioning
  };
}
