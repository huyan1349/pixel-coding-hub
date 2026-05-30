export function MainStage() {
  return (
    <div
      className="w-full h-full p-4 relative overflow-hidden"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage:
          'linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div className="absolute top-4 left-4 glass-panel px-2 py-1 font-pixel text-[9px] text-pixel-info z-10">
        STAGE MAP // FLOW_MODE: MOCK_COLLAB
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center font-mono opacity-30 animate-pulse">
          <div className="text-sm text-pixel-text mb-2">[ FLOW CANVAS PLACEHOLDER ]</div>
          <div className="text-xs text-pixel-muted">NEXT: INTEGRATE REACT FLOW FOR NODE GRAPH</div>
        </div>
      </div>
    </div>
  );
}
