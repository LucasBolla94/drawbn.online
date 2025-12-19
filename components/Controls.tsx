
import React, { useState } from 'react';
import { Color, ActionType, FontFamily } from '../types';

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
  const [showFonts, setShowFonts] = useState(false);
  const colors: Color[] = ['white', 'purple', 'cyan', 'lime', 'amber'];
  const fonts: FontFamily[] = ['Inter', 'Playfair Display', 'Fira Code', 'Caveat'];
  
  const getColorHex = (c: Color) => {
    switch(c) {
      case 'white': return 'bg-white';
      case 'purple': return 'bg-purple-500';
      case 'cyan': return 'bg-cyan-400';
      case 'lime': return 'bg-lime-400';
      case 'amber': return 'bg-amber-500';
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full px-4 max-w-xl z-20">
      
      {/* Tool & Session Management */}
      <div className="flex gap-2 w-full">
        <div className="flex bg-zinc-900/90 backdrop-blur-md rounded-xl p-1 border border-zinc-800 flex-1 shadow-xl">
            <button 
                onClick={() => setTool('draw')}
                className={`flex-1 py-2 text-[10px] font-black tracking-tighter rounded-lg transition-all ${tool === 'draw' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                DRAW
            </button>
            <button 
                onClick={() => setTool('text')}
                className={`flex-1 py-2 text-[10px] font-black tracking-tighter rounded-lg transition-all ${tool === 'text' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                TEXT
            </button>
        </div>
        
        {tool === 'text' && (
            <div className="relative">
                <button 
                    onClick={() => setShowFonts(!showFonts)}
                    className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-500 min-w-[100px]"
                >
                    {fontFamily.toUpperCase()}
                </button>
                {showFonts && (
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl flex flex-col gap-1 max-h-48 overflow-y-auto custom-scroll">
                        {fonts.map(f => (
                            <button 
                                key={f}
                                onClick={() => { setFontFamily(f); setShowFonts(false); }}
                                className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-800 transition-colors ${fontFamily === f ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-400'}`}
                                style={{ fontFamily: f }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}

        {tool === 'draw' && (
            <button 
                onClick={() => setIsMagic(!isMagic)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border ${isMagic ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-zinc-900/90 border-zinc-800 text-zinc-600'}`}
            >
                MAGIC
            </button>
        )}
      </div>

      {/* Palette & Brush/Font Size */}
      <div className="flex items-center gap-4 bg-zinc-900/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-zinc-800 shadow-2xl w-full">
        <div className="flex items-center gap-2 flex-shrink-0">
            {colors.map((c) => (
                <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} ${getColorHex(c)}`}
                />
            ))}
        </div>
        <div className="flex-1 px-2 flex items-center gap-3 relative">
            <span className="absolute -top-6 left-0 text-[8px] font-black text-zinc-600 tracking-widest uppercase">
                {tool === 'text' ? 'Font Size' : 'Brush Size'}: {brushSize}px
            </span>
            <input 
                type="range" min="8" max="150" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full">
        <button onClick={onUndo} className="flex-1 bg-zinc-900/90 backdrop-blur-md text-white py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">
            Undo
        </button>
        <button onClick={onShare} className="flex-1 bg-zinc-900/90 backdrop-blur-md text-white py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">
            Share
        </button>
        <button onClick={onNew} className="flex-1 bg-zinc-900/90 backdrop-blur-md text-white py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">
            New
        </button>
        <button onClick={onDownload} className="flex-[2] bg-white text-black py-3 rounded-xl hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest shadow-xl transition-transform active:scale-95">
            Download PDF
        </button>
      </div>
    </div>
  );
};

export default Controls;
