import React from 'react';
import { PlayerMod } from '../game/engine';
import { Zap, Shield, Droplets, Dumbbell, Sparkles, X, Check } from 'lucide-react';

interface ModSelectModalProps {
  currentMod: PlayerMod;
  onSelectMod: (mod: PlayerMod) => void;
  onClose: () => void;
}

export const ModSelectModal: React.FC<ModSelectModalProps> = ({
  currentMod,
  onSelectMod,
  onClose,
}) => {
  const mods: {
    id: PlayerMod;
    name: string;
    subtitle: string;
    description: string;
    badge: string;
    icon: typeof Zap;
    color: string;
    keyNumber: string;
  }[] = [
    {
      id: 'heroi_voo',
      name: 'LULA HERÓI QUE VOA',
      subtitle: 'Aura Radiante de Luzes Brancas',
      description: 'Voe livremente pelos céus! Emite feixes e estrelas de luz branca pura ao planar, cruzando abismos e espalhando esperança.',
      badge: 'VOO LIVRE + LUZ BRANCA',
      icon: Zap,
      color: 'from-sky-500/20 to-white/20 border-white text-white',
      keyNumber: '1',
    },
    {
      id: 'marombeiro',
      name: 'MOD MAROMBEIRO',
      subtitle: 'Forte como Fisiculturista',
      description: 'Super força muscular! Destrói tijolos com socos devastadores [X], imunidade a impactos leves e pisão que causa terremoto na tela!',
      badge: 'SUPER FORÇA + TERREMOTO',
      icon: Dumbbell,
      color: 'from-red-600/20 to-amber-500/20 border-red-500 text-red-300',
      keyNumber: '2',
    },
    {
      id: 'lancador_agua',
      name: 'LULA LANÇADOR DE ÁGUA',
      subtitle: 'Herói Ambientalista & Bombeiro',
      description: 'Equipado com mangueira de alta pressão! Dispare jatos d\'água [X] para apagar incêndios e queimadas em florestas, transformando cinzas em árvores floridas!',
      badge: 'APAGAR QUEIMADAS + REFLORESTAR',
      icon: Droplets,
      color: 'from-blue-600/20 to-cyan-400/20 border-cyan-400 text-cyan-300',
      keyNumber: '3',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 font-pixel">
      <div className="relative w-full max-w-2xl bg-zinc-950 border-4 border-amber-400 p-6 shadow-2xl rounded-lg text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 bg-amber-400 animate-ping inline-block" />
            <div>
              <h2 className="text-base sm:text-lg text-amber-300 tracking-wider">
                PODER ESPECIAL: ESCOLHA SEU MOD!
              </h2>
              <span className="text-[10px] text-amber-200/90 font-retro block mt-0.5">
                ⏱ NOTA: Os poderes são temporários e duram apenas 10 segundos (ele volta ao normal)!
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-750 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mod Cards Grid */}
        <div className="space-y-3.5 mb-6">
          {mods.map((mod) => {
            const isSelected = currentMod === mod.id;
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  onSelectMod(mod.id);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded border-2 transition-all relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-amber-400 bg-zinc-900 shadow-lg ring-2 ring-amber-400/30'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded border border-white/20 bg-gradient-to-br ${mod.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-300 font-bold">{mod.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        TECLA [{mod.keyNumber}]
                      </span>
                    </div>
                    <span className="text-[10px] text-white block mt-0.5">{mod.subtitle}</span>
                    <p className="text-[9px] text-zinc-400 mt-1.5 leading-relaxed max-w-lg font-retro text-xs">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <span className="text-[9px] font-bold px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-300 whitespace-nowrap">
                    {mod.badge}
                  </span>
                  {isSelected ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> ATIVO
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 underline">ESCOLHER</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t-2 border-zinc-800 text-[10px] text-zinc-400 gap-2">
          <span>DICA: Você também pode alternar usando as teclas 1, 2 e 3 durante a fase!</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold text-xs rounded hover:bg-amber-300 transition-colors"
          >
            VOLTAR AO JOGO
          </button>
        </div>
      </div>
    </div>
  );
};
