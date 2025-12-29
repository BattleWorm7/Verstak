
import React, { useState, useEffect } from 'react';
import { RoomStyle, RoomType, RoomConfig, FurnitureItem, DesignProject } from './types';
import { STYLES_CONFIG, ROOM_TYPES, FURNITURE_CATALOG } from './constants';
import RoomCanvas from './components/RoomCanvas';
import { generateAIVisualization, getDesignerAdvice } from './services/geminiService';

enum Step { Welcome, RoomSetup, Furniture, Style, Visual }

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Welcome);
  const [config, setConfig] = useState<RoomConfig>({
    width: 500,
    height: 400,
    style: RoomStyle.SCANDI,
    type: RoomType.BEDROOM
  });
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const addFurniture = (item: typeof FURNITURE_CATALOG[0]) => {
    const newItem: FurnitureItem = {
      id: `f-${Date.now()}`,
      type: item.type,
      x: config.width / 2,
      y: config.height / 2,
      width: item.width,
      height: item.height,
      rotation: 0,
      color: STYLES_CONFIG[config.style].palette[2]
    };
    setFurniture([...furniture, newItem]);
    setSelectedId(newItem.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setFurniture(furniture.filter(f => f.id !== selectedId));
    setSelectedId(null);
  };

  const rotateSelected = () => {
    if (!selectedId) return;
    setFurniture(furniture.map(f => f.id === selectedId ? { ...f, rotation: (f.rotation + 45) % 360 } : f));
  };

  const handleVisualize = async () => {
    setIsBusy(true);
    setStep(Step.Visual);
    try {
      const [img, tips] = await Promise.all([
        generateAIVisualization(config, furniture),
        getDesignerAdvice(config, furniture)
      ]);
      setAiImage(img);
      setAdvice(tips);
    } catch (e) {
      alert("Ошибка генерации. Проверьте соединение.");
    } finally {
      setIsBusy(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.Welcome:
        return (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-5xl mb-8 shadow-2xl shadow-indigo-200 border-4 border-white">🏠</div>
            <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">AI Дизайнер Комнат</h1>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
              Профессиональный дизайн интерьера теперь доступен каждому. Нарисуйте план и позвольте ИИ создать фотореалистичную визуализацию.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setStep(Step.RoomSetup)}
                className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                Создать проект
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        );

      case Step.RoomSetup:
        return (
          <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl font-black mb-8 text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl">1</span>
              Размеры комнаты
            </h2>
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Тип помещения</label>
                <div className="grid grid-cols-3 gap-3">
                  {ROOM_TYPES.map(rt => (
                    <button
                      key={rt.id}
                      onClick={() => setConfig({ ...config, type: rt.id })}
                      className={`py-4 rounded-2xl border-2 font-bold transition-all ${config.type === rt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                    >
                      {rt.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Ширина (см)</label>
                  <input 
                    type="number" 
                    value={config.width} 
                    onChange={(e) => setConfig({...config, width: +e.target.value})} 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-lg" 
                    placeholder="Напр. 500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Глубина (см)</label>
                  <input 
                    type="number" 
                    value={config.height} 
                    onChange={(e) => setConfig({...config, height: +e.target.value})} 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-lg"
                    placeholder="Напр. 400"
                  />
                </div>
              </div>
              <button onClick={() => setStep(Step.Furniture)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg mt-4 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]">
                Продолжить
              </button>
            </div>
          </div>
        );

      case Step.Furniture:
        return (
          <div className="flex h-[calc(100vh-180px)] gap-8 overflow-hidden animate-in fade-in duration-500">
            <aside className="w-80 bg-white rounded-[2rem] p-6 border border-slate-200 overflow-y-auto shrink-0 shadow-sm flex flex-col">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">Каталог мебели</h3>
              <div className="space-y-3 flex-1">
                {FURNITURE_CATALOG.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => addFurniture(item)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50/50 transition-all border border-slate-50 hover:border-indigo-100 group text-left"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                      {item.symbol}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
            
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl flex-1 overflow-hidden relative group">
                <RoomCanvas 
                  config={config} 
                  furniture={furniture} 
                  onUpdateFurniture={setFurniture}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
              {selectedId && (
                <div className="bg-slate-900 rounded-3xl p-5 flex items-center justify-between text-white animate-in slide-in-from-bottom-6 shadow-2xl">
                  <div className="flex items-center gap-4 ml-2">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">
                        {FURNITURE_CATALOG.find(c => c.type === furniture.find(f => f.id === selectedId)?.type)?.symbol}
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Выбранный объект</p>
                        <p className="text-sm font-bold">{furniture.find(f => f.id === selectedId)?.type.toUpperCase()}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={rotateSelected} className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                       </svg>
                       Повернуть
                    </button>
                    <button onClick={deleteSelected} className="px-5 py-3 bg-red-500/20 hover:bg-red-500 text-red-100 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                       Удалить
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="w-72 flex flex-col gap-6 shrink-0">
               <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                  <h4 className="font-black text-2xl mb-4 leading-tight">Почти готово!</h4>
                  <p className="text-sm text-indigo-100 leading-relaxed mb-8 font-medium">Ваша планировка выглядит отлично. Теперь выберите стиль для генерации 3D вида.</p>
                  <button onClick={() => setStep(Step.Style)} className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl hover:scale-[1.02] active:scale-95">
                    Далее
                  </button>
               </div>
            </aside>
          </div>
        );

      case Step.Style:
        return (
          <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black mb-4 text-center text-slate-900">Выберите стиль</h2>
            <p className="text-center text-slate-500 mb-12 font-medium">Это определит освещение, материалы и общую атмосферу 3D визуализации</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {(Object.keys(STYLES_CONFIG) as RoomStyle[]).map(styleId => (
                <button
                  key={styleId}
                  onClick={() => setConfig({ ...config, style: styleId })}
                  className={`p-8 rounded-[2.5rem] border-4 text-left transition-all duration-300 relative group overflow-hidden ${config.style === styleId ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 -translate-y-2' : 'border-white bg-white/50 hover:border-slate-200'}`}
                >
                  <div className="flex gap-2 mb-6">
                    {STYLES_CONFIG[styleId].palette.map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-black/5" style={{ backgroundColor: c }}></div>
                    ))}
                  </div>
                  <h3 className="font-black text-slate-900 text-2xl mb-3">{STYLES_CONFIG[styleId].name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{STYLES_CONFIG[styleId].description}</p>
                  {config.style === styleId && (
                    <div className="absolute top-6 right-6 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button 
                onClick={handleVisualize}
                className="px-16 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-4 hover:scale-105 active:scale-95"
              >
                Создать 3D Вид
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
        );

      case Step.Visual:
        return (
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex-1 space-y-8">
               <div className="aspect-video bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden relative group">
                  {isBusy ? (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-10 flex flex-col items-center justify-center text-center p-12">
                      <div className="relative mb-10">
                         <div className="w-24 h-24 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                         <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600">AI</div>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 mb-4">Рендеринг интерьера...</h3>
                      <p className="text-slate-500 font-medium max-w-sm text-lg leading-relaxed">Искусственный интеллект анализирует вашу планировку и накладывает текстуры выбранного стиля.</p>
                    </div>
                  ) : aiImage ? (
                    <img src={aiImage} alt="AI Result" className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" />
                  ) : null}
               </div>
            </div>
            
            <div className="w-full lg:w-96 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-6">Рекомендации ИИ</h3>
                <div className="space-y-6">
                  {advice.map((tip, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="flex-shrink-0 w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm font-black shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">{i+1}</span>
                      <p className="text-sm text-slate-600 leading-relaxed font-bold pt-1">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Скачать HD
                 </button>
                 <button 
                  onClick={() => setStep(Step.Welcome)}
                  className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
                >
                  Новый проект
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd] selection:bg-indigo-100">
      <header className="px-10 py-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setStep(Step.Welcome)}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-100">AI</div>
          <h1 className="font-black text-slate-900 tracking-tighter text-2xl">DESIGNER.</h1>
        </div>
        {step !== Step.Welcome && (
          <nav className="hidden md:flex items-center gap-8">
            {[Step.RoomSetup, Step.Furniture, Step.Style, Step.Visual].map((s, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${step === s ? 'scale-110' : ''}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-300'}`}>{i+1}</span>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${step === s ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {s === Step.RoomSetup ? 'Параметры' : s === Step.Furniture ? 'План' : s === Step.Style ? 'Стиль' : 'Финал'}
                </span>
                {i < 3 && <div className={`w-6 h-[2px] ml-4 ${step === [Step.RoomSetup, Step.Furniture, Step.Style, Step.Visual][i+1] || step === s ? 'bg-indigo-100' : 'bg-slate-50'}`}></div>}
              </div>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 p-10 overflow-y-auto">
        {renderStep()}
      </main>

      <footer className="p-8 text-center text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black opacity-50">
        Powered by Google Gemini 2.5 Flash Image & 3.0 Flash · © 2024
      </footer>
    </div>
  );
};

export default App;
