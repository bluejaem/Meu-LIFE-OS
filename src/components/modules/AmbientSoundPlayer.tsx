import { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, Volume1, VolumeX, 
  CloudRain, Radio, Wind, Coffee, Headphones
} from 'lucide-react';
import { ambientSound, SOUND_OPTIONS, SoundType } from '@/lib/ambientSound';
import { cn } from '@/lib/utils';

interface AmbientSoundPlayerProps {
  isPomodoroRunning: boolean;
}

export function AmbientSoundPlayer({ isPomodoroRunning }: AmbientSoundPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundType>('rain');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);

  // 1. Pausa o áudio automaticamente se o Pomodoro pausar
  useEffect(() => {
    if (!isPomodoroRunning && isPlaying) {
      ambientSound.stop();
      setIsPlaying(false);
    }
  }, [isPomodoroRunning, isPlaying]);

  // 2. Limpeza segura ao desmontar o componente
  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      ambientSound.stop();
      setIsPlaying(false);
    } else {
      ambientSound.play(selectedSound, isMuted ? 0 : volume);
      setIsPlaying(true);
    }
  };

  const handleSelectSound = (id: SoundType) => {
    setSelectedSound(id);
    if (isPlaying) {
      ambientSound.play(id, isMuted ? 0 : volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    ambientSound.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const restoreVol = prevVolume > 0 ? prevVolume : 0.5;
      setVolume(restoreVol);
      ambientSound.setVolume(restoreVol);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
      ambientSound.setVolume(0);
    }
  };

  const getSoundIcon = (id: SoundType) => {
    switch (id) {
      case 'rain': return <CloudRain size={16} />;
      case 'lofi': return <Radio size={16} />;
      case 'whitenoise': return <Wind size={16} />;
      case 'cafe': return <Coffee size={16} />;
    }
  };

  return (
    <div className="w-full max-w-md glass-panel p-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl flex flex-col gap-3 shadow-xl transition-all duration-300">
      {/* Header com título e status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500",
            isPlaying ? "bg-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/20" : "bg-white/5 text-slate-400"
          )}>
            <Headphones size={15} className={isPlaying ? "animate-pulse" : ""} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              Modo Foco Gentil
              {isPlaying && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded-full normal-case">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Reproduzindo
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400">Sons relaxantes para ancorar sua atenção</p>
          </div>
        </div>

        {/* Equalizer Visual sutil quando ativo */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 px-2 py-1 bg-white/5 rounded-md">
            <span className="w-0.5 h-full bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-0.5 h-2/3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
            <span className="w-0.5 h-4/5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.4s]" />
            <span className="w-0.5 h-1/2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
          </div>
        )}
      </div>

      {/* Seletor de Sons (Cards horizontais compactos) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {SOUND_OPTIONS.map(sound => {
          const isSelected = selectedSound === sound.id;
          return (
            <button
              key={sound.id}
              onClick={() => handleSelectSound(sound.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all duration-200 group relative",
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500/40 text-white shadow-sm"
                  : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200"
              )}
            >
              <div className={cn(
                "mb-1 transition-transform group-hover:scale-110",
                isSelected ? "text-indigo-400" : "text-slate-400"
              )}>
                {getSoundIcon(sound.id)}
              </div>
              <span className="text-[11px] font-semibold tracking-tight">{sound.name}</span>
            </button>
          );
        })}
      </div>

      {/* Controles de Reprodução e Volume */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-200 shadow-md",
            isPlaying
              ? "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-emerald-500/20"
              : "bg-white/10 text-white hover:bg-white/20 active:scale-95"
          )}
        >
          {isPlaying ? (
            <>
              <Pause size={13} fill="currentColor" />
              <span>Pausar Som</span>
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" className="ml-0.5" />
              <span>Ouvir Som</span>
            </>
          )}
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[170px]">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={isMuted ? "Desmutar" : "Mutar"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={15} />
            ) : volume < 0.5 ? (
              <Volume1 size={15} />
            ) : (
              <Volume2 size={15} />
            )}
          </button>
          
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={e => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
          <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
