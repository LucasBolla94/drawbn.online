
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board.tsx';
import Controls from './components/Controls.tsx';
import { Color, DrawingAction, ActionType, FontFamily } from './types.ts';
import { exportToPDF } from './utils/pdfExport.ts';

const DOC_PREFIX = 'pennodraw_doc_';

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
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [localProjectCount, setLocalProjectCount] = useState(0);
  
  const SOLANA_ADDRESS = "PennodrawDonateAddressPlaceholder1111111111"; 
  
  const boardStateRef = useRef<{ view: { x: number, y: number, zoom: number } }>({ view: { x: 0, y: 0, zoom: 1 } });
  const saveTimeoutRef = useRef<number | null>(null);

  const updateLocalProjectCount = useCallback(() => {
    const count = Object.keys(localStorage).filter(key => key.startsWith(DOC_PREFIX)).length;
    setLocalProjectCount(count);
  }, []);

  const generateNewSession = useCallback(() => {
    const newId = Math.random().toString(36).substring(2, 9);
    window.location.hash = newId;
    setSessionId(newId);
    setActions([]);
    setSaveStatus('idle');
    setShowNewProjectModal(false);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setSessionId(hash);
        const savedData = localStorage.getItem(`${DOC_PREFIX}${hash}`);
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
      updateLocalProjectCount();
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [generateNewSession, updateLocalProjectCount]);

  useEffect(() => {
    if (sessionId) {
      if (actions.length > 0) {
        setSaveStatus('saving');
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(() => {
          localStorage.setItem(`${DOC_PREFIX}${sessionId}`, JSON.stringify(actions));
          setSaveStatus('saved');
          updateLocalProjectCount();
        }, 600);
      } else {
        // If actions are empty, we might want to keep the record or remove it if it was just cleared
        // For now, if it was manually cleared, we keep the session but empty the data
        localStorage.setItem(`${DOC_PREFIX}${sessionId}`, JSON.stringify([]));
        setSaveStatus('saved');
        updateLocalProjectCount();
      }
    }
  }, [actions, sessionId, updateLocalProjectCount]);

  const handleManualSave = useCallback(() => {
    if (sessionId) {
      localStorage.setItem(`${DOC_PREFIX}${sessionId}`, JSON.stringify(actions));
      setSaveStatus('saved');
      updateLocalProjectCount();
    }
  }, [actions, sessionId, updateLocalProjectCount]);

  const handleClearCanvas = useCallback(() => {
    if (actions.length === 0) return;
    if (window.confirm('Wipe current board? (This keeps you in the same project URL)')) {
      setActions([]);
    }
  }, [actions]);

  const handleOpenNewProject = useCallback(() => {
    if (actions.length > 0) {
      setShowNewProjectModal(true);
    } else {
      generateNewSession();
    }
  }, [actions, generateNewSession]);

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
      
      {/* Branding Header */}
      <header className="absolute top-4 left-4 md:top-6 md:left-6 z-50 pointer-events-none flex flex-col gap-0.5">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.7,13.35L20.7,14.35L18.65,12.3L19.65,11.3C20.1,10.85 20.85,10.85 21.3,11.3L22.7,12.7C23.15,13.15 23.15,13.9 22.7,14.35M12,20.6L12.06,19.3L20.06,11.3L22.11,13.35L14.11,21.35L12.8,21.41L12,20.6M12,18H10V16H12V18M12,14H10V12H12V14M12,10H10V8H12V10M16,14H14V12H16V14M16,10H14V8H16V10M20,10H18V8H20V10M20,14H18V12H20V14M10,21V19H2V5A2,2 0 0,1 4,3H20A2,2 0 0,1 22,5V9H20V5H4V19H10V21Z" />
                </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                  <h1 className="text-white font-black text-xl md:text-3xl tracking-tighter leading-none uppercase italic">PENNO</h1>
                  <h1 className="text-red-600 font-black text-[1.8rem] md:text-[2.8rem] tracking-tighter leading-[0.7] drop-shadow-[0_4px_10px_rgba(220,38,38,0.4)] uppercase italic">DRAW</h1>
                  <span className="ml-1 md:ml-2 bg-zinc-800/80 border border-white/5 px-1.5 py-0.5 rounded text-[7px] md:text-[9px] text-white/50 font-black uppercase tracking-widest">v1.0 Beta</span>
              </div>
            </div>
        </div>
      </header>

      {/* Counter & Support Section */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col items-end gap-2">
        <button 
          onClick={() => setShowDonateModal(true)}
          className="p-3 md:p-4 bg-zinc-900/90 hover:bg-red-500/10 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[1.4rem] transition-all group shadow-2xl pointer-events-auto active:scale-95 flex items-center gap-2"
        >
          <div className="relative">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500 animate-pulse-soft relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="hidden sm:block text-white text-[8px] md:text-[9px] font-black tracking-widest uppercase pr-1">Support</span>
        </button>

        {/* Real Functional Counter */}
        <div className="flex flex-col items-end pointer-events-none">
          <div className="bg-zinc-900/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2 shadow-lg">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[7px] md:text-[8px] text-white/40 font-black tracking-widest uppercase">
              <span className="text-white/80">{localProjectCount.toLocaleString()}</span> SAVED LOCALLY
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 relative z-10 w-full h-full">
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
        onNew={handleOpenNewProject}
        onDownload={handleDownload}
        onUndo={handleUndo}
        onShare={handleShare}
        onSave={handleManualSave}
        onClearCurrent={handleClearCanvas}
      />

      {/* New Project Confirmation Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
               <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h2 className="text-white font-black text-2xl mb-4 tracking-tight uppercase italic">New Project?</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Your current work will be lost unless you save the link. Anyone with the current link can see this project.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Link Copied!"); }}
                className="w-full bg-white/5 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/10"
              >
                Copy Link Before Leaving
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 bg-zinc-800 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest border border-zinc-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={generateNewSession}
                  className="flex-1 bg-red-600 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest shadow-lg"
                >
                  Start New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDonateModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="bg-zinc-900 border border-white/10 p-6 md:p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <h2 className="text-white font-black text-3xl mb-4 tracking-tighter text-center italic uppercase">Support Pennodraw</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 text-center px-4">
                 Pennodraw is community funded. Your support helps keep this high-performance canvas free for all.
              </p>
              <div className="bg-black/60 border border-white/5 rounded-2xl p-6 mb-8 text-center">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-4">Solana (SOL/USDC)</span>
                 <div className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-5 text-white font-mono text-[9px] break-all mb-4">
                    {SOLANA_ADDRESS}
                 </div>
                 <button 
                    onClick={() => { navigator.clipboard.writeText(SOLANA_ADDRESS); alert("Copied!"); }}
                    className="w-full bg-white text-black font-black text-[11px] py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-transform"
                 >
                    Copy Address
                 </button>
              </div>
              <button onClick={() => setShowDonateModal(false)} className="w-full bg-zinc-800 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest border border-zinc-700 active:scale-95 transition-transform">
                Close
              </button>
           </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl text-center">
            <h2 className="text-white font-black text-2xl mb-4 tracking-tight italic uppercase">Public Link</h2>
            <div className="relative mb-8">
              <input readOnly value={shareUrl} className="w-full bg-black border border-white/5 rounded-2xl px-5 py-5 text-zinc-400 text-xs font-mono focus:outline-none" />
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Copied!"); }} className="absolute right-2 top-2 bottom-2 px-6 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-transform">Copy</button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="w-full bg-white/5 text-white font-black py-5 rounded-2xl uppercase text-[9px] tracking-widest border border-white/5 hover:bg-white/10 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
