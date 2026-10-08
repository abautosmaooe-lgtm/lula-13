/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { PlatformerEngine, GameState, PlayerMod } from './game/engine';
import { InputManager } from './input/inputManager';
import { TitleScreen } from './components/TitleScreen';
import { DossierModal } from './components/DossierModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { TouchController } from './components/TouchController';
import { ModSelectModal } from './components/ModSelectModal';
import { IPhoneInstallModal } from './components/IPhoneInstallModal';
import { FeitosLulaModal } from './components/FeitosLulaModal';
import { SoundtrackModal } from './components/SoundtrackModal';
import { WorldMapModal } from './components/WorldMapModal';
import { chiptune } from './audio/chiptune';
import { narrator } from './audio/narrator';
import { LEVELS } from './game/levels';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Smartphone,
  Zap,
  Dumbbell,
  Droplets,
  Heart,
  Star,
  Users,
  Award,
  Music,
  Compass,
} from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PlatformerEngine | null>(null);
  const inputManagerRef = useRef<InputManager>(new InputManager());

  const [currentScreen, setCurrentScreen] = useState<'title' | 'game'>('title');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isMuted, setIsMuted] = useState(chiptune.getMuted());
  const [showTouchControls, setShowTouchControls] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showFeitosModal, setShowFeitosModal] = useState(false);
  const [showSoundtrackModal, setShowSoundtrackModal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('lulala_highest_level') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [gamepadName, setGamepadName] = useState('');

  // Auto-unlock audio and optionally start title theme on first interaction
  useEffect(() => {
    const handleFirstGesture = () => {
      chiptune.unlock();
      if (!chiptune.getMuted() && !chiptune.isMusicPlaying() && currentScreen === 'title') {
        chiptune.startMusic('title');
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [currentScreen]);

  // Detect touch / mobile device on mount
  useEffect(() => {
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 1024;

    setShowTouchControls(isMobileDevice);
  }, []);

  // Progression sync: record highest reached/unlocked level
  useEffect(() => {
    if (gameState && gameState.levelIndex > highestUnlockedLevel) {
      setHighestUnlockedLevel(gameState.levelIndex);
      try {
        localStorage.setItem('lulala_highest_level', String(gameState.levelIndex));
      } catch {
        // Ignore storage error
      }
    }
  }, [gameState?.levelIndex, highestUnlockedLevel]);

  // Keyboard shortcut for quick mod selection (keys 1, 2, 3 or M) and World Map (Tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowWorldMap(prev => !prev);
        return;
      }

      if (currentScreen !== 'game' || !engineRef.current) return;

      if (e.key === 'm' || e.key === 'M') {
        // Enquanto o personagem está no modo normal, nada acontece
        if (engineRef.current.player.activeMod === 'none' && !engineRef.current.player.isSuper) {
          return;
        }
        engineRef.current.openModSelector();
      } else if (e.key === '1' || e.key === '2' || e.key === '3') {
        // Enquanto o personagem está no modo normal, nada acontece se apertar 1, 2 ou 3
        if (engineRef.current.player.activeMod === 'none' && !engineRef.current.player.isSuper) {
          return;
        }
        if (e.key === '1') engineRef.current.setPlayerMod('heroi_voo');
        else if (e.key === '2') engineRef.current.setPlayerMod('marombeiro');
        else if (e.key === '3') engineRef.current.setPlayerMod('lancador_agua');
      } else if (e.key === 'p' || e.key === 'P') {
        engineRef.current.togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen]);

  // Main Game Loop Hook
  useEffect(() => {
    if (currentScreen !== 'game') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new PlatformerEngine(canvas, 0);
    engineRef.current = engine;

    engine.onStateChange = (updatedState) => {
      setGameState({ ...updatedState });
    };

    setGameState({ ...engine.state });

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const input = inputManagerRef.current.getState();
      setGamepadName(input.gamepadName);

      engine.update(input, dt);
      engine.render();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      chiptune.stopMusic();
    };
  }, [currentScreen]);

  const handleStartGame = () => {
    chiptune.unlock();
    setCurrentScreen('game');
  };

  const handleSelectMod = (mod: PlayerMod) => {
    if (engineRef.current) {
      engineRef.current.setPlayerMod(mod);
    }
  };

  const handleSelectLevel = (levelIndex: number) => {
    chiptune.unlock();
    if (engineRef.current) {
      engineRef.current.selectLevel(levelIndex);
    }
    setCurrentScreen('game');
    setShowWorldMap(false);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    chiptune.setMuted(nextMuted);
    if (nextMuted) {
      narrator.stop();
    }
  };

  const handleRestartLevel = () => {
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    }
  };

  const handleNextLevel = () => {
    if (engineRef.current) {
      engineRef.current.closeFactSheet();
    }
  };

  const handleReturnHome = () => {
    chiptune.stopMusic();
    narrator.stop();
    setCurrentScreen('title');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white font-pixel flex flex-col select-none touch-none">
      {/* 1. TITLE SCREEN */}
      {currentScreen === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          gamepadName={gamepadName}
          onOpenFeitos={() => setShowFeitosModal(true)}
          onOpenSoundtrack={() => setShowSoundtrackModal(true)}
          onOpenWorldMap={() => setShowWorldMap(true)}
        />
      )}

      {/* 2. GAME VIEWPORT */}
      {currentScreen === 'game' && (
        <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
          {/* Top Retro HUD Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950/90 border-b-2 border-red-700/80 backdrop-blur-sm text-[10px] md:text-xs text-white">
            <div className="flex items-center gap-3">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                LULALÁ
              </span>
              <span className="hidden sm:inline text-zinc-400">
                FASE {((gameState?.levelIndex ?? 0) + 1)}/{LEVELS.length}: {LEVELS[gameState?.levelIndex ?? 0]?.name}
              </span>
              {/* Star Roll Sonic Combo Hint */}
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-400/50 rounded text-[9px] font-pixel shadow-sm animate-pulse">
                <span>★</span>
                <span>NOVO: ⬇ + PULO = GIRO ESTRELAR (ATROPELA TUDO!)</span>
              </span>
            </div>

            {/* Quick Mod Switcher Pill */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (gameState?.activeMod === 'none') {
                    // Modo normal: nada acontece
                    engineRef.current?.openModSelector();
                  } else {
                    engineRef.current?.openModSelector();
                  }
                }}
                className={`px-2 py-1 rounded flex items-center gap-1 transition text-[9px] sm:text-[10px] border ${
                  gameState?.activeMod !== 'none'
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-400/60'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 cursor-not-allowed opacity-80'
                }`}
                title={gameState?.activeMod !== 'none' ? "Trocar Mod Ativo [M]" : "Modo Normal (Mods bloqueados até pegar um bônus)"}
              >
                {gameState?.activeMod === 'heroi_voo' ? (
                  <>
                    <Zap className="w-3 h-3 text-white" />
                    <span className="text-white">
                      VOO (LUZ BRANCA) [{Math.ceil(gameState?.powerTimer ?? 0)}s]
                    </span>
                  </>
                ) : gameState?.activeMod === 'marombeiro' ? (
                  <>
                    <Dumbbell className="w-3 h-3 text-red-400" />
                    <span className="text-red-300">
                      MAROMBA [{Math.ceil(gameState?.powerTimer ?? 0)}s]
                    </span>
                  </>
                ) : gameState?.activeMod === 'lancador_agua' ? (
                  <>
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300">
                      ÁGUA [{Math.ceil(gameState?.powerTimer ?? 0)}s]
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-zinc-500" />
                    <span className="text-zinc-400">NORMAL (MODS TRAVADOS)</span>
                  </>
                )}
              </button>

              {/* World Map Button */}
              <button
                onClick={() => setShowWorldMap(true)}
                className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/60 text-yellow-300 rounded flex items-center gap-1 transition text-[9px]"
                title="Abrir Mapa das Fases & Evolução [TAB]"
              >
                <Compass className="w-3 h-3 text-yellow-400" />
                <span className="hidden sm:inline">MAPA [TAB]</span>
              </button>

              <button
                onClick={() => setShowSoundtrackModal(true)}
                className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-yellow-400/60 text-yellow-300 rounded flex items-center gap-1 transition text-[9px]"
                title="Central da Trilha Sonora / Escolher Músicas"
              >
                <Music className="w-3 h-3 text-yellow-400" />
                <span className="hidden sm:inline">TRILHA SONORA</span>
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded text-slate-300"
                title={isMuted ? 'Ativar Áudio' : 'Mutar Áudio'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={() => engineRef.current?.togglePause()}
                className="p-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded text-slate-300"
                title="Pausar Jogo [P]"
              >
                {gameState?.isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setShowTouchControls(!showTouchControls)}
                className={`p-1.5 border rounded ${
                  showTouchControls ? 'bg-red-950 border-red-500 text-red-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
                title="Controles de Toque / iPhone"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowFeitosModal(true)}
                className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/60 rounded flex items-center gap-1 transition text-[9px]"
                title="Conheça os Feitos Históricos de Lula"
              >
                <Award className="w-3 h-3 text-yellow-400" />
                <span className="hidden md:inline">FEITOS DE LULA</span>
              </button>

              <button
                onClick={handleReturnHome}
                className="px-2 py-1 bg-red-900/40 hover:bg-red-800/60 border border-red-700 rounded text-[9px] text-red-300"
              >
                MENU
              </button>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative w-full h-full flex items-center justify-center p-0 md:p-2">
            <canvas
              ref={canvasRef}
              width={640}
              height={448}
              className="w-full h-full max-w-[100vw] max-h-[100vh] object-contain shadow-2xl image-rendering-pixelated cursor-crosshair"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Mod Select Modal (when triggered by special star/item or [M] button) */}
          {gameState?.showModSelector && (
            <ModSelectModal
              currentMod={gameState.activeMod}
              onSelectMod={handleSelectMod}
              onClose={() => engineRef.current?.closeModSelector()}
            />
          )}

          {/* Touch Controls (Virtual D-pad + Action Buttons for iPhone & Mobile) */}
          {showTouchControls && (
            <TouchController
              inputManager={inputManagerRef.current}
              onPauseToggle={() => engineRef.current?.togglePause()}
              onMuteToggle={handleToggleMute}
              isPaused={gameState?.isPaused ?? false}
              isMuted={isMuted}
              mode="overlay"
            />
          )}

          {/* Dossier Modal (Historical Fact Sheet at end of level with Narrator Voice) */}
          {gameState?.showingFactSheet && gameState.currentFactSheet && (
            <DossierModal
              factSheet={gameState.currentFactSheet}
              onContinue={handleNextLevel}
              levelIndex={gameState.levelIndex}
              totalLevels={LEVELS.length}
            />
          )}

          {/* Victory Modal */}
          {gameState?.isVictory && (
            <VictoryModal
              score={gameState.score}
              coins={gameState.coins}
              carteiras={gameState.carteiras}
              diplomas={gameState.diplomas}
              presal={gameState.presal}
              onRestart={handleRestartLevel}
              onHome={handleReturnHome}
            />
          )}

          {/* Game Over Modal */}
          {gameState?.isGameOver && (
            <GameOverModal
              score={gameState.score}
              onRetry={handleRestartLevel}
              onHome={handleReturnHome}
            />
          )}
        </div>
      )}

      {/* Feitos Históricos do Lula Modal */}
      {showFeitosModal && (
        <FeitosLulaModal onClose={() => setShowFeitosModal(false)} />
      )}

      {/* Trilha Sonora Chiptune 8-bit Modal */}
      {showSoundtrackModal && (
        <SoundtrackModal
          isOpen={showSoundtrackModal}
          onClose={() => setShowSoundtrackModal(false)}
        />
      )}

      {/* PWA / iPhone Install Modal */}
      {showInstallPrompt && (
        <IPhoneInstallModal onClose={() => setShowInstallPrompt(false)} />
      )}

      {/* Mapa das Fases & Evolução Modal */}
      <WorldMapModal
        isOpen={showWorldMap}
        currentLevelIndex={gameState?.levelIndex ?? 0}
        highestUnlockedLevel={highestUnlockedLevel}
        onSelectLevel={handleSelectLevel}
        onClose={() => setShowWorldMap(false)}
      />
    </div>
  );
}
