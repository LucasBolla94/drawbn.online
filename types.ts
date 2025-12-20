
export type Color = 'white' | 'purple' | 'cyan' | 'lime' | 'amber';
export type FontFamily = 'Inter' | 'Playfair Display' | 'Fira Code' | 'Caveat';

export interface Point {
  x: number;
  y: number;
}

export type ActionType = 'draw' | 'text' | 'erase';

export interface DrawingAction {
  id: string;
  type: ActionType;
  points: Point[];
  text?: string;
  color: string;
  brushSize: number;
  fontFamily?: FontFamily;
  isMagic: boolean;
  shape?: 'line' | 'square' | 'circle' | 'triangle';
}

export interface SessionState {
  id: string;
  actions: DrawingAction[];
}
