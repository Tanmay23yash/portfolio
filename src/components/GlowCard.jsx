// A card whose border and background light up around the cursor.
export default function GlowCard({ children, className = "" }) {
  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className={`glow-card ${className}`} onPointerMove={onPointerMove}>
      {children}
    </div>
  );
}
