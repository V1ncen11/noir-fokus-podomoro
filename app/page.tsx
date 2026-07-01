"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, CloudRain, Leaf, Headphones, X, Music, Settings, Maximize, Minimize, Sun, Moon, Palette, Waves, Flame, Wind, BookOpen } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useAudio } from "@/hooks/useAudio";
import { playSFX } from "@/utils/sfx";

export default function Home() {
  const { 
    timeLeft, 
    isActive, 
    mode, 
    toggleTimer, 
    resetTimer, 
    switchMode,
    completedSessions,
    workMinutes,
    breakMinutes,
    isLoaded,
    setWorkMinutes,
    setBreakMinutes,
    phaseId,
    autoStartWork,
    setAutoStartWork,
    autoStartBreak,
    setAutoStartBreak,
    isTransitioning
  } = useTimer();

  const ringControls = useAnimation();
  const prevPhaseId = useRef(phaseId);

  useEffect(() => {
    if (phaseId > prevPhaseId.current) {
      ringControls.start({
        opacity: [1, isActive ? 0.3 : 0.15],
        transition: { duration: 2, ease: "easeOut" }
      });
      prevPhaseId.current = phaseId;
    } else {
      ringControls.start({
        opacity: isActive ? 0.3 : 0.15,
        transition: { duration: 0.5 }
      });
    }
  }, [phaseId, isActive, ringControls]);
  
  const [timerFont, setTimerFont] = useState<'sans' | 'serif' | 'mono'>('sans');

  useEffect(() => {
    const savedFont = localStorage.getItem('noir-timerFont');
    if (savedFont) setTimerFont(savedFont as any);
  }, []);

  const handleFontChange = (font: 'sans' | 'serif' | 'mono') => {
    setTimerFont(font);
    localStorage.setItem('noir-timerFont', font);
  };

  const fontClass = 
    timerFont === 'serif' ? 'font-serif font-light tracking-normal text-[min(11vh,84px)]' : 
    timerFont === 'mono' ? 'font-mono font-light tracking-normal text-[min(9vh,68px)]' : 
    'font-sans font-thin tracking-tighter text-[min(12vh,96px)]';
  
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [visualTheme, setVisualTheme] = useState<'noir' | 'paper' | 'rose'>('noir');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('noir-visualTheme');
    if (savedTheme) {
      setVisualTheme(savedTheme as any);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'noir');
    }
  }, []);

  const handleThemeChange = (theme: 'noir' | 'paper' | 'rose') => {
    setVisualTheme(theme);
    localStorage.setItem('noir-visualTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [previousAudioState, setPreviousAudioState] = useState<Record<string, boolean> | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [skipDelays, setSkipDelays] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('noir-has-seen-splash');
    if (hasSeenSplash) {
      setShowSplash(false);
      setSkipDelays(true);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('noir-has-seen-splash', 'true');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Premium Features State
  const [currentTask, setCurrentTask] = useState("");

  // Persist Current Task
  useEffect(() => {
    const savedTask = localStorage.getItem('noir-currentTask');
    if (savedTask) setCurrentTask(savedTask);
  }, []);

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentTask(val);
    localStorage.setItem('noir-currentTask', val);
  };
  const [isFullscreen, setIsFullscreen] = useState(false);

  const quotes = [
    "SILENCE THE NOISE.",
    "EMBRACE THE STRUGGLE.",
    "DISCIPLINE EQUALS FREEDOM.",
    "FOCUS ON THE PROCESS.",
    "DEEP WORK, DEEP RESULTS.",
    "CONSISTENCY IS KEY."
  ];

  // Current Time & Greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      
      const hour = now.getHours();
      if (hour >= 5 && hour < 11) setGreeting("Good Morning.");
      else if (hour >= 11 && hour < 16) setGreeting("Good Afternoon.");
      else if (hour >= 16 && hour < 20) setGreeting("Good Evening.");
      else setGreeting("Good Night.");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen tracking
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);



  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const [activeTab, setActiveTab] = useState('ambience');

  // Initialize Ambient Sounds 
  const sounds = {
    rain: useAudio("/audio/rain.mp3"),
    nature: useAudio("/audio/nature.mp3"),
    cafe: useAudio("/audio/cafe.mp3"),
    ocean: useAudio("/audio/ocean.mp3"),
    fire: useAudio("/audio/fireplace.mp3"),
    night: useAudio("/audio/night.mp3"),
    track1: useAudio("/audio/track1.mp3"),
    track2: useAudio("/audio/track2.mp3"),
    track3: useAudio("/audio/track3.mp3")
  };

  const isMuted = Object.values(sounds).every(s => !s.isPlaying);

  const toggleMuteAll = () => {
    if (isMuted) {
      let stateToRestore = previousAudioState;
      if (!stateToRestore) {
        try {
          const saved = localStorage.getItem('noir-activeAudioState');
          if (saved) stateToRestore = JSON.parse(saved);
        } catch (e) {}
      }

      if (stateToRestore && Object.values(stateToRestore).some(v => v)) {
        Object.keys(stateToRestore).forEach(key => {
          if (stateToRestore[key] && sounds[key as keyof typeof sounds] && !sounds[key as keyof typeof sounds].isPlaying) {
            sounds[key as keyof typeof sounds].toggle();
          }
        });
        setPreviousAudioState(null);
      } else {
        sounds.track1.toggle();
      }
    } else {
      const state: Record<string, boolean> = {};
      Object.keys(sounds).forEach(key => {
        state[key] = sounds[key as keyof typeof sounds].isPlaying;
        if (sounds[key as keyof typeof sounds].isPlaying) {
          sounds[key as keyof typeof sounds].toggle();
        }
      });
      setPreviousAudioState(state);
    }
  };

  const playingStates = Object.values(sounds).map(s => s.isPlaying).join(',');
  useEffect(() => {
    if (!isLoaded) return;
    const currentState: Record<string, boolean> = {};
    Object.keys(sounds).forEach(key => {
      currentState[key] = sounds[key as keyof typeof sounds].isPlaying;
    });
    
    if (Object.values(currentState).some(v => v)) {
      localStorage.setItem('noir-activeAudioState', JSON.stringify(currentState));
    }
  }, [playingStates, isLoaded]);

  // Auto-mute when timer phase ends
  useEffect(() => {
    if (phaseId > 0 && !isMuted) {
      toggleMuteAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  const SOUND_CATEGORIES = [
    {
      id: 'ambience',
      name: 'Ambience',
      sounds: [
        { id: 'rain', name: 'Rain', icon: CloudRain, hook: sounds.rain, colorText: 'text-cyan-500', colorSlider: 'bg-cyan-500/30 [&::-webkit-slider-thumb]:bg-cyan-500', colorValue: 'text-cyan-500/50' },
        { id: 'nature', name: 'Nature', icon: Leaf, hook: sounds.nature, colorText: 'text-emerald-500', colorSlider: 'bg-emerald-500/30 [&::-webkit-slider-thumb]:bg-emerald-500', colorValue: 'text-emerald-500/50' },
        { id: 'cafe', name: 'Cafe', icon: Coffee, hook: sounds.cafe, colorText: 'text-amber-500', colorSlider: 'bg-amber-500/30 [&::-webkit-slider-thumb]:bg-amber-500', colorValue: 'text-amber-500/50' },
        { id: 'ocean', name: 'Ocean', icon: Waves, hook: sounds.ocean, colorText: 'text-blue-500', colorSlider: 'bg-blue-500/30 [&::-webkit-slider-thumb]:bg-blue-500', colorValue: 'text-blue-500/50' },
        { id: 'fire', name: 'Fireplace', icon: Flame, hook: sounds.fire, colorText: 'text-orange-500', colorSlider: 'bg-orange-500/30 [&::-webkit-slider-thumb]:bg-orange-500', colorValue: 'text-orange-500/50' },
        { id: 'night', name: 'Night', icon: Moon, hook: sounds.night, colorText: 'text-indigo-400', colorSlider: 'bg-indigo-400/30 [&::-webkit-slider-thumb]:bg-indigo-400', colorValue: 'text-indigo-400/50' }
      ]
    },
    {
      id: 'instrumental',
      name: 'Instrumentals',
      sounds: [
        { id: 'indo', name: 'Indo Instrumental', icon: Music, hook: sounds.track1, colorText: 'text-text-main', colorSlider: 'bg-border-main [&::-webkit-slider-thumb]:bg-text-main', colorValue: 'text-text-muted' },
        { id: 'english', name: 'English Instrumental', icon: Music, hook: sounds.track2, colorText: 'text-text-main', colorSlider: 'bg-border-main [&::-webkit-slider-thumb]:bg-text-main', colorValue: 'text-text-muted' }
      ]
    },
    {
      id: 'spiritual',
      name: 'Spiritual',
      sounds: [
        { id: 'juz30', name: 'Al-Quran Juz 30', icon: BookOpen, hook: sounds.track3, colorText: 'text-text-main', colorSlider: 'bg-border-main [&::-webkit-slider-thumb]:bg-text-main', colorValue: 'text-text-muted' }
      ]
    }
  ];

  // Format time (e.g., 25:00)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Calculate progress for the ring
  const totalTime = mode === 'WORK' ? workMinutes * 60 : breakMinutes * 60;
  const progress = 1 - timeLeft / totalTime;

  if (!isLoaded) {
    return <div className="fixed inset-0 bg-bg-main z-[200]" />;
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-main"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-lg md:text-2xl tracking-[0.4em] font-light uppercase text-text-main mb-4 text-center"
            >
              Noir Focus
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-text-muted font-light text-center px-6"
            >
              Focus without distractions.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`fixed inset-0 w-full h-full flex flex-col items-center justify-between p-6 md:p-10 pb-4 md:pb-6 overflow-hidden transition-opacity ${skipDelays ? 'duration-0' : 'duration-1000'} ${(isLoaded && !showSplash) ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Cinematic Backgrounds */}
      {/* Background noise removed to prevent mobile GPU glitching */}

      {/* Top Header */}
      <header className="w-full flex justify-between items-center z-10 relative">
        <div className="w-1/3">
          <h1 className="text-sm md:text-xl tracking-[0.2em] md:tracking-[0.3em] font-light uppercase text-text-muted whitespace-nowrap">
            <span className="hidden md:inline">Noir Focus</span>
            <span className="md:hidden">NF</span>
          </h1>
        </div>
        
        {/* Middle Clock & Session Stats */}
        <div className="flex flex-col items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 w-1/3">
          <span className="text-[10px] md:text-xs tracking-[0.3em] font-light text-text-faint">{currentTime}</span>
          <div className="flex gap-1 h-2 items-center justify-center">
            {Array.from({ length: Math.min(completedSessions, 12) }).map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.35 }}
                className="w-1 h-1 rounded-full bg-text-faint" 
              />
            ))}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex gap-3 md:gap-5 w-1/3 justify-end items-center">
          <button onClick={() => setIsSettingsOpen(true)} className="text-text-faint hover:text-text-main transition-colors" title="Settings" aria-label="Open Settings">
            <Settings size={15} strokeWidth={1.5} />
          </button>
          <button onClick={toggleFullscreen} className="text-text-faint hover:text-text-main transition-colors" title="Fullscreen" aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullscreen ? <Minimize size={15} strokeWidth={1.5} /> : <Maximize size={15} strokeWidth={1.5} />}
          </button>
          <div className="hidden md:block w-[1px] h-3 bg-border-main mx-1"></div>
          <button 
            onClick={() => switchMode('WORK')}
            className={`text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-500 ${mode === 'WORK' ? 'text-text-main' : 'text-text-faint hover:text-text-muted'}`}
          >
            Work
          </button>
          <button 
            onClick={() => switchMode('BREAK')}
            className={`text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-500 ${mode === 'BREAK' ? 'text-text-main' : 'text-text-faint hover:text-text-muted'}`}
          >
            Rest
          </button>
        </div>
      </header>

      {/* Main Content Area (Centered) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 mb-2 lg:mb-4">
        {/* Main Timer Display */}
        <div className="relative flex flex-col items-center justify-center w-[min(45vh,360px)] h-[min(45vh,360px)] min-w-[220px] min-h-[220px]">
          
          {/* Animated Progress Ring */}
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" 
            viewBox="0 0 100 100"
          >
            <motion.circle 
              cx="50" cy="50" r="48" 
              fill="none" 
              stroke="var(--text-main)" 
              strokeWidth="0.5" 
              initial={{ opacity: 0.15 }}
              animate={ringControls}
            />
            <motion.circle 
              cx="50" cy="50" r="48" 
              fill="none" 
              stroke="var(--text-main)" 
              strokeWidth="0.8" 
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>

          {/* The Time */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: skipDelays ? 0 : 3.15, duration: 1.0 }}
            className={`${fontClass} text-text-main transition-all duration-500`}
            style={{ fontVariantNumeric: "tabular-nums", lineHeight: 1 }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          
          {/* Current Mode Text & Transition */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: skipDelays ? 0 : 3.0, duration: 1.0 }} className="absolute w-full" style={{ bottom: "25%" }}>
            <AnimatePresence mode="wait">
            {isTransitioning ? (
              <motion.div 
                key="transition"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center justify-center text-center w-full px-4"
              >
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-text-main font-medium mb-1.5 translate-y-[30%]">
                  {mode === 'WORK' ? 'Work Complete' : 'Rest Complete'}
                </span>
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-text-muted font-light">
                  {mode === 'WORK' ? `Take a ${breakMinutes} min break.` : `Ready for deep work.`}
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="mode"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-text-muted font-light text-center w-full px-4"
              >
                {mode === 'WORK' ? 'Deep Work Session' : 'Rest & Recover'}
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
          
          {/* Motivational Quote */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: skipDelays ? 0 : 3.3, duration: 1.0 }} className="absolute w-full flex justify-center" style={{ bottom: "14%" }}>
            <AnimatePresence mode="wait">
              {!isTransitioning && (
                <motion.div 
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 1 }}
                  className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-text-faint font-light text-center w-[65%]"
                >
                  "{quotes[quoteIndex]}"
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Session Indicator */}
        <div className="mt-4 flex items-center justify-center">
          <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-light text-text-faint">
            Current Session <span className="text-text-main opacity-90 ml-1">#{completedSessions + 1}</span>
          </span>
        </div>

        {/* Controls */}
        <div className="mt-[min(3vh,24px)] flex items-center gap-[min(4vw,32px)]">
          <button 
            onClick={resetTimer}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-border-main text-text-muted hover:text-text-main hover:border-text-muted hover:bg-card-bg transition-all duration-300"
            aria-label="Reset Timer"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>

          <button 
            onClick={() => {
              if (isActive) {
                playSFX('click');
              } else {
                playSFX('tick');
              }
              toggleTimer();
            }}
            className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border border-text-muted text-text-main hover:border-text-main hover:bg-card-bg active:scale-95 transition-all duration-300 relative overflow-hidden"
            aria-label={isActive ? "Pause Timer" : "Start Timer"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isActive ? 'pause' : 'play'}
                initial={{ opacity: 0, scale: 0.5, rotate: isActive ? 90 : -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: isActive ? -90 : 90 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className={`absolute flex items-center justify-center ${!isActive ? 'ml-1' : ''}`}
              >
                {isActive ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
              </motion.div>
            </AnimatePresence>
          </button>

          <button 
            onClick={toggleMuteAll}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border transition-all duration-300 ${
              !isMuted 
                ? 'border-text-muted text-text-main bg-card-bg' 
                : 'border-border-main text-text-muted hover:text-text-main hover:border-text-muted hover:bg-card-bg'
            }`}
            aria-label={isMuted ? "Unmute Sounds" : "Mute Sounds"}
          >
            {!isMuted ? <Volume2 size={16} strokeWidth={1.5} /> : <VolumeX size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Task Input & Mixer Trigger */}
      <div className="z-10 mt-auto flex flex-col items-center gap-[min(2vh,16px)] w-full max-w-sm">
        
        <div className="w-full flex flex-col items-center gap-2">
          {greeting && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: skipDelays ? 0 : 3.45, duration: 1.0 }}
              className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-text-faint font-light"
            >
              {greeting}
            </motion.span>
          )}
          <input 
          type="text" 
          placeholder="What are you focusing on?" 
          value={currentTask}
          onChange={handleTaskChange}
          spellCheck={false}
          className="w-full bg-transparent border-b border-border-subtle text-center text-[10px] md:text-xs tracking-[0.2em] font-light text-text-main placeholder-text-faint focus:outline-none focus:border-text-muted transition-colors pb-2 relative z-10"
        />
        </div>

        <button 
          onClick={() => setIsMixerOpen(true)}
          className={`flex items-center gap-2 px-5 py-2 md:py-2.5 border rounded-full transition-all duration-300 mb-1 ${
            !isMuted 
              ? 'border-border-main bg-card-bg text-text-main shadow-[0_0_15px_rgba(255,255,255,0.03)]' 
              : 'border-border-main bg-bg-modal text-text-muted hover:text-text-main hover:border-text-muted'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!isMuted ? (
              <motion.div
                key="waveform"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="flex items-end justify-center gap-[2px] h-[12px] w-[14px] pb-[1px]"
              >
                <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-[2px] bg-current rounded-full" />
                <motion.div animate={{ height: ["100%", "30%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-[2px] bg-current rounded-full" />
                <motion.div animate={{ height: ["60%", "100%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-[2px] bg-current rounded-full" />
              </motion.div>
            ) : (
              <motion.div
                key="headphones"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center h-[14px] w-[14px]"
              >
                <Headphones size={14} strokeWidth={1.5} />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-[9px] tracking-[0.2em] uppercase font-medium">Sound Mixer</span>
        </button>
      </div>

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 z-40 bg-backdrop cursor-pointer"
          />
        )}
        {isSettingsOpen && (
          <motion.div 
            key="settings-modal"
            initial={{ opacity: 0, y: '50%', x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: '-50%', x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: '50%', x: '-50%', scale: 0.95 }}
            className="absolute top-1/2 left-1/2 z-50 w-[90vw] max-w-md bg-bg-modal border border-border-main rounded-2xl p-6"
          >
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-faint hover:text-text-main transition-colors"
              aria-label="Close Settings"
            >
              <X size={16} strokeWidth={1} />
            </button>

            <h3 className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-6 font-light">Settings</h3>
            
            <div className="w-full max-w-sm flex flex-col gap-4">
              
              {/* Durations */}
              <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                <span className="text-[9px] tracking-[0.2em] text-text-muted uppercase">Duration (Min)</span>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[7px] text-text-faint uppercase tracking-widest">Work</span>
                    <input type="number" min="1" max="120" value={workMinutes} onChange={e => setWorkMinutes(Number(e.target.value) || 25)} className="bg-card-bg border border-border-main text-text-main rounded-md p-1.5 text-center w-14 text-xs font-light focus:outline-none focus:border-text-muted transition-colors" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[7px] text-text-faint uppercase tracking-widest">Rest</span>
                    <input type="number" min="1" max="60" value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value) || 5)} className="bg-card-bg border border-border-main text-text-main rounded-md p-1.5 text-center w-14 text-xs font-light focus:outline-none focus:border-text-muted transition-colors" />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                <span className="text-[9px] tracking-[0.2em] text-text-muted uppercase">Typography</span>
                <div className="flex bg-card-bg rounded-md p-0.5 border border-border-main">
                  <button onClick={() => handleFontChange('sans')} className={`px-3 py-1.5 rounded text-[8px] uppercase tracking-wider transition-all duration-300 ${timerFont === 'sans' ? 'bg-border-main text-text-main' : 'text-text-faint hover:text-text-muted'}`}>Modern</button>
                  <button onClick={() => handleFontChange('serif')} className={`px-3 py-1.5 rounded text-[8px] uppercase tracking-wider transition-all duration-300 ${timerFont === 'serif' ? 'bg-border-main text-text-main' : 'text-text-faint hover:text-text-muted'}`}>Classic</button>
                  <button onClick={() => handleFontChange('mono')} className={`px-3 py-1.5 rounded text-[8px] uppercase tracking-wider transition-all duration-300 ${timerFont === 'mono' ? 'bg-border-main text-text-main' : 'text-text-faint hover:text-text-muted'}`}>Digital</button>
                </div>
              </div>

              {/* Visual Theme */}
              <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                <span className="text-[9px] tracking-[0.2em] text-text-muted uppercase">Visual Theme</span>
                <div className="flex bg-card-bg rounded-md p-0.5 border border-border-main">
                  <button onClick={() => handleThemeChange('noir')} className={`px-3 py-1.5 rounded text-[8px] uppercase tracking-wider transition-all duration-300 ${visualTheme === 'noir' ? 'bg-border-main text-text-main' : 'text-text-faint hover:text-text-muted'}`}>Noir</button>
                  <button onClick={() => handleThemeChange('paper')} className={`px-3 py-1.5 rounded text-[8px] uppercase tracking-wider transition-all duration-300 ${visualTheme === 'paper' ? 'bg-border-main text-text-main' : 'text-text-faint hover:text-text-muted'}`}>Paper</button>
                  <button onClick={() => handleThemeChange('rose')} className={`px-3 py-1.5 rounded text-[8px] uppercase tracking-wider transition-all duration-300 ${visualTheme === 'rose' ? 'bg-border-main text-text-main' : 'text-text-faint hover:text-text-muted'}`}>Rose</button>
                </div>
              </div>

              {/* Automation */}
              <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                <span className="text-[9px] tracking-[0.2em] text-text-muted uppercase">Auto-Start</span>
                <div className="flex gap-4">
                  <button onClick={() => setAutoStartWork(!autoStartWork)} className={`flex items-center gap-1.5 text-[8px] uppercase tracking-widest transition-all duration-300 ${autoStartWork ? 'text-text-main' : 'text-text-faint hover:text-text-muted'}`}>
                    <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center transition-all ${autoStartWork ? 'bg-text-main border-text-main' : 'border-text-faint'}`}></div>
                    Work
                  </button>
                  <button onClick={() => setAutoStartBreak(!autoStartBreak)} className={`flex items-center gap-1.5 text-[8px] uppercase tracking-widest transition-all duration-300 ${autoStartBreak ? 'text-text-main' : 'text-text-faint hover:text-text-muted'}`}>
                    <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center transition-all ${autoStartBreak ? 'bg-text-main border-text-main' : 'border-text-faint'}`}></div>
                    Rest
                  </button>
                </div>
              </div>

              {/* About */}
              <div className="flex flex-col items-center justify-center pt-2">
                <span className="text-[10px] tracking-[0.3em] text-text-main font-light uppercase">Noir Focus</span>
                <span className="text-[8px] text-text-faint mt-1 tracking-widest uppercase">Version 1.0</span>
                <span className="text-[7px] text-text-muted mt-3 tracking-[0.2em] uppercase text-center max-w-[200px]">Designed for deep work and minimalist productivity.</span>
                <span className="text-[7px] text-text-muted mt-1 tracking-[0.2em] uppercase text-center">Developed by Kevin</span>
              </div>

            </div>
            
            <p className="mt-6 text-[7px] text-text-faint uppercase tracking-[0.3em] text-center">Changes will apply to the next session</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound Mixer Modal Overlay */}
      <AnimatePresence>
        {isMixerOpen && (
          <motion.div 
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMixerOpen(false)}
            className="absolute inset-0 z-40 bg-backdrop cursor-pointer"
          />
        )}
        {isMixerOpen && (
          <motion.div 
            key="modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute z-50 flex items-center justify-center inset-0 pointer-events-none"
          >
            <div className="w-[90vw] max-w-lg mx-auto flex flex-col relative bg-bg-modal border border-border-main rounded-2xl p-6 md:p-8 pointer-events-auto">
              
              <button 
                onClick={() => setIsMixerOpen(false)}
                className="absolute top-6 right-6 p-2 text-text-faint hover:text-text-main transition-colors z-20"
                aria-label="Close Sound Mixer"
              >
                <X size={20} strokeWidth={1} />
              </button>

              <h3 className="text-xs uppercase tracking-[0.3em] text-text-muted mb-6 font-light text-center w-full">Sound Mixer</h3>

              {/* Tabs */}
              <div className="flex w-full justify-center gap-6 md:gap-8 mb-6 border-b border-border-subtle pb-4">
                {SOUND_CATEGORIES.map(category => (
                  <button 
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`text-[9px] md:text-[10px] tracking-[0.2em] uppercase transition-colors relative flex items-center gap-2 ${activeTab === category.id ? 'text-text-main' : 'text-text-faint hover:text-text-muted'}`}
                  >
                    {category.name}
                    {/* Pulsing dot if any sound in this category is playing */}
                    {category.sounds.some(s => s.hook.isPlaying) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-text-main animate-pulse"></span>
                    )}
                    {/* Active tab indicator */}
                    {activeTab === category.id && (
                      <motion.div layoutId="activeTab" className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-text-main" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="w-full relative min-h-[180px]">
                {SOUND_CATEGORIES.map(category => (
                  <div 
                    key={category.id}
                    className={`w-full transition-opacity duration-300 ${activeTab === category.id ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                  >
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3">
                      {category.sounds.map(sound => {
                        const handleSoundToggle = () => {
                          if (category.id === 'instrumental' || category.id === 'spiritual') {
                            if (!sound.hook.isPlaying) {
                              // Turn off other sounds in exclusive categories
                              SOUND_CATEGORIES.forEach(c => {
                                if (c.id === 'instrumental' || c.id === 'spiritual') {
                                  c.sounds.forEach(s => {
                                    if (s.id !== sound.id && s.hook.isPlaying) {
                                      s.hook.toggle();
                                    }
                                  });
                                }
                              });
                            }
                          }
                          sound.hook.toggle();
                        };

                        return (
                          <div key={sound.id} className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all duration-300 relative ${sound.hook.isPlaying ? `border-border-main bg-card-bg ${(sound as any).colorText}` : 'border-border-subtle bg-transparent text-text-faint hover:border-border-main'}`}>
                            <button onClick={handleSoundToggle} className="flex flex-col items-center justify-center w-full pb-2 hover:text-text-main">
                              <sound.icon size={22} strokeWidth={1} className="mb-2" />
                              <span className="text-[9px] tracking-[0.1em] uppercase">{sound.name}</span>
                            </button>
                            <AnimatePresence>
                              {sound.hook.isPlaying && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                  className="flex flex-col items-center w-full mt-1"
                                >
                                  <input type="range" min="0" max="1" step="0.01" value={sound.hook.volume} onChange={(e) => sound.hook.setVolume(parseFloat(e.target.value))} className={`w-16 h-[1px] appearance-none rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full ${(sound as any).colorSlider}`} />
                                  <span className={`text-[8px] mt-2 font-mono tracking-wider ${(sound as any).colorValue}`}>{Math.round(sound.hook.volume * 100)}%</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                      );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </main>
    </>
  );
}
