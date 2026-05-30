export function MainStage() {
  return (
    <div className="w-full h-full p-4 relative overflow-hidden bg-pixel-bg">
      <div className="absolute top-4 left-4 glass-panel px-2 py-1 font-pixel text-[9px] text-pixel-muted z-10">
        STAGE MAP // FLOW_MODE: MOCK_COLLAB
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center font-mono opacity-30 animate-pulse">
          <div className="text-sm text-neutral-200 mb-2">[ FLOW CANVAS PLACEHOLDER ]</div>
          <div className="text-xs text-neutral-500">NEXT: INTEGRATE REACT FLOW FOR NODE GRAPH</div>
        </div>
      </div>
    </div>
  );
}
