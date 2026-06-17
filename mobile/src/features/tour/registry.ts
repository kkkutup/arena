// A tiny registry so any on-screen element can expose its measured position
// to the coach-mark overlay without prop-drilling. Components register a
// measure function keyed by a stable id; the tour store asks for it by id.

export type TargetRect = { x: number; y: number; width: number; height: number };

const measurers = new Map<string, () => Promise<TargetRect | null>>();

export function registerTarget(id: string, fn: () => Promise<TargetRect | null>): () => void {
  measurers.set(id, fn);
  return () => {
    if (measurers.get(id) === fn) measurers.delete(id);
  };
}

export async function measureTarget(id: string): Promise<TargetRect | null> {
  const fn = measurers.get(id);
  if (!fn) return null;
  try {
    return await fn();
  } catch {
    return null;
  }
}
