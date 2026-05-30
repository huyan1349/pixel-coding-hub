const avatarPatterns: Record<string, { fg: string; rects: [number, number, number, number][] }> = {
  codex: {
    fg: '#57d68d',
    rects: [[1, 0, 6, 1], [0, 1, 8, 1], [0, 2, 3, 1], [5, 2, 3, 1], [0, 3, 8, 1], [2, 4, 4, 1], [1, 5, 6, 1], [2, 6, 4, 1]],
  },
  trae: {
    fg: '#ff70a6',
    rects: [[2, 0, 4, 1], [1, 1, 6, 1], [0, 2, 8, 2], [1, 4, 2, 1], [5, 4, 2, 1], [1, 5, 6, 1], [2, 6, 4, 1]],
  },
  'claude-code-cli': {
    fg: '#f78c3d',
    rects: [[3, 0, 2, 1], [2, 1, 4, 1], [1, 2, 6, 1], [0, 3, 8, 1], [1, 4, 6, 1], [2, 5, 4, 1], [3, 6, 2, 1]],
  },
  custom: {
    fg: '#4cc9f0',
    rects: [[2, 0, 4, 1], [1, 1, 6, 1], [0, 2, 8, 2], [1, 4, 6, 1], [2, 5, 4, 1], [3, 6, 2, 1]],
  },
};

export function PixelAvatar({ kind }: { kind: string }) {
  const pattern = avatarPatterns[kind] ?? avatarPatterns.custom;

  return (
    <div className="w-10 h-10 border-2 border-pixel-text bg-pixel-dark flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 8 8" className="w-full h-full">
        {pattern.rects.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={pattern.fg} shapeRendering="crispEdges" />
        ))}
        <rect x="3" y="2" width="2" height="1" fill="#0b0b12" shapeRendering="crispEdges" />
      </svg>
    </div>
  );
}
