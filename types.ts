export type NounType = 'countable' | 'uncountable';

export interface WordItem {
  word: string;
  type: NounType;
  translation: string;
  exampleSentence: string;
}

export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface GameConfig {
  topic: string;
  difficulty: 'easy' | 'hard';
}
