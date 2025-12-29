
import { GoogleGenAI } from "@google/genai";
import { RoomConfig } from "../types";
import { STYLES_CONFIG } from "../constants";

export const generateAIVisualization = async (config: RoomConfig, furniture: any[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const styleInfo = STYLES_CONFIG[config.style];
  
  const furnitureSummary = furniture.map(f => `${f.type} (${f.color})`).join(', ');
  
  // Промпт оптимизирован для высокого качества на основе плана
  const prompt = `Фотореалистичная 3D визуализация интерьера. 
    Тип комнаты: ${config.type === 'bedroom' ? 'спальня' : config.type === 'living_room' ? 'гостиная' : 'кабинет'}.
    Стиль: ${styleInfo.name}.
    Материалы отделки: ${styleInfo.materials}.
    Цветовая палитра: ${styleInfo.palette.join(', ')}.
    Мебель в комнате: ${furnitureSummary}.
    Освещение: естественный дневной свет из окна, мягкие тени. 
    Качество: 8k, photorealistic, architectural visualization, interior design magazine style.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) throw new Error("Изображение не создано");
    
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Данные изображения не найдены");
  } catch (error) {
    console.error("AI Visualization Error:", error);
    throw error;
  }
};

export const getDesignerAdvice = async (config: RoomConfig, furniture: any[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Ты - эксперт по дизайну интерьеров. Дай 3 конкретных совета по улучшению планировки для комнаты типа ${config.type} в стиле ${config.style}.
    Размеры комнаты: ${config.width}x${config.height}см. Расставлено мебели: ${furniture.length} предметов.
    Отвечай на русском языке в формате списка строк.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            advice: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    });
    const result = JSON.parse(response.text || '{"advice":[]}');
    return result.advice;
  } catch (e) {
    return ["Расположите мебель так, чтобы не перекрывать пути перемещения.", "Используйте зеркала для визуального расширения пространства.", "Добавьте разные сценарии освещения."];
  }
};
