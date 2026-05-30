export function MainStage() {
  return (
    <div
      className="w-full h-full p-4 relative overflow-hidden"
      style={{
        backgroundColor: '#101018',
        backgroundImage:
          'linear-gradient(rgba(244, 240, 216, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 240, 216, 0.03) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div className="absolute top-4 left-4 bg-pixel-panel border-2 border-pixel-text p-2 font-pixel text-[9px] text-pixel-info z-10">
        STAGE MAP // FLOW_MODE: MOCK_COLLAB
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center font-mono opacity-40 animate-pulse">
          <div className="text-sm text-pixel-text mb-2">[ FLOW CANVAS PLACEHOLDER ]</div>
          <div className="text-xs text-pixel-muted">NEXT: INTEGRATE REACT FLOW FOR NODE GRAPH</div>
        </div>
      </div>
    </div>
  );
}
