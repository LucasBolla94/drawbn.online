
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, DrawingAction, ActionType, FontFamily } from '../types.ts';
import { recognizeShape } from '../utils/shapeRecognizer.ts';

interface BoardProps {
  color: string;
  brushSize: number;
  fontFamily: FontFamily;
  isMagic: boolean;
  tool: ActionType;
  actions: DrawingAction[];
  onAction: (action: DrawingAction) => void;
  onUpdateAction: (id: string, updates: Partial<DrawingAction>) => void;
  onDeleteAction: (id: string) => void;
  onViewStateChange: (view: { x: number, y: number, zoom: number }) => void;
}

const Board: React.FC<BoardProps> = ({ color, brushSize, fontFamily, isMagic, tool, actions, onAction, onUpdateAction, onDeleteAction, onViewStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState<Point | null>(null);
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(1);
  
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [activeTextPos, setActiveTextPos] = useState<Point | null>(null);
  const [activeTextValue, setActiveTextValue] = useState("");
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    onViewStateChange(view);
  }, [view, onViewStateChange]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Handle pixel density for crisp drawing
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        renderAll();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [actions, view]);

  const toWorld = useCallback((screenPoint: Point) => ({
    x: (screenPoint.x - view.x) / view.zoom,
    y: (screenPoint.y - view.y) / view.zoom
  }), [view]);

  const toScreen = useCallback((worldPoint: Point) => ({
    x: worldPoint.x * view.zoom + view.x,
    y: worldPoint.y * view.zoom + view.y
  }), [view]);

  const drawAction = (ctx: CanvasRenderingContext2D, action: DrawingAction) => {
    const { type, points, color, brushSize, shape, text, fontFamily: fFamily, id } = action;
    if (points.length === 0 || id === activeTextId) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize * view.zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 'text' && text) {
      const p = toScreen(points[0]);
      const scaledFontSize = brushSize * view.zoom;
      ctx.font = `bold ${scaledFontSize}px ${fFamily || 'Inter'}`;
      ctx.textBaseline = 'top';
      ctx.fillText(text, p.x, p.y);
      return;
    }

    if (shape) {
        drawGeometricShape(ctx, action);
        return;
    }

    ctx.beginPath();
    const first = toScreen(points[0]);
    ctx.moveTo(first.x, first.y);
    points.forEach(p => {
        const screenP = toScreen(p);
        ctx.lineTo(screenP.x, screenP.y);
    });
    ctx.stroke();
  };

  const drawGeometricShape = (ctx: CanvasRenderingContext2D, action: DrawingAction) => {
    const { points, color, brushSize, shape } = action;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize * view.zoom;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    });

    const w = (maxX - minX) * view.zoom;
    const h = (maxY - minY) * view.zoom;
    const start = toScreen({ x: minX, y: minY });

    ctx.beginPath();
    switch (shape) {
        case 'line':
            const lStart = toScreen(points[0]);
            const lEnd = toScreen(points[points.length-1]);
            ctx.moveTo(lStart.x, lStart.y);
            ctx.lineTo(lEnd.x, lEnd.y);
            break;
        case 'square': ctx.rect(start.x, start.y, w, h); break;
        case 'circle': ctx.arc(start.x + w/2, start.y + h/2, Math.max(w,h)/2, 0, Math.PI * 2); break;
        case 'triangle':
            ctx.moveTo(start.x + w/2, start.y);
            const trB1 = toScreen({ x: maxX, y: maxY });
            const trB2 = toScreen({ x: minX, y: maxY });
            ctx.lineTo(trB1.x, trB1.y);
            ctx.lineTo(trB2.x, trB2.y);
            ctx.closePath();
            break;
    }
    ctx.stroke();
  };

  const renderAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#0e0e0e';
    ctx.lineWidth = 1;
    const gridSize = 120 * view.zoom;
    const startX = view.x % gridSize;
    const startY = view.y % gridSize;
    ctx.beginPath();
    for (let x = startX; x < window.innerWidth; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, window.innerHeight); }
    for (let y = startY; y < window.innerHeight; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(window.innerWidth, y); }
    ctx.stroke();

    actions.forEach(action => drawAction(ctx, action));
    
    if (currentPoints.length > 0 && tool === 'draw') {
        drawAction(ctx, { id: 'temp', type: 'draw', points: currentPoints, color, brushSize, isMagic });
    }
  }, [actions, currentPoints, color, brushSize, tool, isMagic, view, activeTextId]);

  useEffect(() => { renderAll(); }, [renderAll]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent | Touch): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'clientX' in e ? (e as any).clientX : (e as any).touches[0].clientX;
    const clientY = 'clientY' in e ? (e as any).clientY : (e as any).touches[0].clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = 'touches' in e;
    const screenPt = getPoint(isTouch ? (e as React.TouchEvent).touches[0] : e);
    const worldPt = toWorld(screenPt);

    if (activeTextId && !inputRef.current?.contains(e.target as Node)) {
        completeTextInput();
        return;
    }

    if (!isTouch && ((e as React.MouseEvent).button === 2 || (e as React.MouseEvent).button === 1)) {
        setIsPanning(true);
        setLastPos({ x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY });
        return;
    }
    if (isTouch && (e as React.TouchEvent).touches.length === 2) {
      setIsDrawing(false);
      setIsPanning(true);
      const t = (e as React.TouchEvent).touches;
      setInitialPinchDist(Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY));
      setInitialZoom(view.zoom);
      setLastPos({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
      return;
    }

    if (tool === 'text') {
      const clickedText = [...actions].reverse().find(a => {
          if (a.type !== 'text' || !a.text) return false;
          const p = toScreen(a.points[0]);
          const fontSize = a.brushSize * view.zoom;
          const ctx = canvasRef.current?.getContext('2d');
          if (!ctx) return false;
          ctx.font = `bold ${fontSize}px ${a.fontFamily || 'Inter'}`;
          const metrics = ctx.measureText(a.text);
          return screenPt.x >= p.x && screenPt.x <= p.x + metrics.width &&
                 screenPt.y >= p.y && screenPt.y <= p.y + fontSize;
      });

      if (clickedText) {
          setActiveTextId(clickedText.id);
          setActiveTextPos(clickedText.points[0]);
          setActiveTextValue(clickedText.text || "");
          setIsDraggingText(true);
          setDragOffset({ x: worldPt.x - clickedText.points[0].x, y: worldPt.y - clickedText.points[0].y });
          setTimeout(() => inputRef.current?.focus(), 50);
      } else {
          const newId = Math.random().toString(36).substring(2, 9);
          setActiveTextId(newId);
          setActiveTextPos(worldPt);
          setActiveTextValue("");
          setIsDraggingText(false);
          setTimeout(() => inputRef.current?.focus(), 50);
      }
      return;
    }

    setIsDrawing(true);
    setCurrentPoints([worldPt]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = 'touches' in e;
    const screenPt = getPoint(isTouch ? (e as React.TouchEvent).touches[0] : e);
    const worldPt = toWorld(screenPt);
    
    if (isPanning && lastPos) {
        let currentPos;
        if (isTouch && (e as React.TouchEvent).touches.length === 2) {
            const t = (e as React.TouchEvent).touches;
            currentPos = { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
            const dist = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
            if (initialPinchDist) setView(v => ({ ...v, zoom: Math.min(Math.max(initialZoom * (dist / initialPinchDist), 0.1), 10) }));
        } else {
            const t = isTouch ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);
            currentPos = { x: t.clientX, y: t.clientY };
        }
        setView(v => ({ ...v, x: v.x + (currentPos.x - lastPos.x), y: v.y + (currentPos.y - lastPos.y) }));
        setLastPos(currentPos);
        return;
    }

    if (isDraggingText && activeTextId) {
        const newPos = { x: worldPt.x - dragOffset.x, y: worldPt.y - dragOffset.y };
        setActiveTextPos(newPos);
        onUpdateAction(activeTextId, { points: [newPos] });
        return;
    }

    if (!isDrawing || tool !== 'draw') return;
    setCurrentPoints(prev => [...prev, worldPt]);
  };

  const handleEnd = () => {
    setIsPanning(false);
    setLastPos(null);
    setIsDraggingText(false);
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 1) {
        onAction({ 
          id: Math.random().toString(36).substring(2, 9),
          type: 'draw', 
          points: currentPoints, 
          color, 
          brushSize, 
          isMagic, 
          shape: isMagic ? recognizeShape(currentPoints) || undefined : undefined 
        });
    }
    setCurrentPoints([]);
  };

  const completeTextInput = () => {
    if (activeTextId && activeTextValue.trim()) {
        const existing = actions.find(a => a.id === activeTextId);
        if (existing) {
            onUpdateAction(activeTextId, { text: activeTextValue, color, brushSize, fontFamily });
        } else {
            onAction({
                id: activeTextId,
                type: 'text',
                points: [activeTextPos!],
                text: activeTextValue,
                color,
                brushSize,
                fontFamily,
                isMagic: false
            });
        }
    } else if (activeTextId) {
        onDeleteAction(activeTextId);
    }
    setActiveTextId(null);
    setActiveTextPos(null);
    setActiveTextValue("");
  };

  const textScreenPos = activeTextPos ? toScreen(activeTextPos) : null;

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onWheel={(e) => {
            const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.min(Math.max(view.zoom * zoomDelta, 0.1), 10);
            const rect = canvasRef.current!.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldX = (mouseX - view.x) / view.zoom;
            const worldY = (mouseY - view.y) / view.zoom;
            setView({ zoom: newZoom, x: mouseX - worldX * newZoom, y: mouseY - worldY * newZoom });
        }}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="cursor-crosshair w-full h-full block"
      />

      {textScreenPos && (
        <div 
          className={`absolute z-[60] transition-opacity flex flex-col items-start ${isDraggingText ? 'opacity-40' : 'opacity-100'}`}
          style={{ 
            left: textScreenPos.x, 
            top: textScreenPos.y,
            transform: `scale(${view.zoom})`,
            transformOrigin: '0 0'
          }}
        >
          <div className="absolute -top-6 left-0 flex items-center gap-2 whitespace-nowrap bg-black/60 backdrop-blur-md text-[9px] text-white/60 px-2 py-0.5 rounded-t border border-white/10 uppercase font-black tracking-widest pointer-events-none">
             <span>{isDraggingText ? 'Moving...' : 'Typing...'}</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={activeTextValue}
            onChange={(e) => setActiveTextValue(e.target.value)}
            onBlur={completeTextInput}
            onKeyDown={(e) => e.key === 'Enter' && completeTextInput()}
            className="bg-transparent border-none outline-none font-bold p-0 m-0 pointer-events-auto"
            style={{ 
              color: color, 
              fontSize: `${brushSize}px`,
              fontFamily: fontFamily,
              caretColor: color,
              minWidth: '20px',
              width: `${Math.max(1, activeTextValue.length + 1) * 0.7}em`
            }}
            placeholder="Type..."
          />
        </div>
      )}
    </div>
  );
};

export default Board;
