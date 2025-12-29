
import React, { useRef, useEffect, useState } from 'react';
import { FurnitureItem, RoomConfig } from '../types';
import { FURNITURE_CATALOG } from '../constants';

interface RoomCanvasProps {
  config: RoomConfig;
  furniture: FurnitureItem[];
  onUpdateFurniture: (updated: FurnitureItem[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const RoomCanvas: React.FC<RoomCanvasProps> = ({ config, furniture, onUpdateFurniture, selectedId, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getScale = (canvas: HTMLCanvasElement) => {
    const pad = 60;
    return Math.min((canvas.width - pad * 2) / config.width, (canvas.height - pad * 2) / config.height);
  };

  const getOffsets = (canvas: HTMLCanvasElement, scale: number) => {
    const pad = 60;
    return {
      x: pad + (canvas.width - pad * 2 - config.width * scale) / 2,
      y: pad + (canvas.height - pad * 2 - config.height * scale) / 2
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = getScale(canvas);
    const { x: offX, y: offY } = getOffsets(canvas, scale);

    // Сетка (более стильная)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= config.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(offX + i * scale, offY);
      ctx.lineTo(offX + i * scale, offY + config.height * scale);
      ctx.stroke();
    }
    for (let i = 0; i <= config.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(offX, offY + i * scale);
      ctx.lineTo(offX + config.width * scale, offY + i * scale);
      ctx.stroke();
    }

    // Стены (Жирный контур)
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.strokeRect(offX, offY, config.width * scale, config.height * scale);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(offX, offY, config.width * scale, config.height * scale);

    // Мебель
    furniture.forEach((item) => {
      ctx.save();
      const cx = offX + item.x * scale;
      const cy = offY + item.y * scale;
      const w = item.width * scale;
      const h = item.height * scale;

      ctx.translate(cx, cy);
      ctx.rotate((item.rotation * Math.PI) / 180);

      const isSelected = item.id === selectedId;
      const isHovered = item.id === hoveredId;

      // Отрисовка направляющих при перемещении выбранного объекта
      if (isSelected && isDragging) {
        ctx.restore();
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;

        // Линии до стен
        // Горизонтальные
        ctx.beginPath();
        ctx.moveTo(offX, cy);
        ctx.lineTo(cx - (w/2 * Math.abs(Math.cos(item.rotation * Math.PI / 180))), cy);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cx + (w/2 * Math.abs(Math.cos(item.rotation * Math.PI / 180))), cy);
        ctx.lineTo(offX + config.width * scale, cy);
        ctx.stroke();

        // Вертикальные
        ctx.beginPath();
        ctx.moveTo(cx, offY);
        ctx.lineTo(cx, cy - (h/2 * Math.abs(Math.cos(item.rotation * Math.PI / 180))));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy + (h/2 * Math.abs(Math.cos(item.rotation * Math.PI / 180))));
        ctx.lineTo(cx, offY + config.height * scale);
        ctx.stroke();

        // Текст размеров (дистанция до стен)
        ctx.setLineDash([]);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter font-bold';
        ctx.fillText(`${Math.round(item.x)} см`, offX + (item.x * scale) / 2, cy - 5);
        ctx.fillText(`${Math.round(item.y)} см`, cx + 5, offY + (item.y * scale) / 2);

        ctx.restore();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((item.rotation * Math.PI) / 180);
      }

      // Стиль объекта
      if (isSelected) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(79, 70, 229, 0.5)';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
      }

      ctx.fillStyle = isSelected ? '#ffffff' : item.color;
      ctx.globalAlpha = isSelected ? 1 : 0.9;
      
      // Рисуем тело мебели
      ctx.beginPath();
      ctx.roundRect(-w/2, -h/2, w, h, 4);
      ctx.fill();
      ctx.stroke();

      // Направление (маленькая метка спереди)
      ctx.fillStyle = isSelected ? '#4f46e5' : '#475569';
      ctx.fillRect(-2, -h/2 - 5, 4, 5);

      // Иконка и название
      const catalogItem = FURNITURE_CATALOG.find(c => c.type === item.type);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${Math.min(w, h) * 0.3}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(catalogItem?.symbol || '?', 0, 0);

      ctx.restore();
    });
  };

  useEffect(() => {
    draw();
  }, [config, furniture, selectedId, hoveredId, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = getScale(canvas);
    const { x: offX, y: offY } = getOffsets(canvas, scale);

    const mouseX = (e.clientX - rect.left - offX) / scale;
    const mouseY = (e.clientY - rect.top - offY) / scale;

    const clickedItem = [...furniture].reverse().find(item => {
      const hw = item.width / 2;
      const hh = item.height / 2;
      // Учет поворота для попадания мышкой был бы идеален, но для прямоугольников оставим упрощенно
      return mouseX >= item.x - hw && mouseX <= item.x + hw && 
             mouseY >= item.y - hh && mouseY <= item.y + hh;
    });

    if (clickedItem) {
      onSelect(clickedItem.id);
      setIsDragging(true);
      setDragOffset({ x: mouseX - clickedItem.x, y: mouseY - clickedItem.y });
    } else {
      onSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = getScale(canvas);
    const { x: offX, y: offY } = getOffsets(canvas, scale);

    const mouseX = (e.clientX - rect.left - offX) / scale;
    const mouseY = (e.clientY - rect.top - offY) / scale;

    // Проверка ховера
    const overItem = [...furniture].reverse().find(item => {
      const hw = item.width / 2;
      const hh = item.height / 2;
      return mouseX >= item.x - hw && mouseX <= item.x + hw && 
             mouseY >= item.y - hh && mouseY <= item.y + hh;
    });
    setHoveredId(overItem?.id || null);

    if (!isDragging || !selectedId) return;

    const updated = furniture.map(item => {
      if (item.id === selectedId) {
        let nx = mouseX - dragOffset.x;
        let ny = mouseY - dragOffset.y;

        // Snapping (Прилипание к стенам)
        const snapDist = 10;
        if (nx - item.width/2 < snapDist) nx = item.width/2;
        if (nx + item.width/2 > config.width - snapDist) nx = config.width - item.width/2;
        if (ny - item.height/2 < snapDist) ny = item.height/2;
        if (ny + item.height/2 > config.height - snapDist) ny = config.height - item.height/2;

        // Общие границы
        nx = Math.max(item.width/2, Math.min(config.width - item.width/2, nx));
        ny = Math.max(item.height/2, Math.min(config.height - item.height/2, ny));

        return { ...item, x: nx, y: ny };
      }
      return item;
    });
    onUpdateFurniture(updated);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-xl overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full object-contain"
      />
      {/* Легенда в углу */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur p-2 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-bold pointer-events-none">
        СЕТКА: 50 СМ | ТЯНИТЕ ДЛЯ ПЕРЕМЕЩЕНИЯ
      </div>
    </div>
  );
};

export default RoomCanvas;
