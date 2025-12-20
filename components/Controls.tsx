
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
}

const Controls: React.FC<ControlsProps> = ({
  color, setColor, brushSize, setBrushSize, fontFamily, setFontFamily, isMagic, setIsMagic, tool, setTool, onNew, onDownload, onUndo, onShare, onSave
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
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-[95%] max-w-5xl z-[100] animate-in fade-in slide-in-from-bottom-6 duration-700 pointer-events-none">
      
      {/* Contextual Font Bar - Improved Scrolling and Sizing */}
      {tool === 'text' && (
        <div className="flex gap-2 bg-zinc-900/95 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full pointer-events-auto">
          {fonts.map(f => (
            <button 
              key={f}
              onClick={() => setFontFamily(f)}
              className={`px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest whitespace-nowrap transition-all uppercase flex items-center gap-2 ${fontFamily === f ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Primary Floating Dock - Responsive Grid/Flex */}
      <div className="w-full bg-zinc-900/85 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-2 md:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col gap-3 md:flex-row items-center pointer-events-auto">
        
        {/* Row 1 for Mobile: Tools & Colors */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
          {/* Toolbox */}
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 gap-0.5 md:gap-1">
            <button 
              onClick={() => { setTool('draw'); setIsMagic(false); }}
              className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all ${tool === 'draw' && !isMagic ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
              title="Free Draw"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button 
              onClick={() => { setTool('draw'); setIsMagic(true); }}
              className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all relative ${isMagic ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] scale-105' : 'text-zinc-500 hover:text-white'}`}
              title="Magic Pen"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </button>
            <button 
              onClick={() => setTool('text')}
              className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all ${tool === 'text' ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
              title="Text Tool"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
          </div>

          {/* Color Palette (Compact for Mobile) */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-black/20 p-1 rounded-2xl md:bg-transparent md:p-0">
            {colors.map((c) => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 md:w-9 md:h-9 rounded-full transition-all border-2 ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                style={{ backgroundColor: getColorHex(c) }}
              />
            ))}
          </div>
        </div>

        {/* Attribute Slider - Better Spacing */}
        <div className="flex-1 w-full px-2 md:px-4 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-1 px-1">
            <span className="text-[8px] md:text-[9px] font-black text-white/30 tracking-widest uppercase">
              {tool === 'text' ? 'Letter Scale' : 'Stroke Weight'}
            </span>
            <span className="text-[8px] md:text-[9px] font-black text-white/60 tabular-nums">{brushSize}px</span>
          </div>
          <input 
            type="range" min="8" max="200" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-1 md:h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-white"
            style={{ accentColor: currentHex }}
          />
        </div>

        {/* Global Actions - Wrapped for Mobile */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex gap-0.5 bg-black/30 p-1 rounded-2xl border border-white/5">
            <button onClick={onUndo} className="p-2 md:p-3 text-zinc-500 hover:text-white transition-all" title="Undo">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </button>
            <button onClick={onShare} className="p-2 md:p-3 text-zinc-500 hover:text-white transition-all" title="Share">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
            <button onClick={onNew} className="p-2 md:p-3 text-zinc-500 hover:text-red-500 transition-all" title="Clear">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

          <button 
            onClick={onDownload} 
            className="flex items-center gap-2 bg-white text-black px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-[2.5rem] font-black text-[9px] md:text-[11px] tracking-widest uppercase hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
