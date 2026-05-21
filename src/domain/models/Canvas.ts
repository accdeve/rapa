import type { BaseEntity } from './common';

export type CanvasItemType = 'idea' | 'support';

export interface CanvasItem extends BaseEntity {
  roomId: string;
  type: CanvasItemType;
  parentId?: string;
  content: string;
  color?: string;
  xPos: number;
  yPos: number;
  metadata?: Record<string, any>;
}

export interface Idea extends CanvasItem {
  type: 'idea';
  label: string;
}

export interface Support extends CanvasItem {
  type: 'support';
  parentId: string;
}
