
import { RoomStyle, RoomType } from './types';

export const STYLES_CONFIG = {
  [RoomStyle.SCANDI]: {
    name: 'Скандинавский',
    description: 'Светлые тона, натуральное дерево, функциональность и уют.',
    palette: ["#FFFFFF", "#F5F5F5", "#D1D5DB", "#4B5563", "#93C5FD"],
    materials: 'светлый дуб, лен, шерсть, белая краска'
  },
  [RoomStyle.LOFT]: {
    name: 'Лофт',
    description: 'Индустриальный стиль: кирпич, металл, открытые пространства.',
    palette: ["#374151", "#4B5563", "#1F2937", "#991B1B", "#D97706"],
    materials: 'красный кирпич, черный металл, бетон, темная кожа'
  },
  [RoomStyle.MINIMALISM]: {
    name: 'Минимализм',
    description: 'Чистые линии, монохромность, максимум свободного пространства.',
    palette: ["#000000", "#FFFFFF", "#F3F4F6", "#9CA3AF", "#D1D5DB"],
    materials: 'стекло, полированный камень, матовый пластик'
  }
};

export const FURNITURE_CATALOG = [
  { type: 'bed', name: 'Кровать двуспальная', symbol: '🛏️', width: 180, height: 200, category: 'Спальня' },
  { type: 'sofa', name: 'Диван угловой', symbol: '🛋️', width: 250, height: 160, category: 'Гостиная' },
  { type: 'desk', name: 'Рабочий стол', symbol: '🖥️', width: 140, height: 70, category: 'Офис' },
  { type: 'chair', name: 'Кресло', symbol: '🪑', width: 60, height: 60, category: 'Гостиная' },
  { type: 'wardrobe', name: 'Шкаф-купе', symbol: '🚪', width: 200, height: 60, category: 'Спальня' },
  { type: 'table', name: 'Обеденный стол', symbol: '🍽️', width: 120, height: 80, category: 'Кухня' },
  { type: 'plant', name: 'Растение', symbol: '🪴', width: 40, height: 40, category: 'Декор' },
  { type: 'rug', name: 'Ковер', symbol: '🧶', width: 200, height: 300, category: 'Декор' },
  { type: 'lamp', name: 'Торшер', symbol: '💡', width: 40, height: 40, category: 'Освещение' }
];

export const ROOM_TYPES = [
  { id: RoomType.BEDROOM, name: 'Спальня' },
  { id: RoomType.LIVING_ROOM, name: 'Гостиная' },
  { id: RoomType.OFFICE, name: 'Кабинет' }
];
