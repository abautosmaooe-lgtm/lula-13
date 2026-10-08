import React from 'react';
import { RotateCcw, Home, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  onRetry,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in font-pixel select-none">
      <div className="max-w-md w-full bg-slate-900 border-4 border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,0.7)] p-6 text-center text-white rounded">
        <div className="flex justify-center mb-3">
          <Sparkles className="w-12 h-12 text-red-500 animate-pulse" />
        </div>

        <h2 className="text-xl md:text-2xl font-black text-red-500 mb-2 tracking-widest">
          RESISTÊNCIA!
        </h2>

        <p className="text-xs text-slate-300 font-retro text-base mb-4 leading-relaxed">
          A luta pelos direitos do povo não para. Recupere as forças, convoque os companheiros e tente novamente!
        </p>

        <div className="bg-slate-950 p-3 border border-red-500/40 mb-6">
          <span className="text-[10px] text-slate-400 block mb-1">APOIO POPULAR CONQUISTADO</span>
          <span className="text-xl text-yellow-400 font-bold tracking-wider">
            {String(score).padStart(6, '0')} PONTOS
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TENTAR DE NOVO [Z]</span>
          </button>

          <button
            onClick={onHome}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENU INICIAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
