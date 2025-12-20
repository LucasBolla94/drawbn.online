
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board.tsx';
import Controls from './components/Controls.tsx';
import { Color, DrawingAction, ActionType, FontFamily } from './types.ts';
import { exportToPDF } from './utils/pdfExport.ts';

const App: React.FC = () => {
  const [brushSize, setBrushSize] = useState(48);
  const [color, setColor] = useState<Color>('white');
  const [fontFamily, setFontFamily] = useState<FontFamily>('Inter');
  const [isMagic, setIsMagic] = useState(false);
  const [tool, setTool] = useState<ActionType>('draw');
  const [sessionId, setSessionId] = useState<string>('');
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  
  const SOLANA_ADDRESS = "PennodrawDonateAddressPlaceholder1111111111"; 
  
  const boardStateRef = useRef<{ view: { x: number, y: number, zoom: number } }>({ view: { x: 0, y: 0, zoom: 1 } });
  const saveTimeoutRef = useRef<number | null>(null);

  const generateNewSession = useCallback(() => {
    const newId = Math.random().toString(36).substring(2, 9);
    window.location.hash = newId;
    setSessionId(newId);
    setActions([]);
    setSaveStatus('idle');
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setSessionId(hash);
        const savedData = localStorage.getItem(`pennodraw_${hash}`);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setActions(Array.isArray(parsed) ? parsed : []);
            setSaveStatus('saved');
          } catch (e) {
            setActions([]);
          }
        } else {
          setActions([]);
          setSaveStatus('idle');
        }
      } else {
        generateNewSession();
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [generateNewSession]);

  useEffect(() => {
    if (sessionId) {
      setSaveStatus('saving');
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        localStorage.setItem(`pennodraw_${sessionId}`, JSON.stringify(actions));
        setSaveStatus('saved');
      }, 600);
    }
  }, [actions, sessionId]);

  const handleManualSave = useCallback(() => {
    if (sessionId) {
      localStorage.setItem(`pennodraw_${sessionId}`, JSON.stringify(actions));
      setSaveStatus('saved');
    }
  }, [actions, sessionId]);

  const handleNewDrawing = useCallback(() => {
    if (window.confirm('Clear all and start a new Pennodraw session?')) {
      generateNewSession();
    }
  }, [generateNewSession]);

  const handleDownload = useCallback(async () => {
    await exportToPDF({
      actions,
      width: window.innerWidth,
      height: window.innerHeight,
      view: boardStateRef.current.view
    });
  }, [actions]);

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleAction = useCallback((action: DrawingAction) => {
    setActions(prev => [...prev, action]);
  }, []);

  const handleUpdateAction = useCallback((id: string, updates: Partial<DrawingAction>) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const handleDeleteAction = useCallback((id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleUndo = useCallback(() => {
    setActions(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const getColorHex = (c: Color) => {
    const palette = {
      purple: '#A855F7',
      cyan: '#22D3EE',
      lime: '#84CC16',
      amber: '#F59E0B',
      white: '#FFFFFF'
    };
    return palette[c] || palette.white;
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden select-none touch-none z-0">
      
      {/* Branding Header - Responsive Flex */}
      <header className="absolute top-4 left-4 md:top-8 md:left-8 z-50 pointer-events-none flex flex-col gap-2 max-w-[calc(100%-100px)]">
        <div className="flex items-center gap-3">
            {/* Elegant Custom Icon */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl rotate-[-4deg] flex-shrink-0">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5,2H8.5A3.5,3.5 0 0,0 5,5.5V19.5A2.5,2.5 0 0,0 7.5,22H16.5A2.5,2.5 0 0,0 19,19.5V5.5A3.5,3.5 0 0,0 15.5,2M12,18A2,2 0 1,1 14,16A2,2 0 0,1 12,18M15,10H12V14H10V10H7V8H10V4H12V8H15V10Z" />
                </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-end gap-1 flex-wrap">
                  <h1 className="text-white font-black text-2xl md:text-4xl tracking-tighter leading-none">PENNO</h1>
                  <h1 className="text-red-600 font-black text-[2rem] md:text-[3rem] tracking-tighter leading-[0.85] drop-shadow-[0_4px_10px_rgba(220,38,38,0.3)]">DRAW</h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-zinc-800/80 border border-white/10 px-1.5 py-0.5 rounded text-[7px] md:text-[9px] text-white/60 font-black uppercase tracking-widest whitespace-nowrap">
                  v1.0 Beta
                </span>
                <div className="bg-zinc-900/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-2 shadow-xl">
                  <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-[7px] md:text-[8px] text-white/40 font-black uppercase tracking-tighter">{saveStatus === 'saving' ? 'Syncing' : 'Secure'}</span>
                </div>
              </div>
            </div>
        </div>
      </header>

      {/* Donation Heart Widget - Corner Optimized */}
      <button 
        onClick={() => setShowDonateModal(true)}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 md:p-4 bg-zinc-900/90 hover:bg-red-500/20 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[1.5rem] transition-all group shadow-2xl pointer-events-auto active:scale-95 flex items-center gap-2 md:gap-3"
      >
        <div className="relative">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500 animate-pulse-soft relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div className="absolute inset-0 bg-red-500 blur-lg opacity-20 animate-pulse" />
        </div>
        <span className="hidden sm:block text-white text-[9px] md:text-[10px] font-black tracking-widest uppercase pr-1">
          Support
        </span>
      </button>

      <main className="flex-1 relative z-10">
        <Board 
          color={getColorHex(color)}
          brushSize={brushSize}
          fontFamily={fontFamily}
          isMagic={isMagic}
          tool={tool}
          actions={actions}
          onAction={handleAction}
          onUpdateAction={handleUpdateAction}
          onDeleteAction={handleDeleteAction}
          onViewStateChange={(v) => boardStateRef.current.view = v}
        />
      </main>

      <Controls 
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        isMagic={isMagic}
        setIsMagic={setIsMagic}
        tool={tool}
        setTool={setTool}
        onNew={handleNewDrawing}
        onDownload={handleDownload}
        onUndo={handleUndo}
        onShare={handleShare}
        onSave={handleManualSave}
      />

      {/* Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="bg-zinc-900 border border-white/10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-red-500/20 shadow-inner">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <h2 className="text-white font-black text-3xl md:text-4xl mb-4 tracking-tighter text-center leading-tight">Maintain the Canvas</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 md:mb-10 text-center">
                 Pennodraw is a volunteer effort. To keep our high-performance blackboard clean and accessible for everyone, we rely on your support.
              </p>

              <div className="bg-black/60 border border-white/5 rounded-3xl p-6 md:p-8 mb-8 shadow-inner">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Solana (SOL / USDC)</span>
                    <div className="flex gap-1.5">
                       <div className="w-5 h-5 rounded-full bg-[#14F195]"/>
                       <div className="w-5 h-5 rounded-full bg-[#9945FF]"/>
                    </div>
                 </div>
                 <div className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-5 text-white font-mono text-[10px] break-all mb-4 text-center">
                    {SOLANA_ADDRESS}
                 </div>
                 <button 
                    onClick={() => {
                        navigator.clipboard.writeText(SOLANA_ADDRESS);
                        alert("Address Copied!");
                    }}
                    className="w-full bg-white text-black font-black text-[11px] py-4 rounded-xl uppercase tracking-widest transition-all active:scale-95"
                 >
                    Copy Address
                 </button>
              </div>

              <button onClick={() => setShowDonateModal(false)} className="w-full bg-zinc-800 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-zinc-700 transition-all border border-zinc-700">
                Back to drawing
              </button>
           </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-md shadow-2xl text-center">
            <h2 className="text-white font-black text-2xl mb-4 tracking-tight">Public Link</h2>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Share this URL to allow anyone to view your work in progress live.</p>
            <div className="relative mb-8">
              <input readOnly value={shareUrl} className="w-full bg-black border border-white/5 rounded-2xl px-5 py-5 text-zinc-400 text-xs font-mono focus:outline-none" />
              <button 
                onClick={() => { 
                  navigator.clipboard.writeText(shareUrl);
                  alert("Link Copied!");
                }} 
                className="absolute right-2 top-2 bottom-2 px-6 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase"
              >
                Copy
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="w-full bg-white/5 text-white font-black py-5 rounded-2xl uppercase text-[9px] tracking-widest border border-white/5">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
