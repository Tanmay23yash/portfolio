import { useEffect, useState } from "react";

const WORD = "Hello!";

// How long each phase lasts (ms). Matches the CSS animations in index.css.
const PHASES = [
  ["arriving", 1900],
  ["holding", 700],
  ["departing", 950],
  ["fading", 800],
];

export default function Intro({ onDone }) {
  const [phase, setPhase] = useState(0);
  const [name, duration] = PHASES[phase] ?? [];

  useEffect(() => {
    if (!name) return;
    const timer = setTimeout(() => {
      if (phase === PHASES.length - 1) onDone();
      else setPhase(phase + 1);
    }, duration);
    return () => clearTimeout(timer);
  }, [phase, name, duration, onDone]);

  const skip = () => setPhase(PHASES.length - 1);

  return (
    <section className={`intro is-${name}`} aria-label="Welcome animation">
      <div className="intro__stage">
        <h1 className="intro__title" aria-label={WORD}>
          {WORD.split("").map((char, i) => (
            <span key={i} style={{ "--i": i }} aria-hidden="true">
              {char}
            </span>
          ))}
        </h1>
        <button className="intro__skip" type="button" onClick={skip}>
          Skip
        </button>
      </div>
    </section>
  );
}
