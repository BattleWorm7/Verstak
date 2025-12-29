
export enum RoomStyle {
  SCANDI = 'scandi',
  LOFT = 'loft',
  MINIMALISM = 'minimalism'
}

export enum RoomType {
  BEDROOM = 'bedroom',
  LIVING_ROOM = 'living_room',
  OFFICE = 'office'
}

export interface FurnitureItem {
  id: string;
  type: string;
  x: number; // in relative units or cm
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
}

export interface RoomConfig {
  width: number; // in cm
  height: number; // in cm
  style: RoomStyle;
  type: RoomType;
}

export interface DesignProject {
  id: string;
  name: string;
  config: RoomConfig;
  furniture: FurnitureItem[];
  aiImageUrl?: string;
  advice: string[];
  createdAt: number;
}

export interface LayoutResponse {
  furniture: Omit<FurnitureItem, 'id'>[];
  advice: string[];
}
