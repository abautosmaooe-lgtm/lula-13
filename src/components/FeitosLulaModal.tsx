import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  GraduationCap,
  Heart,
  Droplets,
  Home,
  Flame,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Trees,
  Users,
  X,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface FeitosLulaModalProps {
  onClose: () => void;
}

interface FeitoItem {
  id: string;
  category: string;
  icon: typeof Award;
  title: string;
  highlight: string;
  description: string;
  stats: { label: string; value: string }[];
  sources: string[];
}

export const FEITOS_LULA: FeitoItem[] = [
  {
    id: 'fome_zero',
    category: 'COMBATE À FOME & DIGNIDADE',
    icon: Heart,
    title: 'Bolsa Família & Saída do Mapa da Fome',
    highlight: 'Mais de 36 milhões de brasileiros saíram da extrema pobreza',
    description:
      'Unificando programas sociais e priorizando a transferência de renda direta para mães de família, o Bolsa Família e o Fome Zero tornaram-se referências mundiais reconhecidas pela ONU e Banco Mundial. Em 2014, o Brasil saiu oficialmente do Mapa da Fome das Nações Unidas.',
    stats: [
      { label: 'Pessoas fora da miséria', value: '36+ Milhões' },
      { label: 'Reconhecimento ONU', value: 'Mapa da Fome 2014' },
      { label: 'Mulheres titulares', value: '93% das famílias' },
    ],
    sources: ['ONU / FAO', 'Ministério do Desenvolvimento Social', 'IPEA'],
  },
  {
    id: 'educacao',
    category: 'EDUCAÇÃO & UNIVERSIDADES',
    icon: GraduationCap,
    title: 'Prouni, Reuni e Expansão Universitária',
    highlight: '18 novas Universidades Federais e 360+ Institutos Federais',
    description:
      'A democratização do ensino superior levou o filho do pedreiro e da empregada doméstica à formatura em Medicina, Direito e Engenharia. Com o Prouni, Reuni e Fies sem juros abusivos, o número de universitários no Brasil mais que dobrou, além da criação da Lei de Cotas para escolas públicas e negros.',
    stats: [
      { label: 'Novas Universidades', value: '18 Federais (+178 campi)' },
      { label: 'Institutos Federais (IFs)', value: '360+ escolas técnicas' },
      { label: 'Bolsas pelo Prouni', value: '3+ Milhões de estudantes' },
    ],
    sources: ['MEC', 'Censo da Educação Superior / Inep', 'Andifes'],
  },
  {
    id: 'sao_francisco',
    category: 'INFRAESTRUTURA HÍDRICA',
    icon: Droplets,
    title: 'Transposição do Rio São Francisco',
    highlight: 'Água encanada e esperança para 12 milhões de sertanejos',
    description:
      'A maior obra de engenharia de segurança hídrica da história do Brasil conectou 477 km de canais e túneis levando a água do Velho Chico para os estados de Pernambuco, Ceará, Paraíba e Rio Grande do Norte, acabando com a humilhação do carro-pipa no semiárido.',
    stats: [
      { label: 'Extensão dos canais', value: '477 km construídos' },
      { label: 'Cidadãos beneficiados', value: '12 Milhões de pessoas' },
      { label: 'Cisternas entregues', value: '1,2 Milhão no campo' },
    ],
    sources: ['Ministério da Integração Nacional', 'ANA', 'Codevasf'],
  },
  {
    id: 'moradia',
    category: 'HABITAÇÃO POPULAR',
    icon: Home,
    title: 'Programa Minha Casa Minha Vida',
    highlight: 'Mais de 4 milhões de famílias conquistaram a casa própria',
    description:
      'O maior programa habitacional da história do Brasil subsidiou casas e apartamentos com escritura em nome prioritariamente da mulher. Ao mesmo tempo, reativou em escala recorde a indústria da construção civil brasileira, gerando milhões de empregos com carteira assinada.',
    stats: [
      { label: 'Moradias contratadas', value: '4+ Milhões de lares' },
      { label: 'Subsídio para Baixa Renda', value: 'Até 95% custeado' },
      { label: 'Mulheres com escritura', value: 'Prioridade absoluta' },
    ],
    sources: ['Caixa Econômica Federal', 'Ministério das Cidades', 'CBIC'],
  },
  {
    id: 'pre_sal',
    category: 'SOBERANIA & ENERGIA',
    icon: TrendingUp,
    title: 'Descoberta do Pré-Sal & Royalties da Educação',
    highlight: 'Maior descoberta petrolífera global do século XXI para o Brasil',
    description:
      'Liderada pelo desenvolvimento tecnológico pioneiro da Petrobras em águas ultraprofundas, a descoberta do Pré-Sal alcançou produção diária milionária de barris com recordes de eficiência. Aprovou o marco da partilha garantindo que royalties do petróleo financiem saúde e educação públicas.',
    stats: [
      { label: 'Profundidade explorada', value: 'Até 7.000 metros' },
      { label: 'Produção diária', value: 'Mais de 3 mi barris/dia' },
      { label: 'Fundo Social', value: '50% para Educação e Saúde' },
    ],
    sources: ['Petrobras', 'ANP - Agência Nacional do Petróleo', 'EPE'],
  },
  {
    id: 'emprego_salario',
    category: 'ECONOMIA & TRABALHO',
    icon: DollarSign,
    title: '15 Milhões de Empregos & Aumento Real do Salário',
    highlight: '77% de ganho real no Salário Mínimo e Brasil 6ª economia mundial',
    description:
      'A política oficial de valorização do salário mínimo garantiu reposição inflacionária mais o PIB a cada ano, aumentando o poder de compra da classe trabalhadora e impulsionando o mercado interno. O país pagou integralmente a dívida histórica com o FMI e acumulou quase 400 bilhões de dólares em reservas cambiais.',
    stats: [
      { label: 'Empregos formais', value: '15+ Milhões criados' },
      { label: 'Aumento real do salário', value: '+77% acima da inflação' },
      { label: 'Posição na economia', value: '6ª Maior economia do mundo' },
    ],
    sources: ['CAGED / MTE', 'Banco Central do Brasil', 'FMI'],
  },
  {
    id: 'saude',
    category: 'SAÚDE PÚBLICA',
    icon: Heart,
    title: 'Farmácia Popular, SAMU e Brasil Sorridente',
    highlight: 'Remédios gratuitos e atendimento de urgência em todo o país',
    description:
      'Acesso a medicamentos contínuos gratuitos ou com desconto de até 90% para controle de hipertensão, diabetes e asma na Farmácia Popular. Criação do SAMU 192 com ambulâncias e UTIs móveis integradas e lançamento do Brasil Sorridente para tratamento odontológico gratuito pelo SUS.',
    stats: [
      { label: 'Usuários Farmácia Popular', value: '30+ Milhões de pessoas' },
      { label: 'Cobertura do SAMU', value: '85% do território nacional' },
      { label: 'Próteses e dentistas', value: 'Milhões de sorrisos pelo SUS' },
    ],
    sources: ['Ministério da Saúde', 'Fiocruz', 'SUS'],
  },
  {
    id: 'meio_ambiente',
    category: 'MEIO AMBIENTE & BIOMAS',
    icon: Trees,
    title: 'Queda Histórica do Desmatamento & Proteção das Florestas',
    highlight: 'Redução de mais de 80% do desmatamento na Amazônia com o PPCDAm',
    description:
      'Criação do Plano de Ação para Prevenção e Controle do Desmatamento na Amazônia Legal (PPCDAm), fiscalização com monitoramento por satélite em tempo real (DETER/INPE), demarcação de terras indígenas e criação de unidades de conservação, além do combate rigoroso às queimadas e incêndios florestais.',
    stats: [
      { label: 'Queda do desmatamento', value: '-83% entre 2004 e 2012' },
      { label: 'Fundo Amazônia', value: 'Maior fundo de conservação global' },
      { label: 'Brigadas de incêndio', value: 'Prevenção e combate ativo' },
    ],
    sources: ['INPE / PRODES', 'Ibama', 'Ministério do Meio Ambiente'],
  },
];

export const FeitosLulaModal: React.FC<FeitosLulaModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedFeito, setSelectedFeito] = useState<FeitoItem>(FEITOS_LULA[0]);

  const filteredFeitos =
    activeCategory === 'all'
      ? FEITOS_LULA
      : FEITOS_LULA.filter((f) => f.id === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 font-pixel">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border-4 border-yellow-400 p-4 sm:p-6 shadow-2xl rounded-lg text-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-red-700/80 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-700 text-yellow-300 rounded border border-yellow-400 shadow">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base text-yellow-300 tracking-wide font-black flex items-center gap-2">
                <span>OS GRANDES FEITOS HISTÓRICOS DE LULA</span>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
              </h2>
              <p className="text-[10px] text-zinc-300 font-retro">
                Transformações sociais, educacionais, econômicas e ambientais que mudaram a vida do povo brasileiro.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700 rounded transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Left List + Right Detail */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left Column: Feitos List */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-[10px] text-zinc-400 font-retro uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Selecione uma Conquista Histórica:</span>
            </div>

            {FEITOS_LULA.map((item) => {
              const isSelected = selectedFeito.id === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedFeito(item)}
                  className={`w-full text-left p-2.5 rounded border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-yellow-400 bg-red-950/60 shadow ring-1 ring-yellow-400/40 text-yellow-100'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded shrink-0 ${
                      isSelected ? 'bg-red-700 text-yellow-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-retro uppercase tracking-wider block text-yellow-400/90 font-bold truncate">
                      {item.category}
                    </span>
                    <h3 className="text-[11px] font-bold text-white truncate">
                      {item.title}
                    </h3>
                    <p className="text-[9px] text-zinc-400 font-retro line-clamp-1">
                      {item.highlight}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-yellow-400 translate-x-1' : 'text-zinc-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Feat Showcase */}
          <div className="md:col-span-7 bg-zinc-900/90 border-2 border-red-700/60 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Category Badge & Title */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-red-700 text-yellow-300 text-[9px] rounded font-bold border border-yellow-400/60">
                  {selectedFeito.category}
                </span>
                <span className="text-[10px] text-emerald-400 font-retro">
                  ✓ Fato Histórico Comprovado
                </span>
              </div>

              <h3 className="text-sm sm:text-base text-yellow-300 font-black mb-2">
                {selectedFeito.title}
              </h3>

              {/* Highlight callout box */}
              <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-2.5 rounded-r mb-3.5">
                <p className="text-xs text-yellow-200 font-bold">
                  ★ {selectedFeito.highlight}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm font-retro text-zinc-200 leading-relaxed mb-4">
                {selectedFeito.description}
              </p>

              {/* Verified Stats 3-card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {selectedFeito.stats.map((st, i) => (
                  <div
                    key={i}
                    className="bg-black/60 border border-zinc-700 p-2 rounded text-center"
                  >
                    <span className="text-[11px] sm:text-xs text-yellow-300 font-bold block truncate">
                      {st.value}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-retro text-zinc-400 block mt-0.5">
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources footer */}
            <div className="pt-3 border-t border-zinc-800 text-[9px] font-retro text-zinc-400 flex flex-wrap items-center justify-between gap-2">
              <span className="text-zinc-500">
                Fontes: {selectedFeito.sources.join(' • ')}
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded font-pixel text-[9px] border border-yellow-400 transition cursor-pointer"
              >
                JOGAR AGORA
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner Summary */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-zinc-400 font-retro shrink-0">
          <span className="text-center sm:text-left text-yellow-100/90">
            ★ &quot;Nunca antes na história deste país o trabalhador e o povo mais humilde tiveram tantas oportunidades.&quot;
          </span>
          <span className="text-emerald-400 font-pixel text-[8px]">
            8 GRANDES CONQUISTAS DISPONÍVEIS
          </span>
        </div>
      </div>
    </div>
  );
};
