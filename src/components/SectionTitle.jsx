export default function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="section-title reveal">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
