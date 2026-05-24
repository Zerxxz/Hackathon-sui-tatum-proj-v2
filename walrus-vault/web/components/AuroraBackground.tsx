// Fixed full-bleed background of three blurred radial blobs that drift
// independently. Pure CSS animations, no JS. Sits at z-index 0 so the
// app content (z-10) renders on top.

export function AuroraBackground() {
  return (
    <div className="aurora">
      <div
        className="aurora-blob animate-aurora-1"
        style={{
          top: "-15%",
          left: "-10%",
          width: "70vw",
          height: "70vw",
          background:
            "radial-gradient(circle, rgb(14, 165, 233) 0%, transparent 65%)",
        }}
      />
      <div
        className="aurora-blob animate-aurora-2"
        style={{
          top: "10%",
          right: "-20%",
          width: "55vw",
          height: "55vw",
          background:
            "radial-gradient(circle, rgb(34, 211, 238) 0%, transparent 65%)",
        }}
      />
      <div
        className="aurora-blob animate-aurora-3"
        style={{
          bottom: "-25%",
          left: "20%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle, rgb(99, 102, 241) 0%, transparent 65%)",
        }}
      />
      {/* Vignette so content edges fade nicely into the dark background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(5,8,22,0.55)_70%,_rgba(5,8,22,0.95)_100%)]" />
    </div>
  );
}
