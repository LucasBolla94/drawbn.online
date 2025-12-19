
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import Controls from './components/Controls';
import { Color, DrawingAction, ActionType, FontFamily } from './types';
import { exportToPDF } from './utils/pdfExport';

const App: React.FC = () => {
  const [brushSize, setBrushSize] = useState(32);
  const [color, setColor] = useState<Color>('white');
  const [fontFamily, setFontFamily] = useState<FontFamily>('Inter');
  const [isMagic, setIsMagic] = useState(false);
  const [tool, setTool] = useState<ActionType>('draw');
  const [sessionId, setSessionId] = useState<string>('');
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [showShareModal, setShowShareModal] = useState(false);
  
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
        const savedData = localStorage.getItem(`drawbn_${hash}`);
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
        localStorage.setItem(`drawbn_${sessionId}`, JSON.stringify(actions));
        setSaveStatus('saved');
      }, 600);
    }
  }, [actions, sessionId]);

  const handleManualSave = useCallback(() => {
    if (sessionId) {
      localStorage.setItem(`drawbn_${sessionId}`, JSON.stringify(actions));
      setSaveStatus('saved');
    }
  }, [actions, sessionId]);

  const handleNewDrawing = useCallback(() => {
    if (window.confirm('Clear everything and start a new blackboard session?')) {
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
    <div className="fixed inset-0 bg-[#000000] flex flex-col overflow-hidden select-none touch-none">
      {/* Session Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5">
        <h1 className="text-white font-bold text-2xl tracking-tighter">
          DRAWBN<span className="text-purple-500 font-normal">.BOLLA</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900/90 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2.5 shadow-2xl">
            <span className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">{sessionId}</span>
            <div className="w-[1px] h-3 bg-zinc-700" />
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 
                saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-zinc-600'
              }`} />
              <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-tight">
                {saveStatus === 'saving' ? 'Saving' : 'Safe'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 relative">
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

      {/* Share Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            </div>
            <h2 className="text-white font-black text-2xl mb-2 tracking-tight">Share Session</h2>
            <p className="text-zinc-400 text-sm mb-8 px-4">Link for <b>draw.bolla.network</b>. Anyone with this link can view your current session.</p>
            <div className="relative mb-8">
              <input readOnly value={shareUrl} className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-300 text-sm font-mono focus:outline-none transition-colors" />
              <button 
                onClick={() => { 
                  navigator.clipboard.writeText(shareUrl); 
                  const btn = document.getElementById('copy-share-btn');
                  if (btn) btn.innerText = "COPIED!";
                  setTimeout(() => { if (btn) btn.innerText = "COPY"; }, 2000);
                }} 
                id="copy-share-btn"
                className="absolute right-2 top-2 bottom-2 px-6 bg-white text-black rounded-xl text-[10px] font-black uppercase transition-transform active:scale-95 shadow-lg"
              >
                Copy
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="w-full bg-zinc-800 text-white font-bold py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-colors border border-zinc-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
