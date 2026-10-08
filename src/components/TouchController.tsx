import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { InputManager } from '../input/inputManager';

interface TouchControllerProps {
  inputManager: InputManager;
  onPauseToggle: () => void;
  onMuteToggle?: () => void;
  isPaused: boolean;
  isMuted?: boolean;
  mode?: 'handheld' | 'overlay'; // Handheld (Game Boy style for portrait) or Overlay (transparent for landscape)
}

export const TouchController: React.FC<TouchControllerProps> = ({
  inputManager,
  onPauseToggle,
  onMuteToggle,
  isPaused,
  isMuted,
  mode = 'handheld',
}) => {
  const triggerHaptic = () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {
      // Ignore vibration error if not allowed by browser permissions
    }
  };

  const handlePointer = (key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run', active: boolean) => {
    if (active) triggerHaptic();

    switch (key) {
      case 'left':
        inputManager.virtualLeft = active;
        break;
      case 'right':
        inputManager.virtualRight = active;
        break;
      case 'up':
        inputManager.virtualUp = active;
        break;
      case 'down':
        inputManager.virtualDown = active;
        break;
      case 'jump':
        inputManager.virtualJump = active;
        break;
      case 'run':
        inputManager.virtualRun = active;
        break;
    }
  };

  if (mode === 'overlay') {
    // Landscape Mode: Sleek floating translucent buttons at edges
    return (
      <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-4 pb-6 select-none touch-none font-pixel">
        {/* Left Side: D-Pad */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
          <button
            onPointerDown={(e) => { e.preventDefault(); handlePointer('left', true); }}
            onPointerUp={(e) => { e.preventDefault(); handlePointer('left', false); }}
            onPointerCancel={(e) => { e.preventDefault(); handlePointer('left', false); }}
            className="w-13 h-13 active:scale-95 bg-slate-800/80 active:bg-yellow-400 text-white active:text-black rounded-xl flex items-center justify-center border border-white/20 transition-transform shadow-md"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          <div className="flex flex-col gap-1.5">
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePointer('up', true); }}
              onPointerUp={(e) => { e.preventDefault(); handlePointer('up', false); }}
              onPointerCancel={(e) => { e.preventDefault(); handlePointer('up', false); }}
              className="w-13 h-11 active:scale-95 bg-slate-800/80 active:bg-yellow-400 text-white active:text-black rounded-xl flex items-center justify-center border border-white/20 transition-transform shadow-md"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePointer('down', true); }}
              onPointerUp={(e) => { e.preventDefault(); handlePointer('down', false); }}
              onPointerCancel={(e) => { e.preventDefault(); handlePointer('down', false); }}
              className="w-13 h-11 active:scale-95 bg-slate-800/80 active:bg-yellow-400 text-white active:text-black rounded-xl flex items-center justify-center border border-white/20 transition-transform shadow-md"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>

          <button
            onPointerDown={(e) => { e.preventDefault(); handlePointer('right', true); }}
            onPointerUp={(e) => { e.preventDefault(); handlePointer('right', false); }}
            onPointerCancel={(e) => { e.preventDefault(); handlePointer('right', false); }}
            className="w-13 h-13 active:scale-95 bg-slate-800/80 active:bg-yellow-400 text-white active:text-black rounded-xl flex items-center justify-center border border-white/20 transition-transform shadow-md"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        {/* Right Side: Action Buttons B (Correr), A (Pular) e Estrela Sonic */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 bg-black/40 backdrop-blur-md p-2.5 rounded-3xl border border-white/10 shadow-2xl">
          {/* Quick Combo Helper: Giro Estrelar (Baixo + Pulo) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              triggerHaptic();
              handlePointer('down', true);
              handlePointer('jump', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handlePointer('jump', false);
              handlePointer('down', false);
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              handlePointer('jump', false);
              handlePointer('down', false);
            }}
            className="w-full px-2 py-1 bg-amber-500/80 active:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center gap-1 border border-yellow-300 shadow-md active:scale-95 transition-all text-[8px] font-black"
            title="Giro Estrelar Sonic: Para Baixo + Pulo (Atropela Tudo!)"
          >
            <span>★ GIRO ESTRELAR (⬇+A)</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Run (X / Botão B) */}
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePointer('run', true); }}
              onPointerUp={(e) => { e.preventDefault(); handlePointer('run', false); }}
              onPointerCancel={(e) => { e.preventDefault(); handlePointer('run', false); }}
              className="w-13 h-13 active:scale-95 bg-rose-600/90 active:bg-rose-400 text-white rounded-full flex flex-col items-center justify-center border-2 border-rose-300/40 shadow-lg transition-transform"
            >
              <span className="text-sm font-black">B</span>
              <span className="text-[7px] opacity-90 font-retro">DISCURSO</span>
            </button>

            {/* Jump (Z / Botão A) */}
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePointer('jump', true); }}
              onPointerUp={(e) => { e.preventDefault(); handlePointer('jump', false); }}
              onPointerCancel={(e) => { e.preventDefault(); handlePointer('jump', false); }}
              className="w-15 h-15 active:scale-95 bg-emerald-600/90 active:bg-emerald-400 text-white rounded-full flex flex-col items-center justify-center border-2 border-emerald-300/40 shadow-xl transition-transform"
            >
              <span className="text-base font-black">A</span>
              <span className="text-[8px] opacity-90 font-retro">PULA / VOA</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Portrait Mode: Handheld Retro Console Lower Chassis (Game Boy Advance / Super Nintendo Style)
  return (
    <div className="w-full flex flex-col items-center justify-between p-3 pb-5 bg-gradient-to-b from-[#181a29] to-[#0c0d16] border-t-4 border-[#33374d] shadow-inner select-none touch-none font-pixel">
      {/* Brand & Speaker Grille Strip */}
      <div className="w-full flex items-center justify-between px-3 pb-2 text-[8px] text-slate-400 tracking-wider">
        <span className="text-yellow-400 font-bold">16-BIT PORTABLE</span>
        <div className="flex gap-1">
          <span className="w-1 h-3 bg-slate-700 rounded-full" />
          <span className="w-1 h-3 bg-slate-700 rounded-full" />
          <span className="w-1 h-3 bg-slate-700 rounded-full" />
          <span className="w-1 h-3 bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="w-full flex items-center justify-between px-1">
        {/* Ergonomic Cross D-Pad */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* D-Pad Background Cross */}
          <div className="absolute w-12 h-34 bg-[#232738] rounded-md shadow-inner" />
          <div className="absolute w-34 h-12 bg-[#232738] rounded-md shadow-inner" />

          {/* Up */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handlePointer('up', true); }}
            onPointerUp={(e) => { e.preventDefault(); handlePointer('up', false); }}
            onPointerCancel={(e) => { e.preventDefault(); handlePointer('up', false); }}
            className="absolute top-1 w-11 h-11 bg-[#1a1c27] active:bg-yellow-400 text-slate-300 active:text-black rounded-t flex items-center justify-center border-t-2 border-slate-600 active:scale-95 transition-all shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          {/* Down */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handlePointer('down', true); }}
            onPointerUp={(e) => { e.preventDefault(); handlePointer('down', false); }}
            onPointerCancel={(e) => { e.preventDefault(); handlePointer('down', false); }}
            className="absolute bottom-1 w-11 h-11 bg-[#1a1c27] active:bg-yellow-400 text-slate-300 active:text-black rounded-b flex items-center justify-center border-b-2 border-slate-600 active:scale-95 transition-all shadow"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          {/* Left */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handlePointer('left', true); }}
            onPointerUp={(e) => { e.preventDefault(); handlePointer('left', false); }}
            onPointerCancel={(e) => { e.preventDefault(); handlePointer('left', false); }}
            className="absolute left-1 w-11 h-11 bg-[#1a1c27] active:bg-yellow-400 text-slate-300 active:text-black rounded-l flex items-center justify-center border-l-2 border-slate-600 active:scale-95 transition-all shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Right */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handlePointer('right', true); }}
            onPointerUp={(e) => { e.preventDefault(); handlePointer('right', false); }}
            onPointerCancel={(e) => { e.preventDefault(); handlePointer('right', false); }}
            className="absolute right-1 w-11 h-11 bg-[#1a1c27] active:bg-yellow-400 text-slate-300 active:text-black rounded-r flex items-center justify-center border-r-2 border-slate-600 active:scale-95 transition-all shadow"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Center Dimple */}
          <div className="w-6 h-6 rounded-full bg-[#11131c] z-10 pointer-events-none shadow-inner" />
        </div>

        {/* Action Buttons: B, A & Quick Star Roll */}
        <div className="flex flex-col items-end gap-2 pr-1">
          {/* Quick Combo Helper: Giro Estrelar */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              triggerHaptic();
              handlePointer('down', true);
              handlePointer('jump', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handlePointer('jump', false);
              handlePointer('down', false);
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              handlePointer('jump', false);
              handlePointer('down', false);
            }}
            className="px-3 py-1 bg-amber-500 active:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center gap-1 border-2 border-yellow-300 shadow active:translate-y-0.5 transition-all text-[8px] font-black"
            title="Giro Estrelar Sonic: Para Baixo + Pulo (Atropela Tudo!)"
          >
            <span>★ GIRO ESTRELAR (⬇+A)</span>
          </button>

          <div className="flex items-center gap-3 transform -rotate-12">
            {/* B Button (Run / Action / Shoot) */}
            <div className="flex flex-col items-center">
              <button
                onPointerDown={(e) => { e.preventDefault(); handlePointer('run', true); }}
                onPointerUp={(e) => { e.preventDefault(); handlePointer('run', false); }}
                onPointerCancel={(e) => { e.preventDefault(); handlePointer('run', false); }}
                className="w-14 h-14 bg-rose-600 active:bg-rose-400 text-white rounded-full flex items-center justify-center border-3 border-rose-900 shadow-[2px_4px_0_#4c0519] active:translate-y-1 active:shadow-none transition-all"
              >
                <span className="text-sm font-bold">B</span>
              </button>
              <span className="text-[7px] text-slate-400 mt-1 font-retro tracking-wider">DISCURSO [X]</span>
            </div>

            {/* A Button (Jump / Fly) */}
            <div className="flex flex-col items-center">
              <button
                onPointerDown={(e) => { e.preventDefault(); handlePointer('jump', true); }}
                onPointerUp={(e) => { e.preventDefault(); handlePointer('jump', false); }}
                onPointerCancel={(e) => { e.preventDefault(); handlePointer('jump', false); }}
                className="w-16 h-16 bg-emerald-600 active:bg-emerald-400 text-white rounded-full flex items-center justify-center border-3 border-emerald-900 shadow-[2px_4px_0_#064e3b] active:translate-y-1 active:shadow-none transition-all"
              >
                <span className="text-base font-bold">A</span>
              </button>
              <span className="text-[8px] text-slate-400 mt-1 font-retro tracking-wider">PULA/VOA [Z]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Pill Buttons: SELECT & START */}
      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-slate-800/80 w-full">
        {/* SELECT (Mute) */}
        <button
          onClick={() => { triggerHaptic(); if (onMuteToggle) onMuteToggle(); }}
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <div className="w-12 h-3.5 bg-slate-700 group-active:bg-yellow-400 rounded-full border border-slate-500 shadow-inner flex items-center justify-center">
            {isMuted ? <VolumeX className="w-2.5 h-2.5 text-red-300" /> : <Volume2 className="w-2.5 h-2.5 text-emerald-300" />}
          </div>
          <span className="text-[8px] text-slate-400 tracking-wider">SELECT (SOM)</span>
        </button>

        {/* START (Pause) */}
        <button
          onClick={() => { triggerHaptic(); onPauseToggle(); }}
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <div className="w-12 h-3.5 bg-slate-700 group-active:bg-yellow-400 rounded-full border border-slate-500 shadow-inner flex items-center justify-center">
            {isPaused ? <Play className="w-2.5 h-2.5 text-yellow-300" /> : <Pause className="w-2.5 h-2.5 text-white" />}
          </div>
          <span className="text-[8px] text-slate-400 tracking-wider">START (PAUSA)</span>
        </button>
      </div>
    </div>
  );
};
