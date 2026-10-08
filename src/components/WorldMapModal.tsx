import React, { useState } from 'react';
import { LEVELS, LevelData } from '../game/levels';
import { chiptune } from '../audio/chiptune';
import {
  MapPin,
  Star,
  Award,
  Lock,
  CheckCircle2,
  Play,
  Sparkles,
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Flame,
  Zap,
  Info
} from 'lucide-react';

interface WorldMapModalProps {
  currentLevelIndex: number;
  highestUnlockedLevel?: number;
  onSelectLevel: (levelIndex: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  currentLevelIndex,
  highestUnlockedLevel = 0,
  onSelectLevel,
  onClose,
  isOpen,
}) => {
  // Allow player to browse all levels; defaults to current or highest unlocked
  const [selectedIdx, setSelectedIdx] = useState<number>(currentLevelIndex);

  if (!isOpen) return null;

  const currentLevel = LEVELS[selectedIdx] || LEVELS[0];
  const isUnlocked = selectedIdx <= Math.max(highestUnlockedLevel, currentLevelIndex);

  const stageIcons = ['🏭', '📜', '🚐', '🎓', '🏛️'];
  const stageRegions = [
    'Grande ABC, São Paulo',
    'Praça da Sé e Brasília',
    'Caravanas por todo o Brasil',
    'Bacia de Santos e Sertão Nordestino',
    'Palácio do Planalto, Brasília'
  ];

  const handleChooseLevel = (idx: number) => {
    chiptune.playCoin();
    setSelectedIdx(idx);
  };

  const handlePlayLevel = () => {
    chiptune.playJump();
    chiptune.speakVoice('Bora lá, companheiro!');
    onSelectLevel(selectedIdx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none font-pixel">
      <div className="relative w-full max-w-4xl bg-slate-950 border-4 border-yellow-400 rounded-xl shadow-[0_0_35px_rgba(250,204,21,0.3)] flex flex-col max-h-[95vh] overflow-hidden text-white">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950 via-red-900 to-slate-950 border-b-2 border-yellow-400/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Compass className="w-5 h-5 text-red-900 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-wider text-yellow-300 drop-shadow">
                MAPA DAS FASES & EVOLUÇÃO HISTÓRICA
              </h2>
              <p className="text-[9px] text-zinc-300 font-retro tracking-wide">
                Navegue pelas 5 eras da trajetória de Lula e da redemocratização brasileira
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-yellow-300 border border-yellow-400/50 transition cursor-pointer"
            title="Fechar Mapa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content: Map Overworld Track & Detail Panel */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          
          {/* Overworld Level Route Track (Super Mario World Style Path) */}
          <div className="relative bg-slate-900/80 border-2 border-yellow-400/40 rounded-xl p-3 sm:p-4 shadow-inner overflow-x-auto">
            <div className="text-[9px] sm:text-[10px] text-yellow-400/90 font-bold mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                LINHA DO TEMPO: O CAMINHO DA ESTRELA
              </span>
              <span className="text-zinc-400 text-[8px] font-retro">
                Clique em uma fase para visualizar seus desafios e história
              </span>
            </div>

            {/* Connecting Track with 5 Nodes */}
            <div className="relative flex items-center justify-between min-w-[560px] py-4 px-6">
              {/* Golden Route Connecting Line */}
              <div className="absolute top-1/2 left-8 right-8 h-2 -translate-y-1/2 bg-yellow-950 rounded-full border border-yellow-500/40 z-0 shadow-inner">
                {/* Progress Fill */}
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-yellow-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${((Math.max(highestUnlockedLevel, currentLevelIndex)) / (LEVELS.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Phase Nodes */}
              {LEVELS.map((lvl, idx) => {
                const nodeUnlocked = idx <= Math.max(highestUnlockedLevel, currentLevelIndex);
                const isSelected = selectedIdx === idx;
                const isCurrent = currentLevelIndex === idx;
                const isCleared = idx < currentLevelIndex;

                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleChooseLevel(idx)}
                    className={`relative z-10 flex flex-col items-center group cursor-pointer transition-transform ${
                      isSelected ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {/* Floating Lula Marker on current or selected node */}
                    {isSelected && (
                      <div className="absolute -top-7 animate-bounce flex flex-col items-center pointer-events-none">
                        <span className="text-[8px] font-pixel text-yellow-300 bg-red-800 px-1.5 py-0.5 rounded border border-yellow-400 shadow">
                          LULA AQUI
                        </span>
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-red-800" />
                      </div>
                    )}

                    {/* Node Circle */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-3 transition shadow-lg ${
                        isSelected
                          ? 'bg-yellow-400 border-white text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                          : isCurrent
                          ? 'bg-red-700 border-yellow-300 text-white animate-pulse'
                          : isCleared
                          ? 'bg-emerald-800 border-emerald-400 text-white'
                          : nodeUnlocked
                          ? 'bg-slate-800 border-zinc-500 text-zinc-300'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                      }`}
                    >
                      <span className="text-base select-none leading-none">
                        {stageIcons[idx]}
                      </span>
                      <span className="text-[8px] font-black mt-0.5">
                        M{lvl.id}
                      </span>
                    </div>

                    {/* Node Label */}
                    <div className="mt-2 flex flex-col items-center text-center max-w-[90px]">
                      <span className={`text-[8px] sm:text-[9px] font-bold truncate w-full ${
                        isSelected ? 'text-yellow-300' : 'text-zinc-300'
                      }`}>
                        {lvl.era}
                      </span>
                      {isCleared ? (
                        <span className="text-[7px] text-emerald-400 flex items-center gap-0.5 font-retro">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Vencida
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[7px] text-yellow-300 font-retro">
                          ★ Fase Atual
                        </span>
                      ) : !nodeUnlocked ? (
                        <span className="text-[7px] text-zinc-500 flex items-center gap-0.5 font-retro">
                          <Lock className="w-2.5 h-2.5" /> Bloqueada
                        </span>
                      ) : (
                        <span className="text-[7px] text-sky-400 font-retro">
                          Disponível
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phase Profile & Historical Evolution Details Panel */}
          <div className="bg-slate-900/90 border-2 border-yellow-400/50 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-6 shadow-xl">
            
            {/* Left: Phase Overview Card */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Era & World Title */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-red-700 text-white rounded text-[9px] font-bold border border-red-500">
                    MUNDO {currentLevel.id} DE {LEVELS.length}
                  </span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-[9px] font-bold border border-yellow-400/50">
                    ERA: {currentLevel.era}
                  </span>
                  <span className="text-zinc-400 text-[9px] font-retro flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {stageRegions[selectedIdx]}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-yellow-300 tracking-wide mb-1">
                  {currentLevel.name}
                </h3>
                <h4 className="text-[11px] sm:text-xs text-zinc-300 font-retro mb-3">
                  {currentLevel.subtitle}
                </h4>

                {/* Historical Highlight Banner */}
                <div className="bg-red-950/70 border-l-4 border-yellow-400 p-2.5 rounded-r mb-3 text-[10px] text-yellow-100 font-retro leading-relaxed">
                  <span className="font-bold text-yellow-300 block mb-0.5 font-pixel text-[9px]">
                    ★ MARCO HISTÓRICO DA EVOLUÇÃO:
                  </span>
                  {currentLevel.factSheet.highlight}
                </div>

                {/* Brief Historical Narrative */}
                <p className="text-[10px] sm:text-[11px] text-zinc-300 font-retro leading-relaxed line-clamp-4">
                  {currentLevel.factSheet.description}
                </p>
              </div>

              {/* Stage Attributes Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-zinc-800 text-[8px] sm:text-[9px]">
                <div className="flex items-center gap-1 bg-zinc-800/80 px-2 py-1 rounded text-zinc-300">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>{currentLevel.fires?.length || 0} Chamas de Fogo</span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-800/80 px-2 py-1 rounded text-zinc-300">
                  <Zap className="w-3 h-3 text-red-400" />
                  <span>{currentLevel.enemies?.length || 0} Inimigos / Opositores</span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-800/80 px-2 py-1 rounded text-zinc-300">
                  <Award className="w-3 h-3 text-yellow-400" />
                  <span>Chefe: {currentLevel.boss?.name || 'Inimigo Histórico'}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions & Play Trigger */}
            <div className="w-full md:w-64 flex flex-col justify-between p-3.5 bg-black/60 rounded-xl border border-yellow-400/30">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-zinc-400 font-pixel text-center">
                  STATUS DA MISSÃO
                </span>

                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-zinc-900/90 border border-zinc-700 text-center">
                  <span className="text-3xl mb-1">{stageIcons[selectedIdx]}</span>
                  <span className="text-[10px] font-bold text-yellow-300">
                    {currentLevel.name.split(':')[1] || currentLevel.name}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-retro mt-0.5">
                    Tempo Limite: {currentLevel.timeLimit} segundos
                  </span>
                </div>

                <div className="text-[8px] text-zinc-300 font-retro text-center leading-tight px-1">
                  {isUnlocked
                    ? 'Fase pronta para jogar. Domine as chamas e derrote os inimigos!'
                    : 'Fase bloqueada. Progrida pelas fases anteriores para desbloquear.'}
                </div>
              </div>

              {/* Play Button */}
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={handlePlayLevel}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg border-2 border-yellow-400 shadow-[2px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
                >
                  <Play className="w-4 h-4 fill-current text-yellow-300" />
                  <span>JOGAR ESTA FASE</span>
                </button>

                {/* Quick Next/Prev Phase Selectors */}
                <div className="flex items-center justify-between gap-1.5 text-[8px]">
                  <button
                    disabled={selectedIdx <= 0}
                    onClick={() => handleChooseLevel(Math.max(0, selectedIdx - 1))}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-3 h-3" /> FASE ANTERIOR
                  </button>
                  <button
                    disabled={selectedIdx >= LEVELS.length - 1}
                    onClick={() => handleChooseLevel(Math.min(LEVELS.length - 1, selectedIdx + 1))}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    PRÓXIMA <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Tip */}
        <div className="px-4 py-2 bg-slate-950 border-t border-yellow-400/40 flex items-center justify-between text-[9px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">DICA DO MAPA:</span>
            <span>Use o mapa a qualquer momento para revisitar momentos históricos e bater seus recordes!</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-white underline cursor-pointer text-[8px]"
          >
            Voltar ao Jogo
          </button>
        </div>

      </div>
    </div>
  );
};
