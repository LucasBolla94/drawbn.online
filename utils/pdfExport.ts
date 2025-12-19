
import { jsPDF } from 'jspdf';
import { DrawingAction, Point } from '../types';

interface ExportParams {
  actions: DrawingAction[];
  width: number;
  height: number;
  view: { x: number; y: number; zoom: number };
}

export async function exportToPDF({ actions, width, height, view }: ExportParams) {
  // Create a high-quality offscreen canvas for rendering
  // We use a clean canvas here so the grid from the UI is never included
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  // 1. Draw Production Background (Solid Black)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Helper to convert world coordinates to screen coordinates for the PDF export
  const toScreen = (worldPoint: Point) => ({
    x: worldPoint.x * view.zoom + view.x,
    y: worldPoint.y * view.zoom + view.y
  });

  // 2. Draw all user actions precisely as they appear on screen
  actions.forEach(action => {
    const { type, points, color, brushSize, shape, text } = action;
    if (points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize * view.zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 'text' && text) {
      const p = toScreen(points[0]);
      ctx.font = `bold ${brushSize * 4 * view.zoom}px Inter, sans-serif`;
      ctx.fillText(text, p.x, p.y);
      return;
    }

    if (shape) {
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
          const lEnd = toScreen(points[points.length - 1]);
          ctx.moveTo(lStart.x, lStart.y);
          ctx.lineTo(lEnd.x, lEnd.y);
          break;
        case 'square':
          ctx.rect(start.x, start.y, w, h);
          break;
        case 'circle':
          ctx.arc(start.x + w / 2, start.y + h / 2, Math.max(w, h) / 2, 0, Math.PI * 2);
          break;
        case 'triangle':
          ctx.moveTo(start.x + w / 2, start.y);
          const trB1 = toScreen({ x: maxX, y: maxY });
          const trB2 = toScreen({ x: minX, y: maxY });
          ctx.lineTo(trB1.x, trB1.y);
          ctx.lineTo(trB2.x, trB2.y);
          ctx.closePath();
          break;
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      const first = toScreen(points[0]);
      ctx.moveTo(first.x, first.y);
      points.forEach(p => {
        const screenP = toScreen(p);
        ctx.lineTo(screenP.x, screenP.y);
      });
      ctx.stroke();
    }
  });

  // 3. Add Professional Watermark (Lower-Right Corner)
  const watermark = "DRAWBN.ONLINE";
  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  const textMetrics = ctx.measureText(watermark);
  ctx.fillText(watermark, width - textMetrics.width - 40, height - 40);

  // 4. Final PDF Generation
  const imgData = offscreen.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: width > height ? 'l' : 'p',
    unit: 'px',
    format: [width, height],
    hotfixes: ['px_scaling']
  });

  pdf.addImage(imgData, 'PNG', 0, 0, width, height);
  pdf.save(`drawbn-export-${Date.now()}.pdf`);
}
