import { useEffect, useState } from "react";
import Icon from "./Icons.jsx";

// Vertically cycles through words. The first word is repeated at the end
// so the loop can snap back to the start without a visible jump.
export default function WordSlider({ words, interval = 2200 }) {
  const [index, setIndex] = useState(0);
  const [moving, setMoving] = useState(true);
  const items = [...words, words[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      // Transitions don't run in background tabs, so don't advance while hidden.
      if (document.hidden) return;
      setMoving(true);
      setIndex((i) => i + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  const onTransitionEnd = () => {
    if (index === words.length) {
      setMoving(false);
      setIndex(0);
    }
  };

  return (
    <span className="word-slider">
      <span className="sr-only">{words.map((w) => w.text).join(", ")}</span>
      <span
        className={`word-slider__track${moving ? " is-moving" : ""}`}
        style={{ transform: `translateY(${-index * 1.2}em)` }}
        onTransitionEnd={onTransitionEnd}
        aria-hidden="true"
      >
        {items.map((word, i) => (
          <span className="word-slider__item" key={i}>
            <span className="word-slider__icon">
              <Icon name={word.icon} />
            </span>
            {word.text}
          </span>
        ))}
      </span>
    </span>
  );
}
