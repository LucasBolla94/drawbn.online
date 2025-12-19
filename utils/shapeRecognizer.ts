
import { Point } from '../types';

/**
 * Calculates the perpendicular distance from a point to a line segment.
 */
function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return Math.sqrt(Math.pow(p.x - a.x, 2) + Math.pow(p.y - a.y, 2));
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / mag;
}

/**
 * Ramer-Douglas-Peucker algorithm to simplify a path of points.
 */
function rdp(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const last = points.length - 1;

  for (let i = 1; i < last; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[last]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon);
    const right = rdp(points.slice(index), epsilon);
    return [...left.slice(0, left.length - 1), ...right];
  } else {
    return [points[0], points[last]];
  }
}

export function recognizeShape(points: Point[]): 'line' | 'square' | 'circle' | 'triangle' | null {
  if (points.length < 5) return null;

  // 1. Path simplification using RDP
  // Epsilon is proportional to the size of the drawing to handle different scales
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  points.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });
  const width = maxX - minX;
  const height = maxY - minY;
  const size = Math.max(width, height);
  const epsilon = size * 0.05; // 5% of the largest dimension as tolerance

  const simplified = rdp(points, epsilon);
  const vertexCount = simplified.length;

  const start = points[0];
  const end = points[points.length - 1];
  const distStartEnd = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const isClosed = distStartEnd < size * 0.3; // Roughly closed if ends are near

  // 2. Geometric heuristic classification
  
  // LINE: Only 2 points after simplification or ends are far apart
  if (vertexCount <= 2 || !isClosed) {
    return 'line';
  }

  // TRIANGLE: Simplified to 3 main vertices (plus 1 closing point)
  if (vertexCount === 4 && isClosed) {
    return 'triangle';
  }

  // SQUARE/RECTANGLE: Simplified to 4 main vertices (plus 1 closing point)
  if (vertexCount === 5 && isClosed) {
    return 'square';
  }

  // CIRCLE Check: 
  // If we have many vertices after simplification, or if RDP didn't squash it,
  // check for radial consistency.
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const radius = (width + height) / 4;
  let radiusVariance = 0;
  
  points.forEach(p => {
    const d = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
    radiusVariance += Math.abs(d - radius);
  });
  radiusVariance /= points.length;

  // If the variance of distance to center is low, it's a circle
  if (radiusVariance / radius < 0.15) {
    return 'circle';
  }

  // Fallback heuristics for shapes that might have extra jittery vertices
  if (vertexCount > 5 && isClosed) {
      // Could be a messy square or triangle
      const aspectRatio = width / height;
      if (aspectRatio > 0.7 && aspectRatio < 1.3) return 'square';
      return 'triangle';
  }

  return 'line';
}
