import React, { useEffect, useState } from 'react';
import { Trophy, RotateCcw, Home, Sparkles, Volume2, VolumeX, Star } from 'lucide-react';
import { narrator } from '../audio/narrator';

interface VictoryModalProps {
  score: number;
  coins: number;
  carteiras: number;
  diplomas: number;
  presal: number;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coins,
  carteiras,
  diplomas,
  presal,
  onRestart,
  onHome,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const victoryNarrationText = `Vitória Histórica! A esperança venceu! Lula concluiu o Caminho da Estrela, subiu a rampa do Palácio do Planalto ao lado do povo brasileiro e de Resistência, fortalecendo a democracia com a Frente Ampla! Foram acumuladas ${carteiras} carteiras de trabalho, ${diplomas} diplomas universitários, ${presal} barris do pré-sal e ${score} pontos de apoio popular!`;

  useEffect(() => {
    const unsubscribe = narrator.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });

    if (narrator.isAutoNarrate()) {
      const timer = setTimeout(() => {
        narrator.speak(victoryNarrationText);
      }, 500);
      return () => {
        clearTimeout(timer);
        unsubscribe();
        narrator.stop();
      };
    }

    return () => {
      unsubscribe();
      narrator.stop();
    };
  }, []);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      narrator.stop();
    } else {
      narrator.speak(victoryNarrationText);
    }
  };

  const handleRestart = () => {
    narrator.stop();
    onRestart();
  };

  const handleHome = () => {
    narrator.stop();
    onHome();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in font-pixel select-none">
      <div className="max-w-md w-full bg-slate-900 border-4 border-yellow-400 shadow-[8px_8px_0px_0px_rgba(250,204,21,0.8)] p-6 text-center text-white rounded">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Trophy className="w-14 h-14 text-yellow-400 animate-bounce" />
            <Star className="w-6 h-6 text-red-500 fill-red-500 absolute -top-1 -right-2 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-yellow-400 mb-1 tracking-widest">
          A ESPERANÇA VENCEU!
        </h2>
        <div className="text-xs text-red-400 mb-2 font-bold tracking-wider">
          SUBIDA DA RAMPA DO PLANALTO
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/80 border border-red-500/60 text-yellow-300 text-[10px] rounded mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FRENTE AMPLA PELA DEMOCRACIA!</span>
        </div>

        {/* Narradora audio badge */}
        <div className="mb-4 flex items-center justify-center">
          <button
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded text-[9px] font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600/90 text-white border-rose-400 animate-pulse'
                : 'bg-emerald-600/90 text-white border-emerald-400'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'PARAR VOZ DA NARRADORA' : '🎙️ OUVIR NARRADORA'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 font-retro text-base mb-4 leading-relaxed">
          Das greves operárias do ABC até o terceiro mandato presidencial, a história da classe trabalhadora e da democracia brasileira!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-3 border border-yellow-500/40 mb-6 text-center">
          <div>
            <span className="text-[8px] text-slate-400 block truncate">PONTOS</span>
            <span className="text-xs text-yellow-400 font-bold">{score}</span>
          </div>
          <div>
            <span className="text-[8px] text-slate-400 block truncate">CARTEIRAS</span>
            <span className="text-xs text-blue-400 font-bold">{carteiras}</span>
          </div>
          <div>
            <span className="text-[8px] text-slate-400 block truncate">DIPLOMAS</span>
            <span className="text-xs text-amber-400 font-bold">{diplomas}</span>
          </div>
          <div>
            <span className="text-[8px] text-slate-400 block truncate">PRÉ-SAL</span>
            <span className="text-xs text-emerald-400 font-bold">{presal}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>JOGAR NOVAMENTE [Z]</span>
          </button>

          <button
            onClick={handleHome}
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
