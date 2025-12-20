
import React from 'react';
import { Color, ActionType, FontFamily } from '../types.ts';

interface ControlsProps {
  color: Color;
  setColor: (c: Color) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  isMagic: boolean;
  setIsMagic: (m: boolean) => void;
  tool: ActionType;
  setTool: (t: ActionType) => void;
  onNew: () => void;
  onDownload: () => void;
  onUndo: () => void;
  onShare: () => void;
  onSave: () => void;
  onClearCurrent: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  color, setColor, brushSize, setBrushSize, fontFamily, setFontFamily, isMagic, setIsMagic, tool, setTool, onNew, onDownload, onUndo, onShare, onSave, onClearCurrent
}) => {
  const colors: Color[] = ['white', 'purple', 'cyan', 'lime', 'amber'];
  const fonts: FontFamily[] = ['Inter', 'Playfair Display', 'Fira Code', 'Caveat'];
  
  const getColorHex = (c: Color) => {
    switch(c) {
      case 'white': return '#ffffff';
      case 'purple': return '#A855F7';
      case 'cyan': return '#22D3EE';
      case 'lime': return '#84CC16';
      case 'amber': return '#F59E0B';
      default: return '#ffffff';
    }
  };

  const currentHex = getColorHex(color);

  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-[95%] max-w-4xl z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700 pointer-events-none">
      
      {/* Contextual Font Bar */}
      {tool === 'text' && (
        <div className="flex gap-1.5 bg-zinc-900/95 backdrop-blur-2xl p-1 rounded-xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full pointer-events-auto">
          {fonts.map(f => (
            <button 
              key={f}
              onClick={() => setFontFamily(f)}
              className={`px-3 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black tracking-widest whitespace-nowrap transition-all uppercase ${fontFamily === f ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* High-Compression Dock */}
      <div className="w-full bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-1.5 md:p-2 shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col gap-2 md:flex-row items-center pointer-events-auto">
        
        {/* Row 1: Tools & Palette */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 gap-0.5">
            <button 
              onClick={() => { setTool('draw'); setIsMagic(false); }}
              className={`p-2.5 md:p-3.5 rounded-xl transition-all ${tool === 'draw' && !isMagic ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
              title="Draw"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button 
              onClick={() => { setTool('draw'); setIsMagic(true); }}
              className={`p-2.5 md:p-3.5 rounded-xl transition-all relative ${isMagic ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] scale-105' : 'text-zinc-500 hover:text-white'}`}
              title="Magic Shapes"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </button>
            <button 
              onClick={() => setTool('text')}
              className={`p-2.5 md:p-3.5 rounded-xl transition-all ${tool === 'text' ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
              title="Text"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <button 
              onClick={() => { setTool('erase'); setIsMagic(false); }}
              className={`p-2.5 md:p-3.5 rounded-xl transition-all ${tool === 'erase' ? 'bg-zinc-200 text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
              title="Eraser"
            >
               <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-1.5">
            {colors.map((c) => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full transition-all border-2 ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                style={{ backgroundColor: getColorHex(c) }}
              />
            ))}
          </div>
        </div>

        {/* Attribute Slider */}
        <div className="flex-1 w-full px-4 flex flex-col justify-center gap-0.5">
          <div className="flex justify-between items-end px-1">
            <span className="text-[7px] font-black text-white/20 tracking-[0.2em] uppercase">{tool === 'erase' ? 'Eraser Size' : 'Stroke'}</span>
            <span className="text-[7px] font-black text-white/40 tabular-nums">{brushSize}px</span>
          </div>
          <input 
            type="range" min="8" max="200" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-white"
            style={{ accentColor: currentHex }}
          />
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex gap-0.5 bg-black/30 p-1 rounded-xl border border-white/5">
            <button onClick={onUndo} className="p-2 md:p-3 text-zinc-500 hover:text-white transition-all" title="Undo"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
            <button onClick={onClearCurrent} className="p-2 md:p-3 text-zinc-500 hover:text-red-500 transition-all" title="Clear Canvas"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            <button onClick={onNew} className="p-2 md:p-3 text-zinc-500 hover:text-emerald-500 transition-all" title="New Project"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></button>
          </div>

          <button 
            onClick={onDownload} 
            className="flex items-center gap-2 bg-white text-black px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest uppercase hover:bg-zinc-200 shadow-xl active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>EXPORT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
