import React from 'react';
import { Share, PlusSquare, Gamepad2, Smartphone, X, CheckCircle, Bluetooth } from 'lucide-react';

interface IPhoneInstallModalProps {
  onClose: () => void;
}

export const IPhoneInstallModal: React.FC<IPhoneInstallModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-retro select-none">
      <div className="max-w-md w-full bg-slate-900 text-white border-4 border-yellow-500 shadow-[8px_8px_0px_0px_rgba(250,204,21,0.5)] p-5 rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-400 font-pixel text-xs">
            <Smartphone className="w-5 h-5 text-yellow-400" />
            <span>GUIA IPHONE & MOBILE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Instalar no iPhone como App Nativo (PWA) */}
        <div className="mb-5 bg-slate-950 p-3.5 rounded border border-slate-800">
          <h3 className="font-pixel text-[11px] text-emerald-400 flex items-center gap-1.5 mb-2">
            <PlusSquare className="w-4 h-4 text-emerald-400" />
            <span>1. COMO JOGAR EM TELA CHEIA (SEM BARRAS)</span>
          </h3>
          <p className="text-xs text-slate-300 mb-2 leading-relaxed font-sans">
            Para jogar sem a barra de endereços do Safari, transforme o jogo em um aplicativo nativo na sua tela de início:
          </p>
          <ol className="text-xs text-slate-300 space-y-1.5 pl-4 list-decimal font-sans">
            <li className="flex items-center gap-1.5">
              <span>Toque no botão</span>
              <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-600/40 text-blue-300 rounded border border-blue-500/40 text-[10px]">
                <Share className="w-3 h-3 mr-1" /> Compartilhar
              </span>
              <span>na barra inferior do Safari.</span>
            </li>
            <li>Role a lista para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (+).</li>
            <li>Confirme no canto superior direito tocando em <strong>"Adicionar"</strong>.</li>
          </ol>
        </div>

        {/* Section 2: Conectar Joystick via Bluetooth no iPhone */}
        <div className="mb-5 bg-slate-950 p-3.5 rounded border border-slate-800">
          <h3 className="font-pixel text-[11px] text-blue-400 flex items-center gap-1.5 mb-2">
            <Gamepad2 className="w-4 h-4 text-blue-400" />
            <span>2. USAR CONTROLE NO IPHONE (BLUETOOTH)</span>
          </h3>
          <p className="text-xs text-slate-300 mb-2 leading-relaxed font-sans">
            O iPhone (iOS 14.5+) possui suporte nativo a controles de console. Basta parear:
          </p>
          <div className="space-y-2 text-xs text-slate-300 font-sans">
            <div className="flex items-start gap-2">
              <Bluetooth className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Xbox / PlayStation / 8BitDo:</strong> Ligue o controle em modo pareamento e conecte em <em>Ajustes &gt; Bluetooth</em> no seu iPhone.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                O jogo detectará o joystick automaticamente na mesma hora! Os botões touch desaparecem para tela limpa.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Modos de Orientação (Retrato vs Paisagem) */}
        <div className="mb-5 bg-slate-950 p-3.5 rounded border border-slate-800">
          <h3 className="font-pixel text-[11px] text-yellow-400 flex items-center gap-1.5 mb-2">
            <Smartphone className="w-4 h-4 text-yellow-400" />
            <span>3. ORIENTAÇÃO DO APARELHO</span>
          </h3>
          <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
            <li>
              📱 <strong>iPhone em pé (Retrato):</strong> Ativa o formato <em>Console Portátil Retrô</em>, com a tela no topo e os botões grandes e confortáveis na metade inferior.
            </li>
            <li>
              🔄 <strong>iPhone deitado (Paisagem):</strong> Expande para tela cheia com botões touch translúcidos nos cantos laterais.
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-pixel text-xs font-bold rounded transition cursor-pointer"
        >
          ENTENDI, VAMOS JOGAR! [Z]
        </button>
      </div>
    </div>
  );
};
