import type {
  LobbyCorridor,
  LobbyDestination,
  LobbyPoint,
} from '@/types/lobby';

/**
 * Todas as coordenadas estão em pixels nativos da arte (0–1254), não em porcentagem.
 * A renderização multiplica por `zoom`; a colisão trabalha sempre no espaço nativo.
 */
export const LOBBY_MAP = {
  src: '/art/lobby-map.png',
  size: 1254,
  zoom: 1.5,
  /**
   * Tamanho do avatar, independente do `zoom` do mapa. O personagem ocupa só
   * 28px dos 64px do quadro do sprite, então em escala 1 ele sairia com 28px
   * de altura contra uma porta de ~83px na arte. 2.3 o deixa proporcional às
   * construções; aumente para um avatar maior sem mexer no mapa.
   */
  playerScale: 2.3,
  playerRadius: 18,
  playerSpeed: 170,
  spawn: { x: 570, y: 1205 } as LobbyPoint,
  spawnDirection: 'up' as const,
};

/**
 * A malha caminhável é um conjunto de cápsulas (segmento + largura): um ponto é
 * caminhável quando sua distância até algum segmento cabe dentro da meia-largura.
 * Cápsulas acompanham as estradas diagonais da arte, o que retângulos não fariam.
 */
export const LOBBY_CORRIDORS: readonly LobbyCorridor[] = [
  // Estrada norte, do portão de pedra até o cruzamento.
  { a: { x: 600, y: 80 }, b: { x: 612, y: 620 }, width: 88 },
  // Clareira do cruzamento.
  { a: { x: 480, y: 634 }, b: { x: 740, y: 634 }, width: 108 },
  // Diagonal noroeste, em direção à casa de telhado azul.
  { a: { x: 500, y: 645 }, b: { x: 160, y: 505 }, width: 92 },
  // Trecho de terra em frente à casa.
  { a: { x: 250, y: 508 }, b: { x: 96, y: 502 }, width: 84 },
  // Subida curta até a escada da porta.
  { a: { x: 165, y: 505 }, b: { x: 165, y: 452 }, width: 68 },
  // Diagonal nordeste, em direção à loja de telhado vermelho.
  { a: { x: 680, y: 650 }, b: { x: 1090, y: 495 }, width: 98 },
  // Frente da loja.
  { a: { x: 1060, y: 505 }, b: { x: 1148, y: 472 }, width: 76 },
  // Estrada sul, do cruzamento até a curva inferior.
  { a: { x: 612, y: 630 }, b: { x: 606, y: 1080 }, width: 90 },
  // Curva larga na base do mapa.
  { a: { x: 606, y: 1080 }, b: { x: 500, y: 1170 }, width: 118 },
  // Saída sul (ponto de partida).
  { a: { x: 528, y: 1158 }, b: { x: 572, y: 1246 }, width: 96 },
  // Ramo decorativo oeste: portão da horta.
  { a: { x: 486, y: 1163 }, b: { x: 256, y: 1112 }, width: 88 },
  { a: { x: 256, y: 1112 }, b: { x: 250, y: 958 }, width: 78 },
  // Ramo decorativo leste: margem do lago.
  { a: { x: 610, y: 1086 }, b: { x: 834, y: 1092 }, width: 84 },
];

export const LOBBY_DESTINATIONS: readonly LobbyDestination[] = [
  {
    href: '/ranking',
    label: 'Hall da Fama',
    sign: 'Estrada do norte',
    icon: 'crown',
    arrival: { x: 602, y: 152 },
    radius: 62,
  },
  {
    href: '/perfil',
    label: 'Seu refúgio',
    sign: 'Casa do aventureiro',
    icon: 'grid',
    arrival: { x: 165, y: 464 },
    radius: 58,
  },
  {
    href: '/missions',
    label: 'Quadro de missões',
    sign: 'Loja da guilda',
    icon: 'scroll',
    arrival: { x: 1136, y: 478 },
    radius: 58,
  },
];
