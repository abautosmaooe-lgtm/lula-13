import React, { useEffect, useState } from 'react';
import { LevelData } from '../game/levels';
import { narrator } from '../audio/narrator';
import { chiptune } from '../audio/chiptune';
import { BookOpen, ArrowRight, CheckCircle2, Volume2, VolumeX, Mic, MicOff, RotateCcw } from 'lucide-react';

interface DossierModalProps {
  factSheet: LevelData['factSheet'];
  onContinue: () => void;
  levelIndex: number;
  totalLevels: number;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  factSheet,
  onContinue,
  levelIndex,
  totalLevels,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(narrator.isAutoNarrate());

  const fullTextToNarrate = `${factSheet.title}. ${factSheet.subtitle}. Destaque histórico: ${factSheet.highlight}. ${factSheet.description}. Fontes históricas apuradas: ${factSheet.sources.join(', ')}.`;

  useEffect(() => {
    const unsubscribe = narrator.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });

    if (autoNarrate) {
      const timer = setTimeout(() => {
        narrator.speak(fullTextToNarrate);
      }, 300);
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
  }, [factSheet, autoNarrate]);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      narrator.stop();
    } else {
      narrator.speak(fullTextToNarrate);
    }
  };

  const handleToggleAuto = () => {
    const nextVal = narrator.toggleAutoNarrate();
    setAutoNarrate(nextVal);
  };

  const handleProceed = () => {
    narrator.stop();
    chiptune.speakVoice('Bora lá, companheiro!');
    onContinue();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="max-w-lg w-full bg-[#fefce8] text-slate-900 border-4 border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,0.7)] p-4 sm:p-6 font-retro max-h-[95vh] overflow-y-auto rounded">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-red-900 pb-3 mb-3">
          <div className="flex items-center gap-2 text-red-700 font-pixel text-xs font-bold tracking-wider">
            <BookOpen className="w-5 h-5 text-red-700 shrink-0" />
            <span>MEMÓRIA & HISTÓRIA DO BRASIL</span>
          </div>
          <span className="font-pixel text-[10px] text-white bg-red-700 px-2.5 py-0.5 rounded border border-red-900">
            MUNDO {levelIndex + 1}/{totalLevels}
          </span>
        </div>

        {/* Narradora Strip with Pixel Avatar & Voice Controls */}
        <div className="bg-red-50 border-2 border-red-300 p-2.5 rounded mb-3 flex items-center justify-between gap-2 font-pixel">
          <div className="flex items-center gap-2.5">
            {/* 16-bit Pixel Journalist / Narrator Avatar */}
            <div className="relative w-9 h-9 bg-slate-900 rounded border border-red-600 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              <div className="absolute top-1 w-6 h-3 bg-amber-700 rounded-t" />
              <div className="absolute top-2 w-5 h-4 bg-amber-200 rounded" />
              <div className="absolute top-3 flex gap-1.5">
                <div className="w-1 h-1 bg-slate-900 rounded-full" />
                <div className="w-1 h-1 bg-slate-900 rounded-full" />
              </div>
              <div
                className={`absolute top-4.5 w-2 bg-red-600 rounded-sm transition-all ${
                  isSpeaking ? 'h-1.5 animate-pulse' : 'h-0.5'
                }`}
              />
              <div className="absolute bottom-0 w-7 h-2.5 bg-red-700" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-900 font-bold">
                <span>NARRADORA</span>
                {isSpeaking ? (
                  <span className="flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-sans font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    CONTANDO A HISTÓRIA
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500 font-sans font-normal">VOZ EM PORTUGUÊS</span>
                )}
              </div>
              <div className="text-[8px] text-slate-600 font-mono">
                {isSpeaking ? 'Áudio da narrativa histórica em andamento' : 'Toque para ouvir a biografia histórica'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleVoice}
              title={isSpeaking ? 'Pausar narração' : 'Ouvir narração histórica com a narradora'}
              className={`px-2.5 py-1.5 rounded text-[9px] font-bold flex items-center gap-1 border transition cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'PARAR' : 'OUVIR'}</span>
            </button>

            <button
              onClick={() => narrator.replay()}
              title="Recomeçar do início"
              className="p-1.5 bg-red-100 hover:bg-red-200 text-slate-800 rounded border border-red-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-lg sm:text-xl font-bold font-pixel text-slate-950 mb-1 leading-snug tracking-wide">
          {factSheet.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3 font-mono font-bold">
          <span>{factSheet.subtitle}</span>
          <span>•</span>
          <span className="text-red-700 font-bold">{factSheet.date}</span>
        </div>

        {/* Highlight Callout Box */}
        <div className="bg-red-100/90 border-l-4 border-red-600 p-2.5 mb-3 text-sm font-semibold text-red-950 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <span>{factSheet.highlight}</span>
        </div>

        {/* Body Text */}
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed mb-4 text-justify font-sans">
          {factSheet.description}
        </p>

        {/* Sources Footer */}
        <div className="bg-slate-200/90 p-2.5 mb-4 border border-slate-400 text-xs rounded">
          <span className="font-bold text-slate-700 block mb-1">Fontes & Acervos Históricos:</span>
          <div className="flex flex-wrap gap-1.5">
            {factSheet.sources.map((s, idx) => (
              <span
                key={idx}
                className="bg-white px-2 py-0.5 border border-slate-300 rounded text-slate-700 text-[11px] font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-300 pt-3">
          <button
            onClick={handleToggleAuto}
            className="text-[10px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-sans cursor-pointer"
          >
            {autoNarrate ? <Mic className="w-3.5 h-3.5 text-emerald-600" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>Narração automática: {autoNarrate ? 'Ativada' : 'Desativada'}</span>
          </button>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-pixel text-[11px] font-bold tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{levelIndex < totalLevels - 1 ? 'PRÓXIMA FASE [Z]' : 'VITÓRIA HISTÓRICA [Z]'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
