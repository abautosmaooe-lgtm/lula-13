import React, { useState, useEffect } from 'react';
import {
  chiptune,
  TRACK_LIST,
  BGMTrack,
  AudioEngineState,
  TrackMetadata,
} from '../audio/chiptune';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  X,
  Radio,
  Lock,
  Unlock,
  Sparkles,
  Disc3,
  Headphones,
} from 'lucide-react';

interface SoundtrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundtrackModal: React.FC<SoundtrackModalProps> = ({ isOpen, onClose }) => {
  const [audioState, setAudioState] = useState<AudioEngineState>(chiptune.getState());
  const [activeTab, setActiveTab] = useState<'tracks' | 'info'>('tracks');

  useEffect(() => {
    const unsubscribe = chiptune.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const currentTrackMeta: TrackMetadata =
    TRACK_LIST.find((t) => t.id === (audioState.currentTrack || 'title')) || TRACK_LIST[0];

  const handlePlayTrack = (trackId: BGMTrack) => {
    chiptune.unlock();
    if (audioState.currentTrack === trackId && audioState.isPlaying) {
      chiptune.pauseMusic();
    } else {
      chiptune.startMusic(trackId, true);
    }
  };

  const handleTogglePlayPause = () => {
    chiptune.unlock();
    chiptune.toggleMusic();
  };

  const handleToggleLock = (trackId: BGMTrack) => {
    if (audioState.lockedTrack === trackId) {
      chiptune.lockCustomTrack(null);
    } else {
      chiptune.lockCustomTrack(trackId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-4 border-red-600 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.5)] text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Retro Header with Cassette Player vibe */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-800 via-red-700 to-red-900 border-b-2 border-yellow-400">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-yellow-300 animate-pulse" />
            <div>
              <h2 className="text-xs md:text-sm font-pixel font-bold text-yellow-300 tracking-wider flex items-center gap-1.5">
                <span>TRILHA SONORA CHIPTUNE 8-BIT</span>
                <span className="text-[9px] bg-red-950/80 px-1.5 py-0.5 rounded text-white border border-yellow-400/50">
                  ESTÉREO
                </span>
              </h2>
              <p className="text-[9px] text-red-100 font-retro tracking-wide">
                Músicas e Hinos Históricos do Brasil dos Trabalhadores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-yellow-300 hover:text-white bg-red-950/60 hover:bg-red-900 border border-yellow-400/60 rounded cursor-pointer transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cassette / Boombox Visualizer Display */}
        <div className="p-3 bg-slate-950 border-b border-red-950/80">
          <div className="p-3 bg-black/90 rounded border-2 border-yellow-500/40 relative overflow-hidden flex flex-col gap-2">
            {/* Ambient Red Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

            {/* Now Playing Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full border border-yellow-400 flex items-center justify-center bg-red-950 ${
                    audioState.isPlaying && !audioState.isMuted ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  <Disc3 className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <div className="text-[8px] text-zinc-400 font-pixel uppercase tracking-widest flex items-center gap-1">
                    <span>{audioState.isPlaying && !audioState.isMuted ? 'TOCANDO AGORA' : 'PAUSADO'}</span>
                    {audioState.lockedTrack && (
                      <span className="text-yellow-400 text-[8px] font-bold">[FIXADA]</span>
                    )}
                  </div>
                  <h3 className="text-xs md:text-sm font-pixel font-bold text-yellow-300 truncate max-w-[280px]">
                    {currentTrackMeta.title}
                  </h3>
                </div>
              </div>

              {/* Animated Equalizer Bars */}
              <div className="flex items-end gap-1 h-6 px-2 py-1 bg-slate-900/80 rounded border border-zinc-800">
                {[60, 90, 40, 100, 75, 45, 85].map((height, i) => (
                  <span
                    key={i}
                    className={`w-1 bg-yellow-400 rounded-t transition-all ${
                      audioState.isPlaying && !audioState.isMuted
                        ? 'animate-pulse'
                        : 'opacity-30'
                    }`}
                    style={{
                      height: audioState.isPlaying && !audioState.isMuted ? `${height}%` : '20%',
                      animationDuration: `${0.3 + (i % 3) * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Player Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTogglePlayPause}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-[10px] font-bold rounded flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  {audioState.isPlaying && !audioState.isMuted ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>PAUSAR</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>TOCAR</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => chiptune.toggleMute()}
                  className={`p-1.5 rounded border transition cursor-pointer ${
                    audioState.isMuted
                      ? 'bg-red-950/80 border-red-500 text-red-300'
                      : 'bg-slate-800 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                  title={audioState.isMuted ? 'Desmutar' : 'Mutar'}
                >
                  {audioState.isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <Volume1 className="w-3 h-3 text-zinc-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioState.bgmVolume}
                  onChange={(e) => chiptune.setBgmVolume(parseFloat(e.target.value))}
                  className="w-20 md:w-28 accent-yellow-400 cursor-pointer"
                  title="Volume da Música"
                />
                <span className="text-[9px] font-mono text-zinc-400 w-8">
                  {Math.round(audioState.bgmVolume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Músicas / História das Trilhas */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 pt-2 text-[10px] font-pixel">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-3 py-1.5 rounded-t border-t border-l border-r transition cursor-pointer ${
              activeTab === 'tracks'
                ? 'bg-slate-900 border-red-500 text-yellow-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MÚSICAS DA TRILHA ({TRACK_LIST.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-t border-t border-l border-r transition cursor-pointer ${
              activeTab === 'info'
                ? 'bg-slate-900 border-red-500 text-yellow-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            SOBRE A TRILHA RETRÔ
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {activeTab === 'tracks' ? (
            TRACK_LIST.map((track) => {
              const isSelected = audioState.currentTrack === track.id;
              const isCurrentlyPlaying = isSelected && audioState.isPlaying && !audioState.isMuted;
              const isLocked = audioState.lockedTrack === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-2.5 rounded-lg border-2 transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-red-950/50 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)]'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handlePlayTrack(track.id)}
                        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                          isCurrentlyPlaying
                            ? 'bg-yellow-400 text-slate-950 hover:bg-yellow-300'
                            : 'bg-red-600 text-white hover:bg-red-500'
                        }`}
                        title={isCurrentlyPlaying ? 'Pausar' : 'Tocar Esta Música'}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-pixel font-bold text-white">
                            {track.title}
                          </h4>
                          <span className="text-[8px] font-pixel px-1.5 py-0.2 rounded bg-red-900/90 text-yellow-300 border border-yellow-500/40">
                            {track.badge}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">
                            ({track.year})
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-300 font-retro leading-snug mt-0.5">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    {/* Lock favorite toggle */}
                    <button
                      onClick={() => handleToggleLock(track.id)}
                      className={`p-1.5 rounded border transition cursor-pointer flex items-center gap-1 text-[9px] font-pixel shrink-0 ${
                        isLocked
                          ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold'
                          : 'bg-slate-900 border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                      title={
                        isLocked
                          ? 'Esta música está fixada para tocar em todas as fases!'
                          : 'Fixar para tocar sempre esta música'
                      }
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span className="hidden sm:inline">FIXADA</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span className="hidden sm:inline">FIXAR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-3 text-[11px] font-retro text-zinc-200 leading-relaxed">
              <div className="flex items-center gap-2 text-yellow-300 font-pixel text-xs">
                <Sparkles className="w-4 h-4" />
                <span>COMO FUNCIONA A TRILHA SONORA RETRÔ</span>
              </div>
              <p>
                A trilha sonora de <strong>Lulalá - Caminho da Estrela</strong> foi recriada nota por nota em <strong>sintetizador chiptune nativo de 8-bits</strong> (Web Audio API), emulando as sonoridades dos processadores sonoros clássicos do Super Nintendo e Nintendo Entertainment System (NES/Famicom).
              </p>
              <div className="p-2 bg-slate-900/90 rounded border border-yellow-500/30 text-yellow-200">
                <p className="font-bold font-pixel text-[9px] mb-1 text-yellow-300">
                  ★ HINOS HISTÓRICOS INCLUÍDOS:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[10px]">
                  <li><strong>Lula Lá (1989):</strong> O clássico jingle composto por Hilton Acioli, que marcou a redemocratização e a esperança de todo um país.</li>
                  <li><strong>Olê, Olê, Olá - Lula, Lula:</strong> A vibrante marcha popular cantada nas ruas e passeatas da vitória.</li>
                  <li><strong>ABC Metalúrgico:</strong> Síntese de percussão e esteiras industriais celebrando a força operária de São Bernardo do Campo.</li>
                </ul>
              </div>
              <p className="text-zinc-400 text-[10px]">
                Dica: Você pode <strong>FIXAR</strong> sua música predileta usando o botão com cadeado para que ela continue tocando sem interrupções em todas as fases do jogo!
              </p>
            </div>
          )}
        </div>

        {/* Footer controls & Close */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-zinc-400 font-pixel text-[9px]">
            {audioState.lockedTrack
              ? '★ MODO FIXO: MÚSICA REPETE EM TODAS AS FASES'
              : '★ MODO DINÂMICO: MÚSICA MUDA CONFORME A FASE'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-pixel font-bold rounded border border-yellow-400 transition cursor-pointer"
          >
            CONCLUIR
          </button>
        </div>
      </div>
    </div>
  );
};
