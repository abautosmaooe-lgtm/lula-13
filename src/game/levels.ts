/**
 * Level Designs & Historical Biographical Milestones for Lulalá - Caminho da Estrela
 */

import { BGMTrack } from '../audio/chiptune';

export type BlockType = 'ground' | 'ground_top' | 'brick' | 'question' | 'used';

export interface BlockDef {
  x: number;      // Grid X (tile unit, each tile = 32px)
  y: number;      // Grid Y
  type: BlockType;
  itemInside?: 'carteira' | 'estrela' | 'povo_feliz' | 'povo_feliz' | 'diploma' | 'presal' | 'coin';
}

export interface EnemyDef {
  x: number;      // World pixel X
  y: number;      // World pixel Y
  type: 'censor' | 'especulador' | 'orange' | 'minion' | 'ghost' | 'boi';
}

export interface BossDef {
  type: 'laranja' | 'fantasma' | 'patriota' | 'general' | 'palhaco';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  maxHp: number;
}

export interface ForestFireDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CeilingSpikeDef {
  x: number;      // World pixel X
  y: number;      // World pixel Y (overhead / ceiling: 0 to 60px, or underneath high obstacles)
  width: number;  // Width in pixels
  height: number; // Height in pixels (typically 24 to 28px)
}

export interface CollectibleDef {
  x: number;      // World pixel X
  y: number;      // World pixel Y
  type: 'carteira' | 'estrela' | 'povo_feliz' | 'povo_feliz' | 'diploma' | 'presal' | 'coin';
}

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  era: string;
  theme: 'abc' | 'comicio' | 'planalto';
  musicTrack: BGMTrack;
  worldWidth: number;
  spawnX: number;
  spawnY: number;
  goalX: number;
  goalY: number;
  timeLimit: number;
  blocks: BlockDef[];
  enemies: EnemyDef[];
  boss: BossDef;
  fires: ForestFireDef[];
  ceilingSpikes: CeilingSpikeDef[];
  collectibles: CollectibleDef[];
  factSheet: {
    title: string;
    subtitle: string;
    date: string;
    highlight: string;
    description: string;
    sources: string[];
  };
}

export const TILE_SIZE = 32;

export const LEVELS: LevelData[] = [
  // ==========================================
  // LEVEL 1: O Metalúrgico do ABC (1975–1980)
  // ==========================================
  {
    id: 1,
    name: 'Mundo 1: O Metalúrgico do ABC',
    subtitle: 'As Greves Operárias e a Luta por Direitos',
    era: '1975 – 1980',
    theme: 'abc',
    musicTrack: 'abc',
    worldWidth: 3800,
    spawnX: 64,
    spawnY: 340,
    goalX: 3550,
    goalY: 200,
    timeLimit: 300,
    blocks: [
      // Ground floor 0..70
      ...Array.from({ length: 70 }, (_, i) => ({
        x: i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 70 }, (_, i) => ({
        x: i,
        y: 14,
        type: 'ground' as BlockType,
      })),

      // Ground floor 75..125
      ...Array.from({ length: 50 }, (_, i) => ({
        x: 75 + i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 50 }, (_, i) => ({
        x: 75 + i,
        y: 14,
        type: 'ground' as BlockType,
      })),

      // Initial Factory Question Block cluster
      { x: 14, y: 9, type: 'question', itemInside: 'coin' },
      { x: 18, y: 9, type: 'brick' },
      { x: 19, y: 9, type: 'question', itemInside: 'estrela' }, // Super Estrela Vermelha!
      { x: 20, y: 9, type: 'brick' },
      { x: 21, y: 9, type: 'question', itemInside: 'carteira' }, // Carteira de Trabalho!
      { x: 22, y: 9, type: 'brick' },

      // High mystery block
      { x: 20, y: 5, type: 'question', itemInside: 'povo_feliz' },

      // Factory assembly obstacles
      { x: 28, y: 11, type: 'brick' },
      { x: 28, y: 12, type: 'brick' },
      { x: 29, y: 11, type: 'brick' },
      { x: 29, y: 12, type: 'brick' },

      // Flying platforms
      { x: 34, y: 9, type: 'brick' },
      { x: 35, y: 9, type: 'brick' },
      { x: 36, y: 9, type: 'question', itemInside: 'carteira' },
      { x: 37, y: 9, type: 'brick' },

      // High industrial scaffolding
      { x: 44, y: 10, type: 'brick' },
      { x: 44, y: 11, type: 'brick' },
      { x: 45, y: 10, type: 'brick' },
      { x: 45, y: 11, type: 'brick' },

      // Over pit platforms
      { x: 52, y: 8, type: 'question', itemInside: 'coin' },
      { x: 55, y: 7, type: 'question', itemInside: 'diploma' },
      { x: 58, y: 8, type: 'question', itemInside: 'carteira' },

      // Post-pit stairs
      { x: 80, y: 12, type: 'brick' },
      { x: 81, y: 12, type: 'brick' },
      { x: 81, y: 11, type: 'brick' },

      // Goal staircase
      { x: 101, y: 12, type: 'brick' },
      { x: 102, y: 12, type: 'brick' },
      { x: 102, y: 11, type: 'brick' },
      { x: 103, y: 12, type: 'brick' },
      { x: 103, y: 11, type: 'brick' },
      { x: 103, y: 10, type: 'brick' },
    ],
    enemies: [
      { x: 340, y: 380, type: 'boi' },
      { x: 440, y: 380, type: 'censor' },
      { x: 540, y: 380, type: 'orange' },
      { x: 660, y: 380, type: 'boi' },
      { x: 760, y: 380, type: 'minion' },
      { x: 860, y: 380, type: 'censor' },
      { x: 960, y: 380, type: 'boi' },
      { x: 1060, y: 380, type: 'orange' },
      { x: 1180, y: 380, type: 'minion' },
      { x: 1280, y: 380, type: 'boi' },
      { x: 1380, y: 380, type: 'censor' },
      { x: 1480, y: 380, type: 'orange' },
      { x: 1580, y: 380, type: 'boi' },
      { x: 1680, y: 380, type: 'minion' },
      { x: 1780, y: 380, type: 'boi' },
      { x: 1880, y: 380, type: 'censor' },
      { x: 1980, y: 380, type: 'orange' },
      { x: 2080, y: 380, type: 'boi' },
      { x: 2180, y: 380, type: 'minion' },
      { x: 2480, y: 380, type: 'censor' },
      { x: 2580, y: 380, type: 'boi' },
      { x: 2680, y: 380, type: 'minion' },
      { x: 2780, y: 380, type: 'boi' },
      { x: 2880, y: 380, type: 'censor' },
      { x: 2980, y: 380, type: 'orange' },
      { x: 3080, y: 380, type: 'boi' },
      { x: 3180, y: 380, type: 'minion' },
      { x: 3260, y: 380, type: 'boi' },
      { x: 3340, y: 380, type: 'censor' },
      { x: 3420, y: 380, type: 'orange' },
    ],
    boss: {
      type: 'laranja',
      name: 'O GRANDE LARANJÃO',
      x: 3250,
      y: 330,
      width: 56,
      height: 56,
      maxHp: 3,
    },
    fires: [
      { x: 380, y: 384, width: 36, height: 32 },
      { x: 500, y: 384, width: 36, height: 32 },
      { x: 640, y: 384, width: 36, height: 32 },
      { x: 780, y: 384, width: 36, height: 32 },
      { x: 860, y: 384, width: 36, height: 32 },
      { x: 980, y: 384, width: 36, height: 32 },
      { x: 1100, y: 256, width: 36, height: 32 }, // On obstacle platform
      { x: 1180, y: 384, width: 36, height: 32 },
      { x: 1280, y: 384, width: 36, height: 32 },
      { x: 1420, y: 288, width: 36, height: 32 }, // On scaffolding obstacle
      { x: 1520, y: 384, width: 36, height: 32 },
      { x: 1640, y: 384, width: 36, height: 32 },
      { x: 1780, y: 384, width: 36, height: 32 },
      { x: 1900, y: 384, width: 36, height: 32 },
      { x: 2020, y: 384, width: 36, height: 32 },
      { x: 2120, y: 384, width: 36, height: 32 },
      { x: 2220, y: 384, width: 36, height: 32 }, // Near pit edge
      { x: 2480, y: 384, width: 36, height: 32 },
      { x: 2600, y: 384, width: 36, height: 32 }, // After pit
      { x: 2720, y: 384, width: 36, height: 32 },
      { x: 2840, y: 384, width: 36, height: 32 },
      { x: 2960, y: 384, width: 36, height: 32 },
      { x: 3080, y: 384, width: 36, height: 32 },
      { x: 3200, y: 384, width: 36, height: 32 },
      { x: 3320, y: 384, width: 36, height: 32 },
    ],
    ceilingSpikes: [
      { x: 380, y: 24, width: 96, height: 26 },
      { x: 880, y: 20, width: 128, height: 26 },
      { x: 1350, y: 24, width: 140, height: 26 },
      { x: 1750, y: 20, width: 120, height: 26 },
      { x: 2240, y: 32, width: 200, height: 26 }, // Above deep pit
      { x: 2700, y: 24, width: 128, height: 26 },
      { x: 3150, y: 20, width: 140, height: 26 },
    ],
    collectibles: [
      { x: 320, y: 360, type: 'carteira' },
      { x: 360, y: 360, type: 'coin' },
      { x: 1150, y: 240, type: 'carteira' },
      { x: 1200, y: 240, type: 'coin' },
      { x: 1750, y: 360, type: 'coin' },
      { x: 2750, y: 210, type: 'carteira' },
    ],
    factSheet: {
      title: 'HISTÓRIA: AS HISTÓRICAS GREVES DO ABC',
      subtitle: 'O Nascimento do Novo Sindicalismo e a Luta Operária',
      date: '1975 – 1980',
      highlight: 'Mais de 100 mil operários paralisados e o nascimento da liderança popular',
      description:
        'Lula trabalhou como torneiro mecânico nas indústrias automotivas de São Bernardo do Campo. Eleito presidente do Sindicato dos Metalúrgicos, liderou as históricas greves de 1978 e 1979 no Estádio da Vila Euclides, desafiando a censura militar, reivindicando reposição salarial e pavimentando o caminho para a redemocratização do Brasil.',
      sources: ['Memorial da Democracia', 'Fundação Perseu Abramo', 'Arquivo Histórico do ABC'],
    },
  },

  // ==========================================
  // LEVEL 2: As Diretas Já e a Constituinte (1984–1988)
  // ==========================================
  {
    id: 2,
    name: 'Mundo 2: As Diretas Já e a Constituinte',
    subtitle: 'Comícios Populares e a Constituição Cidadã',
    era: '1984 – 1988',
    theme: 'comicio',
    musicTrack: 'title',
    worldWidth: 4000,
    spawnX: 64,
    spawnY: 340,
    goalX: 3750,
    goalY: 200,
    timeLimit: 320,
    blocks: [
      ...Array.from({ length: 65 }, (_, i) => ({
        x: i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 65 }, (_, i) => ({
        x: i,
        y: 14,
        type: 'ground' as BlockType,
      })),
      ...Array.from({ length: 60 }, (_, i) => ({
        x: 70 + i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 60 }, (_, i) => ({
        x: 70 + i,
        y: 14,
        type: 'ground' as BlockType,
      })),

      // Rally stage blocks
      { x: 12, y: 9, type: 'brick' },
      { x: 13, y: 9, type: 'question', itemInside: 'diploma' },
      { x: 14, y: 9, type: 'brick' },

      { x: 22, y: 8, type: 'question', itemInside: 'coin' },
      { x: 23, y: 8, type: 'brick' },
      { x: 24, y: 8, type: 'question', itemInside: 'carteira' },

      // High speech palanques
      { x: 35, y: 9, type: 'brick' },
      { x: 36, y: 9, type: 'brick' },
      { x: 42, y: 7, type: 'question', itemInside: 'coin' },
      { x: 48, y: 6, type: 'question', itemInside: 'diploma' },

      // Stairway
      { x: 114, y: 12, type: 'brick' },
      { x: 115, y: 12, type: 'brick' },
      { x: 115, y: 11, type: 'brick' },
      { x: 116, y: 12, type: 'brick' },
      { x: 116, y: 11, type: 'brick' },
      { x: 116, y: 10, type: 'brick' },
    ],
    enemies: [
      { x: 320, y: 380, type: 'boi' },
      { x: 420, y: 380, type: 'ghost' },
      { x: 520, y: 380, type: 'minion' },
      { x: 620, y: 380, type: 'boi' },
      { x: 720, y: 380, type: 'especulador' },
      { x: 820, y: 380, type: 'boi' },
      { x: 920, y: 380, type: 'minion' },
      { x: 1020, y: 380, type: 'especulador' },
      { x: 1120, y: 380, type: 'boi' },
      { x: 1220, y: 380, type: 'ghost' },
      { x: 1320, y: 380, type: 'boi' },
      { x: 1420, y: 380, type: 'minion' },
      { x: 1520, y: 380, type: 'boi' },
      { x: 1620, y: 380, type: 'especulador' },
      { x: 1720, y: 380, type: 'ghost' },
      { x: 1820, y: 380, type: 'boi' },
      { x: 1920, y: 380, type: 'minion' },
      { x: 2020, y: 380, type: 'boi' },
      { x: 2120, y: 380, type: 'especulador' },
      { x: 2220, y: 380, type: 'ghost' },
      { x: 2320, y: 380, type: 'boi' },
      { x: 2420, y: 380, type: 'minion' },
      { x: 2520, y: 380, type: 'ghost' },
      { x: 2620, y: 380, type: 'especulador' },
      { x: 2720, y: 380, type: 'boi' },
      { x: 2820, y: 380, type: 'minion' },
      { x: 2920, y: 380, type: 'boi' },
      { x: 3020, y: 380, type: 'ghost' },
      { x: 3120, y: 380, type: 'boi' },
      { x: 3220, y: 380, type: 'especulador' },
      { x: 3320, y: 380, type: 'ghost' },
      { x: 3420, y: 380, type: 'boi' },
      { x: 3520, y: 380, type: 'minion' },
      { x: 3620, y: 380, type: 'boi' },
    ],
    boss: {
      type: 'fantasma',
      name: 'O FANTASMA DA CENSURA',
      x: 3450,
      y: 310,
      width: 56,
      height: 56,
      maxHp: 3,
    },
    fires: [
      { x: 360, y: 384, width: 36, height: 32 },
      { x: 480, y: 384, width: 36, height: 32 },
      { x: 600, y: 384, width: 36, height: 32 },
      { x: 740, y: 288, width: 36, height: 32 }, // On rally brick obstacle
      { x: 840, y: 384, width: 36, height: 32 },
      { x: 960, y: 384, width: 36, height: 32 },
      { x: 1080, y: 384, width: 36, height: 32 },
      { x: 1200, y: 384, width: 36, height: 32 },
      { x: 1350, y: 224, width: 36, height: 32 }, // On high palanque platform
      { x: 1440, y: 384, width: 36, height: 32 },
      { x: 1560, y: 384, width: 36, height: 32 },
      { x: 1680, y: 384, width: 36, height: 32 },
      { x: 1800, y: 384, width: 36, height: 32 },
      { x: 1940, y: 384, width: 36, height: 32 },
      { x: 2050, y: 384, width: 36, height: 32 },
      { x: 2180, y: 384, width: 36, height: 32 },
      { x: 2320, y: 384, width: 36, height: 32 },
      { x: 2460, y: 384, width: 36, height: 32 },
      { x: 2600, y: 384, width: 36, height: 32 },
      { x: 2750, y: 384, width: 36, height: 32 },
      { x: 2900, y: 384, width: 36, height: 32 },
      { x: 3040, y: 384, width: 36, height: 32 },
      { x: 3180, y: 384, width: 36, height: 32 },
      { x: 3320, y: 384, width: 36, height: 32 },
      { x: 3480, y: 384, width: 36, height: 32 },
    ],
    ceilingSpikes: [
      { x: 450, y: 24, width: 120, height: 26 },
      { x: 950, y: 20, width: 140, height: 26 },
      { x: 1450, y: 24, width: 128, height: 26 },
      { x: 2000, y: 20, width: 180, height: 26 },
      { x: 2600, y: 24, width: 140, height: 26 },
      { x: 3100, y: 20, width: 150, height: 26 },
    ],
    collectibles: [
      { x: 400, y: 360, type: 'diploma' },
      { x: 750, y: 220, type: 'diploma' },
      { x: 1350, y: 180, type: 'carteira' },
      { x: 2100, y: 200, type: 'diploma' },
    ],
    factSheet: {
      title: 'HISTÓRIA: AS DIRETAS JÁ E A CONSTITUINTE',
      subtitle: 'A Voz do Povo e a Carta Cidadã de 1988',
      date: '1984 – 1988',
      highlight: 'Lula foi o deputado constituinte mais votado do país em 1986',
      description:
        'Lula foi uma das vozes mais ativas do comício das Diretas Já na Praça da Sé e no Candelária. Em 1986, foi eleito o deputado federal constituinte mais votado do Brasil com mais de 650 mil votos, atuando na consolidação dos direitos trabalhistas, da previdência social e da liberdade sindical na Constituição Cidadã de 1988.',
      sources: ['Câmara dos Deputados', 'Acervo Histórico das Diretas Já', 'Constituição Federal de 1988'],
    },
  },

  // ==========================================
  // LEVEL 3: A Esperança Vence o Medo (2002)
  // ==========================================
  {
    id: 3,
    name: 'Mundo 3: A Vitória da Esperança',
    subtitle: 'As Caravanas da Cidadania e a Eleição de 2002',
    era: '2002',
    theme: 'planalto',
    musicTrack: 'esperanca',
    worldWidth: 4200,
    spawnX: 64,
    spawnY: 340,
    goalX: 3950,
    goalY: 200,
    timeLimit: 320,
    blocks: [
      ...Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: 14,
        type: 'ground' as BlockType,
      })),
      ...Array.from({ length: 70 }, (_, i) => ({
        x: 68 + i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 70 }, (_, i) => ({
        x: 68 + i,
        y: 14,
        type: 'ground' as BlockType,
      })),

      { x: 15, y: 9, type: 'question', itemInside: 'carteira' },
      { x: 25, y: 8, type: 'question', itemInside: 'coin' },
      { x: 35, y: 7, type: 'question', itemInside: 'coin' },
      { x: 45, y: 6, type: 'question', itemInside: 'diploma' },

      // Grand Planalto stairway
      { x: 118, y: 12, type: 'brick' },
      { x: 119, y: 12, type: 'brick' },
      { x: 119, y: 11, type: 'brick' },
      { x: 120, y: 12, type: 'brick' },
      { x: 120, y: 11, type: 'brick' },
      { x: 120, y: 10, type: 'brick' },
    ],
    enemies: [
      { x: 320, y: 380, type: 'minion' },
      { x: 440, y: 380, type: 'boi' },
      { x: 560, y: 380, type: 'orange' },
      { x: 680, y: 380, type: 'boi' },
      { x: 800, y: 380, type: 'minion' },
      { x: 920, y: 380, type: 'boi' },
      { x: 1040, y: 380, type: 'especulador' },
      { x: 1160, y: 380, type: 'boi' },
      { x: 1280, y: 380, type: 'orange' },
      { x: 1400, y: 380, type: 'boi' },
      { x: 1520, y: 380, type: 'minion' },
      { x: 1640, y: 380, type: 'boi' },
      { x: 1760, y: 380, type: 'especulador' },
      { x: 1880, y: 380, type: 'boi' },
      { x: 2000, y: 380, type: 'minion' },
      { x: 2120, y: 380, type: 'boi' },
      { x: 2240, y: 380, type: 'orange' },
      { x: 2360, y: 380, type: 'boi' },
      { x: 2480, y: 380, type: 'minion' },
      { x: 2600, y: 380, type: 'boi' },
      { x: 2720, y: 380, type: 'especulador' },
      { x: 2840, y: 380, type: 'boi' },
      { x: 2960, y: 380, type: 'minion' },
      { x: 3080, y: 380, type: 'boi' },
      { x: 3200, y: 380, type: 'orange' },
      { x: 3300, y: 380, type: 'boi' },
      { x: 3400, y: 380, type: 'minion' },
      { x: 3500, y: 380, type: 'boi' },
      { x: 3600, y: 380, type: 'orange' },
      { x: 3700, y: 380, type: 'boi' },
      { x: 3780, y: 380, type: 'minion' },
      { x: 3860, y: 380, type: 'boi' },
      { x: 3920, y: 380, type: 'especulador' },
      { x: 3980, y: 380, type: 'minion' },
      { x: 4050, y: 380, type: 'boi' },
    ],
    boss: {
      type: 'patriota',
      name: 'O MÍNION DO CAMINHÃO',
      x: 3650,
      y: 330,
      width: 56,
      height: 56,
      maxHp: 4,
    },
    fires: [
      { x: 360, y: 384, width: 36, height: 32 },
      { x: 480, y: 384, width: 36, height: 32 },
      { x: 620, y: 384, width: 36, height: 32 },
      { x: 800, y: 288, width: 36, height: 32 }, // On caravan platform
      { x: 920, y: 384, width: 36, height: 32 },
      { x: 1060, y: 384, width: 36, height: 32 },
      { x: 1200, y: 384, width: 36, height: 32 },
      { x: 1320, y: 384, width: 36, height: 32 },
      { x: 1450, y: 224, width: 36, height: 32 }, // On high brick obstacle
      { x: 1560, y: 384, width: 36, height: 32 },
      { x: 1680, y: 384, width: 36, height: 32 },
      { x: 1820, y: 384, width: 36, height: 32 },
      { x: 1960, y: 384, width: 36, height: 32 },
      { x: 2100, y: 384, width: 36, height: 32 },
      { x: 2240, y: 384, width: 36, height: 32 },
      { x: 2380, y: 384, width: 36, height: 32 },
      { x: 2520, y: 384, width: 36, height: 32 },
      { x: 2660, y: 384, width: 36, height: 32 },
      { x: 2800, y: 384, width: 36, height: 32 },
      { x: 2940, y: 384, width: 36, height: 32 },
      { x: 3080, y: 384, width: 36, height: 32 },
      { x: 3220, y: 384, width: 36, height: 32 },
      { x: 3360, y: 384, width: 36, height: 32 },
      { x: 3500, y: 384, width: 36, height: 32 },
      { x: 3640, y: 384, width: 36, height: 32 },
      { x: 3780, y: 384, width: 36, height: 32 },
    ],
    ceilingSpikes: [
      { x: 420, y: 24, width: 128, height: 26 },
      { x: 900, y: 20, width: 150, height: 26 },
      { x: 1400, y: 24, width: 140, height: 26 },
      { x: 1950, y: 20, width: 160, height: 26 },
      { x: 2500, y: 24, width: 140, height: 26 },
      { x: 3050, y: 20, width: 160, height: 26 },
      { x: 3550, y: 24, width: 120, height: 26 },
    ],
    collectibles: [
      { x: 350, y: 360, type: 'coin' },
      { x: 750, y: 220, type: 'carteira' },
      { x: 1400, y: 190, type: 'carteira' },
      { x: 2200, y: 200, type: 'coin' },
    ],
    factSheet: {
      title: 'HISTÓRIA: A ESPERANÇA VENCEU O MEDO',
      subtitle: 'A Eleição Histórica de 2002 e a Subida da Rampa',
      date: 'Outubro de 2002',
      highlight: '52,7 milhões de votos - o primeiro operário eleito presidente do Brasil',
      description:
        'Após percorrer o interior do país nas Caravanas da Cidadania e lançar a Carta ao Povo Brasileiro, Lula foi eleito presidente em 2002 com mais de 61% dos votos válidos. Em seu discurso de posse em 1º de janeiro de 2003, prometeu que sua missão seria garantir três refeições por dia a todos os brasileiros.',
      sources: ['Tribunal Superior Eleitoral (TSE)', 'Biblioteca da Presidência da República', 'Discurso de Posse de 2003'],
    },
  },

  // ==========================================
  // LEVEL 4: As Reformas Sociais e o Pré-Sal (2003–2010)
  // ==========================================
  {
    id: 4,
    name: 'Mundo 4: A Era das Reformas Sociais',
    subtitle: 'Bolsa Família, Prouni, Transposição e Pré-Sal',
    era: '2003 – 2010',
    theme: 'planalto',
    musicTrack: 'ole_lula',
    worldWidth: 4400,
    spawnX: 64,
    spawnY: 340,
    goalX: 4150,
    goalY: 200,
    timeLimit: 340,
    blocks: [
      ...Array.from({ length: 55 }, (_, i) => ({
        x: i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 55 }, (_, i) => ({
        x: i,
        y: 14,
        type: 'ground' as BlockType,
      })),
      ...Array.from({ length: 70 }, (_, i) => ({
        x: 65 + i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 70 }, (_, i) => ({
        x: 65 + i,
        y: 14,
        type: 'ground' as BlockType,
      })),

      { x: 16, y: 9, type: 'question', itemInside: 'presal' }, // Pré-Sal!
      { x: 26, y: 7, type: 'question', itemInside: 'diploma' }, // Prouni/Fies!
      { x: 38, y: 8, type: 'question', itemInside: 'carteira' },
      { x: 50, y: 6, type: 'question', itemInside: 'coin' },

      { x: 122, y: 12, type: 'brick' },
      { x: 123, y: 12, type: 'brick' },
      { x: 123, y: 11, type: 'brick' },
      { x: 124, y: 12, type: 'brick' },
      { x: 124, y: 11, type: 'brick' },
      { x: 124, y: 10, type: 'brick' },
    ],
    enemies: [
      { x: 340, y: 380, type: 'censor' },
      { x: 460, y: 380, type: 'boi' },
      { x: 580, y: 380, type: 'minion' },
      { x: 700, y: 380, type: 'boi' },
      { x: 820, y: 380, type: 'especulador' },
      { x: 940, y: 380, type: 'boi' },
      { x: 1060, y: 380, type: 'orange' },
      { x: 1180, y: 380, type: 'boi' },
      { x: 1300, y: 380, type: 'censor' },
      { x: 1420, y: 380, type: 'boi' },
      { x: 1540, y: 380, type: 'minion' },
      { x: 1660, y: 380, type: 'boi' },
      { x: 1780, y: 380, type: 'especulador' },
      { x: 1900, y: 380, type: 'boi' },
      { x: 2020, y: 380, type: 'censor' },
      { x: 2140, y: 380, type: 'boi' },
      { x: 2260, y: 380, type: 'orange' },
      { x: 2380, y: 380, type: 'boi' },
      { x: 2500, y: 380, type: 'minion' },
      { x: 2620, y: 380, type: 'boi' },
      { x: 2740, y: 380, type: 'censor' },
      { x: 2860, y: 380, type: 'boi' },
      { x: 2980, y: 380, type: 'especulador' },
      { x: 3100, y: 380, type: 'boi' },
      { x: 3220, y: 380, type: 'orange' },
      { x: 3340, y: 380, type: 'boi' },
      { x: 3460, y: 380, type: 'minion' },
      { x: 3560, y: 380, type: 'censor' },
      { x: 3660, y: 380, type: 'boi' },
      { x: 3760, y: 380, type: 'especulador' },
      { x: 3860, y: 380, type: 'boi' },
      { x: 3940, y: 380, type: 'minion' },
      { x: 4020, y: 380, type: 'boi' },
      { x: 4080, y: 380, type: 'orange' },
      { x: 4140, y: 380, type: 'censor' },
      { x: 4200, y: 380, type: 'boi' },
    ],
    boss: {
      type: 'general',
      name: 'O GENERAL AUTORITÁRIO',
      x: 3850,
      y: 320,
      width: 56,
      height: 60,
      maxHp: 4,
    },
    fires: [
      { x: 380, y: 384, width: 40, height: 32 },
      { x: 500, y: 384, width: 40, height: 32 },
      { x: 640, y: 384, width: 40, height: 32 },
      { x: 780, y: 384, width: 40, height: 32 },
      { x: 850, y: 288, width: 40, height: 32 }, // On Prouni brick obstacle
      { x: 960, y: 384, width: 40, height: 32 },
      { x: 1080, y: 384, width: 40, height: 32 },
      { x: 1220, y: 384, width: 40, height: 32 },
      { x: 1360, y: 384, width: 40, height: 32 },
      { x: 1480, y: 384, width: 40, height: 32 },
      { x: 1600, y: 384, width: 40, height: 32 },
      { x: 1750, y: 256, width: 40, height: 32 }, // On social programs platform
      { x: 1860, y: 384, width: 40, height: 32 },
      { x: 2000, y: 384, width: 40, height: 32 },
      { x: 2140, y: 384, width: 40, height: 32 },
      { x: 2280, y: 384, width: 40, height: 32 },
      { x: 2420, y: 384, width: 40, height: 32 },
      { x: 2560, y: 384, width: 40, height: 32 },
      { x: 2700, y: 384, width: 40, height: 32 },
      { x: 2840, y: 384, width: 40, height: 32 },
      { x: 2980, y: 384, width: 40, height: 32 },
      { x: 3120, y: 384, width: 40, height: 32 },
      { x: 3260, y: 384, width: 40, height: 32 },
      { x: 3400, y: 384, width: 40, height: 32 },
      { x: 3540, y: 384, width: 40, height: 32 },
      { x: 3680, y: 384, width: 40, height: 32 },
    ],
    ceilingSpikes: [
      { x: 400, y: 24, width: 130, height: 26 },
      { x: 950, y: 20, width: 150, height: 26 },
      { x: 1500, y: 24, width: 140, height: 26 },
      { x: 2050, y: 20, width: 160, height: 26 },
      { x: 2700, y: 24, width: 150, height: 26 },
      { x: 3300, y: 20, width: 160, height: 26 },
      { x: 3750, y: 24, width: 120, height: 26 },
    ],
    collectibles: [
      { x: 450, y: 360, type: 'presal' },
      { x: 800, y: 200, type: 'diploma' },
      { x: 1600, y: 220, type: 'diploma' },
      { x: 2400, y: 180, type: 'presal' },
    ],
    factSheet: {
      title: 'HISTÓRIA: A ERA DAS CONQUISTAS SOCIAIS',
      subtitle: 'Bolsa Família, Expansão Universitária e o Pré-Sal',
      date: '2003 – 2010',
      highlight: 'Retirada do Brasil do Mapa da Fome da ONU e 87% de aprovação ao deixar o cargo',
      description:
        'Durante seus dois mandatos, mais de 36 milhões de brasileiros saíram da extrema pobreza com o Bolsa Família e a valorização do salário mínimo. O Prouni e Reuni abriram vagas nas universidades para filhos de trabalhadores, as obras da Transposição do São Francisco levaram água ao sertão e a descoberta do Pré-Sal garantiu royalties para saúde e educação.',
      sources: ['IPEA', 'UNESCO / ONU', 'Ministério da Educação (MEC)', 'Petrobras'],
    },
  },

  // ==========================================
  // LEVEL 5: O Retorno e a Frente Ampla (2022–Atual)
  // ==========================================
  {
    id: 5,
    name: 'Mundo 5: O Retorno e a Frente Ampla',
    subtitle: 'A Defesa da Democracia e a Subida com o Povo',
    era: '2022 – Atualidade',
    theme: 'planalto',
    musicTrack: 'esperanca',
    worldWidth: 4600,
    spawnX: 64,
    spawnY: 340,
    goalX: 4350,
    goalY: 200,
    timeLimit: 360,
    blocks: [
      ...Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: 14,
        type: 'ground' as BlockType,
      })),
      ...Array.from({ length: 80 }, (_, i) => ({
        x: 68 + i,
        y: 13,
        type: 'ground_top' as BlockType,
      })),
      ...Array.from({ length: 80 }, (_, i) => ({
        x: 68 + i,
        y: 14,
        type: 'ground' as BlockType,
      })),

      { x: 18, y: 9, type: 'question', itemInside: 'diploma' },
      { x: 30, y: 8, type: 'question', itemInside: 'coin' },
      { x: 44, y: 7, type: 'question', itemInside: 'coin' },
      { x: 58, y: 6, type: 'question', itemInside: 'carteira' },

      // Grand Rampa do Planalto Stairway
      { x: 126, y: 12, type: 'brick' },
      { x: 127, y: 12, type: 'brick' },
      { x: 127, y: 11, type: 'brick' },
      { x: 128, y: 12, type: 'brick' },
      { x: 128, y: 11, type: 'brick' },
      { x: 128, y: 10, type: 'brick' },
      { x: 129, y: 12, type: 'brick' },
      { x: 129, y: 11, type: 'brick' },
      { x: 129, y: 10, type: 'brick' },
      { x: 129, y: 9, type: 'brick' },
    ],
    enemies: [
      { x: 340, y: 380, type: 'boi' },
      { x: 460, y: 380, type: 'minion' },
      { x: 580, y: 380, type: 'boi' },
      { x: 700, y: 380, type: 'ghost' },
      { x: 820, y: 380, type: 'boi' },
      { x: 940, y: 380, type: 'orange' },
      { x: 1060, y: 380, type: 'boi' },
      { x: 1180, y: 380, type: 'minion' },
      { x: 1300, y: 380, type: 'boi' },
      { x: 1420, y: 380, type: 'ghost' },
      { x: 1540, y: 380, type: 'boi' },
      { x: 1660, y: 380, type: 'orange' },
      { x: 1780, y: 380, type: 'boi' },
      { x: 1900, y: 380, type: 'minion' },
      { x: 2020, y: 380, type: 'boi' },
      { x: 2140, y: 380, type: 'ghost' },
      { x: 2260, y: 380, type: 'boi' },
      { x: 2380, y: 380, type: 'orange' },
      { x: 2500, y: 380, type: 'boi' },
      { x: 2620, y: 380, type: 'minion' },
      { x: 2740, y: 380, type: 'boi' },
      { x: 2860, y: 380, type: 'ghost' },
      { x: 2980, y: 380, type: 'boi' },
      { x: 3100, y: 380, type: 'orange' },
      { x: 3220, y: 380, type: 'boi' },
      { x: 3340, y: 380, type: 'minion' },
      { x: 3460, y: 380, type: 'boi' },
      { x: 3580, y: 380, type: 'ghost' },
      { x: 3700, y: 380, type: 'boi' },
      { x: 3820, y: 380, type: 'orange' },
      { x: 3940, y: 380, type: 'boi' },
      { x: 4040, y: 380, type: 'minion' },
      { x: 4120, y: 380, type: 'boi' },
      { x: 4200, y: 380, type: 'ghost' },
      { x: 4280, y: 380, type: 'boi' },
      { x: 4360, y: 380, type: 'orange' },
      { x: 4420, y: 380, type: 'boi' },
      { x: 4480, y: 380, type: 'minion' },
    ],
    boss: {
      type: 'palhaco',
      name: 'O PALHAÇO DA DESINFORMAÇÃO',
      x: 4050,
      y: 320,
      width: 58,
      height: 62,
      maxHp: 5,
    },
    fires: [
      { x: 380, y: 384, width: 40, height: 32 },
      { x: 500, y: 384, width: 40, height: 32 },
      { x: 640, y: 384, width: 40, height: 32 },
      { x: 780, y: 384, width: 40, height: 32 },
      { x: 920, y: 288, width: 40, height: 32 }, // On democracy ramp brick obstacle
      { x: 1040, y: 384, width: 40, height: 32 },
      { x: 1180, y: 384, width: 40, height: 32 },
      { x: 1320, y: 384, width: 40, height: 32 },
      { x: 1460, y: 384, width: 40, height: 32 },
      { x: 1600, y: 384, width: 40, height: 32 },
      { x: 1740, y: 384, width: 40, height: 32 },
      { x: 1880, y: 384, width: 40, height: 32 },
      { x: 1950, y: 224, width: 40, height: 32 }, // On high union platform
      { x: 2060, y: 384, width: 40, height: 32 },
      { x: 2200, y: 384, width: 40, height: 32 },
      { x: 2340, y: 384, width: 40, height: 32 },
      { x: 2480, y: 384, width: 40, height: 32 },
      { x: 2620, y: 384, width: 40, height: 32 },
      { x: 2760, y: 384, width: 40, height: 32 },
      { x: 2900, y: 384, width: 40, height: 32 },
      { x: 3040, y: 384, width: 40, height: 32 },
      { x: 3180, y: 384, width: 40, height: 32 },
      { x: 3320, y: 384, width: 40, height: 32 },
      { x: 3460, y: 384, width: 40, height: 32 },
      { x: 3600, y: 384, width: 40, height: 32 },
      { x: 3740, y: 384, width: 40, height: 32 },
      { x: 3880, y: 384, width: 40, height: 32 },
      { x: 4000, y: 384, width: 40, height: 32 },
    ],
    ceilingSpikes: [
      { x: 420, y: 24, width: 140, height: 26 },
      { x: 980, y: 20, width: 160, height: 26 },
      { x: 1550, y: 24, width: 150, height: 26 },
      { x: 2150, y: 20, width: 160, height: 26 },
      { x: 2750, y: 24, width: 150, height: 26 },
      { x: 3400, y: 20, width: 160, height: 26 },
      { x: 3950, y: 24, width: 130, height: 26 },
    ],
    collectibles: [
      { x: 500, y: 360, type: 'coin' },
      { x: 1100, y: 220, type: 'carteira' },
      { x: 1800, y: 200, type: 'diploma' },
      { x: 2600, y: 180, type: 'carteira' },
      { x: 3400, y: 160, type: 'presal' },
    ],
    factSheet: {
      title: 'HISTÓRIA: O RETORNO E A FRENTE AMPLA',
      subtitle: 'A Vitória Eleitoral de 2022 e a Defesa Institucional',
      date: '2022 – Atualidade',
      highlight: '60,3 milhões de votos e a posse histórica com representantes da diversidade',
      description:
        'Lula construiu uma ampla união com forças democráticas de diversos espectros políticos e venceu as eleições de 2022. Na posse de 1º de janeiro de 2023, subiu a rampa do Palácio do Planalto ao lado de indígenas, pessoas com deficiência, trabalhadores, crianças e a cadela Resistência, reafirmando o compromisso com a paz, a democracia e a inclusão social.',
      sources: ['TSE', 'Constituição Federal', 'G20 Brasil 2024', 'Imprensa Nacional'],
    },
  },
];
