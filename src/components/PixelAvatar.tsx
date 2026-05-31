const avatarPatterns: Record<string, { fg: string; rects: [number, number, number, number][] }> = {
  codex: {
    fg: '#84a59d',
    rects: [[1, 0, 6, 1], [0, 1, 8, 1], [0, 2, 3, 1], [5, 2, 3, 1], [0, 3, 8, 1], [2, 4, 4, 1], [1, 5, 6, 1], [2, 6, 4, 1]],
  },
  trae: {
    fg: '#a3a3a3',
    rects: [[2, 0, 4, 1], [1, 1, 6, 1], [0, 2, 8, 2], [1, 4, 2, 1], [5, 4, 2, 1], [1, 5, 6, 1], [2, 6, 4, 1]],
  },
  'claude-code-cli': {
    fg: '#c2b280',
    rects: [[3, 0, 2, 1], [2, 1, 4, 1], [1, 2, 6, 1], [0, 3, 8, 1], [1, 4, 6, 1], [2, 5, 4, 1], [3, 6, 2, 1]],
  },
  coordinator: {
    fg: '#b56576',
    rects: [[0, 0, 8, 1], [0, 1, 3, 1], [5, 1, 3, 1], [0, 2, 2, 1], [3, 2, 2, 1], [6, 2, 2, 1], [0, 3, 8, 1], [2, 4, 4, 1], [1, 5, 6, 1], [2, 6, 4, 1]],
  },
  custom: {
    fg: '#789ca4',
    rects: [[2, 0, 4, 1], [1, 1, 6, 1], [0, 2, 8, 2], [1, 4, 6, 1], [2, 5, 4, 1], [3, 6, 2, 1]],
  },
};

export function PixelAvatar({ kind }: { kind: string }) {
  const pattern = avatarPatterns[kind] ?? avatarPatterns.custom;

  return (
    <div className="w-10 h-10 rounded-sm bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 8 8" className="w-full h-full">
        {pattern.rects.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={pattern.fg} shapeRendering="crispEdges" />
        ))}
        <rect x="3" y="2" width="2" height="1" fill="#0a0a0a" shapeRendering="crispEdges" />
      </svg>
    </div>
  );
}
