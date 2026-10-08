import React, { useEffect, useRef, useState } from 'react';
import { SpriteRenderer } from '../game/sprites';
import {
  Gamepad2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Star,
  Sparkles,
  Award,
  Music,
  Radio,
  Sliders,
  Compass,
} from 'lucide-react';
import { chiptune, AudioEngineState, TRACK_LIST } from '../audio/chiptune';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  gamepadName: string;
  onOpenFeitos?: () => void;
  onOpenSoundtrack?: () => void;
  onOpenWorldMap?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
  gamepadName,
  onOpenFeitos,
  onOpenSoundtrack,
  onOpenWorldMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioState, setAudioState] = useState<AudioEngineState>(chiptune.getState());

  useEffect(() => {
    const unsub = chiptune.subscribe((st) => {
      setAudioState({ ...st });
    });
    return unsub;
  }, []);

  // Live animated pixel art backdrop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animTime = 0;

    const render = () => {
      animTime += 0.016;
      ctx.clearRect(0, 0, 640, 380);

      // 1. Draw Brasília Planalto backdrop with twin towers & domes
      SpriteRenderer.drawBackground(ctx, 0, 640, 380, animTime, 'planalto');

      // 2. Draw Grass Ground at bottom
      for (let i = 0; i < 20; i++) {
        SpriteRenderer.drawGroundBlock(ctx, i * 32, 380 - 48, 32, true);
        SpriteRenderer.drawGroundBlock(ctx, i * 32, 380 - 16, 32, false);
      }

      // 3. Draw Lula with Heroic Cape waving and smiling
      SpriteRenderer.drawLula(
        ctx,
        306,
        380 - 88,
        28,
        40,
        true,
        'victory',
        animTime,
        true,   // Super Lula with Red Cape!
        false,  // flying
        false,
        0,
        'planalto'
      );

      // Draw two floating red stars on either side
      SpriteRenderer.drawEstrelaVermelha(ctx, 230, 260 + Math.sin(animTime * 4) * 4, 24, animTime);
      SpriteRenderer.drawEstrelaVermelha(ctx, 380, 260 + Math.cos(animTime * 4) * 4, 24, animTime);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleTogglePlayMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    chiptune.unlock();
    if (audioState.isPlaying && !audioState.isMuted) {
      chiptune.pauseMusic();
    } else {
      if (audioState.isMuted) {
        chiptune.setMuted(false);
      }
      chiptune.startMusic(audioState.currentTrack || 'title', true);
    }
  };

  const currentTrackTitle =
    TRACK_LIST.find((t) => t.id === (audioState.currentTrack || 'title'))?.title ||
    'Lula Lá (Brilha Uma Estrela)';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden bg-[#60a5fa] select-none">
      {/* Background canvas for live animated pixel art scenery */}
      <canvas
        ref={canvasRef}
        width={640}
        height={380}
        className="absolute inset-0 w-full h-full object-cover pixelated"
      />

      {/* Top Header bar with sound, soundtrack player & gamepad status */}
      <div className="relative z-10 w-full flex items-center justify-between px-3 md:px-4 py-2 bg-black/50 backdrop-blur-sm text-xs border-b border-red-500/40 font-pixel">
        <div className="flex items-center gap-2">
          {gamepadName ? (
            <span className="flex items-center gap-1.5 text-emerald-400 animate-pulse text-[10px]">
              <Gamepad2 className="w-4 h-4" />
              <span>JOYSTICK CONECTADO</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-red-200 text-[10px]">
              <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span>LULALÁ - CAMINHO DA ESTRELA</span>
            </span>
          )}
        </div>

        {/* Audio & Soundtrack Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Quick Soundtrack Toggle Button */}
          <button
            onClick={handleTogglePlayMusic}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border cursor-pointer text-[9px] md:text-[10px] font-pixel transition ${
              audioState.isPlaying && !audioState.isMuted
                ? 'bg-red-900/90 border-yellow-400 text-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                : 'bg-black/60 border-zinc-600 text-zinc-300 hover:text-white'
            }`}
            title="Tocar ou Pausar a Trilha Sonora"
          >
            {audioState.isPlaying && !audioState.isMuted ? (
              <>
                <Pause className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="animate-pulse hidden sm:inline">TOCANDO:</span>
                <span className="truncate max-w-[110px] md:max-w-[160px] text-yellow-200">
                  {currentTrackTitle.split('(')[0]}
                </span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-yellow-400 fill-current" />
                <span>TOCAR TRILHA</span>
              </>
            )}
          </button>

          {/* Open full Soundtrack Jukebox Modal */}
          {onOpenSoundtrack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSoundtrack();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/60 cursor-pointer text-[9px] md:text-[10px] font-pixel transition"
              title="Abrir Central de Músicas e Ajustar Volume"
            >
              <Music className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden md:inline">MÚSICAS</span>
            </button>
          )}

          {/* Mute Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="flex items-center gap-1 text-yellow-300 hover:text-yellow-100 transition p-1 md:px-2 md:py-1 rounded bg-black/40 border border-yellow-500/30 cursor-pointer text-[10px]"
            title={isMuted ? 'Ativar Som' : 'Mutar Som'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden lg:inline">{isMuted ? 'MUDO' : 'SOM ON'}</span>
          </button>
        </div>
      </div>

      {/* Center Title Logo Styled like Super Mario World */}
      <div className="relative z-10 flex flex-col items-center text-center mt-1 pointer-events-none">
        {/* Top Emblem */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-red-700/80 text-white font-pixel text-[9px] rounded-full border border-yellow-400 shadow-md mb-1">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span>O HERÓI DO TRABALHADOR</span>
        </div>

        {/* "LULALÁ" Multi-color 3D Pixel Title with Star */}
        <div className="flex items-center justify-center text-5xl md:text-7xl font-pixel font-black tracking-tight my-0.5 drop-shadow-[0_6px_0_#000000]">
          <span className="text-[#dc2626] drop-shadow-[3px_3px_0_#7f1d1d]">L</span>
          <span className="text-[#facc15] drop-shadow-[3px_3px_0_#ca8a04]">U</span>
          <span className="text-[#ffffff] drop-shadow-[3px_3px_0_#94a3b8]">L</span>
          <span className="text-[#dc2626] drop-shadow-[3px_3px_0_#7f1d1d]">A</span>
          <span className="text-[#facc15] drop-shadow-[3px_3px_0_#ca8a04] transform -rotate-6">L</span>
          <span className="text-[#22c55e] drop-shadow-[3px_3px_0_#15803d]">Á</span>
          <span className="text-yellow-400 ml-1 text-4xl animate-bounce">★</span>
        </div>

        {/* Subtitle Banner */}
        <div className="text-xs md:text-sm font-pixel tracking-widest text-yellow-300 drop-shadow-[0_3px_0_#000000] font-bold uppercase bg-red-900/80 px-4 py-1 rounded border border-yellow-400/60 mt-0.5">
          CAMINHO DA ESTRELA
        </div>
      </div>

      {/* Action Buttons & Soundtrack Banner */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 my-auto pointer-events-auto">
        {/* Main Start Button */}
        <button
          onClick={onStart}
          className="group relative px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs md:text-sm font-bold tracking-wider rounded border-4 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current text-yellow-300" />
          <span className="animate-pulse">APERTE Z PARA COMEÇAR</span>
        </button>

        {/* Soundtrack & Feats Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Prominent Soundtrack Button */}
          <button
            onClick={handleTogglePlayMusic}
            className={`px-3.5 py-1.5 font-pixel text-[10px] font-bold rounded border-2 shadow-md flex items-center gap-1.5 transition hover:scale-105 cursor-pointer ${
              audioState.isPlaying && !audioState.isMuted
                ? 'bg-red-700 hover:bg-red-600 text-yellow-300 border-yellow-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-yellow-300 animate-pulse'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-yellow-300" />
            <span>
              {audioState.isPlaying && !audioState.isMuted
                ? '🎵 TOCANDO TRILHA DE FUNDO'
                : '▶ OUVIR TRILHA SONORA AGORA'}
            </span>
          </button>

          {onOpenSoundtrack && (
            <button
              onClick={onOpenSoundtrack}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-yellow-300 font-pixel text-[10px] font-bold rounded border-2 border-yellow-400/80 shadow-md flex items-center gap-1.5 transition hover:scale-105 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-yellow-400" />
              <span>AJUSTAR MÚSICAS & VOLUME</span>
            </button>
          )}

          {onOpenFeitos && (
            <button
              onClick={onOpenFeitos}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel text-[10px] font-black rounded border-2 border-yellow-200 shadow-md flex items-center gap-1.5 transition hover:scale-105 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-red-700" />
              <span>★ CONHEÇA OS FEITOS DO LULA ★</span>
            </button>
          )}

          {onOpenWorldMap && (
            <button
              onClick={onOpenWorldMap}
              className="px-3.5 py-1.5 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-yellow-200 font-pixel text-[10px] font-black rounded border-2 border-yellow-400 shadow-md flex items-center gap-1.5 transition hover:scale-105 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
              <span>🗺️ MAPA DAS FASES & EVOLUÇÃO</span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-white/95 font-pixel drop-shadow-[0_2px_0_#000000]">
            (ou clique na tela / aperte A no joystick)
          </span>
          <span className="text-[9px] text-yellow-300 font-pixel bg-red-950/90 px-3 py-1 rounded border border-yellow-400/60 shadow">
            ★ NOVO PODER: Segure ⬇ e aperte PULAR para o GIRO ESTRELAR SONIC (ATROPELA TUDO!)
          </span>
        </div>
      </div>

      {/* Historical Description of Lula's Feats */}
      <div className="relative z-10 w-full px-4 text-center py-2 bg-black/60 backdrop-blur-sm border-t border-red-500/40">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-0.5">
          <p className="text-[9px] md:text-[10px] text-yellow-300 font-pixel font-bold drop-shadow-[0_2px_0_#000000]">
            ★ OS GRANDES FEITOS HISTÓRICOS DE LULA NO GOVERNO ★
          </p>
          <p className="text-[10px] md:text-[11px] text-white/95 font-retro tracking-wide drop-shadow-[0_2px_0_#000000] leading-snug">
            Criação do Bolsa Família e retirada do Brasil do Mapa da Fome da ONU • Expansão de 18 Universidades Federais com Prouni e Reuni • Transposição do Rio São Francisco levando água ao sertão • Minha Casa Minha Vida • Descoberta do Pré-Sal com recursos para Educação • Mais de 15 milhões de empregos e preservação contra incêndios florestais!
          </p>
        </div>
      </div>
    </div>
  );
};
