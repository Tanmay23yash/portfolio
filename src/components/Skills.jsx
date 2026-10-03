import { useRef } from "react";
import { skills } from "../data/content.js";
import useReveal from "../hooks/useReveal.js";
import SectionTitle from "./SectionTitle.jsx";

const COLORS = ["#ffb45a", "#7fe3c0", "#b4a7ff", "#ff8fa3", "#6cc4ff", "#f6e27a"];

function Row({ items: names, offset }) {
  // Short rows are repeated so a single track is always wider than the screen.
  const items = Array.from({ length: Math.ceil(16 / names.length) }, () => names).flat();
  const pills = items.map((name, i) => (
    <span
      className={`skill${i >= names.length ? " is-repeat" : ""}`}
      key={`${name}-${i}`}
      style={{ "--c": COLORS[(i + offset) % COLORS.length] }}
    >
      <i aria-hidden="true" />
      {name}
    </span>
  ));

  // The track is rendered twice so the loop is seamless.
  // Duration scales with the row length so every row moves at the same speed.
  return (
    <div className="marquee__row" style={{ "--duration": `${items.length * 4.5 + offset}s` }}>
      <div className="marquee__track">{pills}</div>
      <div className="marquee__track" aria-hidden="true">
        {pills}
      </div>
    </div>
  );
}

export default function Skills() {
  const scope = useRef(null);
  useReveal(scope);

  return (
    <section id="skills" className="section" ref={scope}>
      <div className="container">
        <SectionTitle eyebrow="Toolkit" title="The tools I reach for">
          From training models in PyTorch to shipping them behind FastAPI with CI/CD.
        </SectionTitle>
      </div>
      <div className="marquee reveal">
        {skills.map((row, i) => (
          <Row items={row} offset={i * 3} key={i} />
        ))}
      </div>
    </section>
  );
}
