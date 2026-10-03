import { useRef } from "react";
import { stats } from "../data/content.js";
import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap.js";

export default function Stats() {
  const scope = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray(".stat__number", scope.current).forEach((el) => {
        const counter = { value: 0 };
        const decimals = Number(el.dataset.decimals);
        gsap.to(counter, {
          value: Number(el.dataset.value),
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onUpdate: () => (el.textContent = counter.value.toFixed(decimals)),
        });
      });
      gsap.from(".stat", {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: scope.current, start: "top 92%", once: true },
      });
    },
    { scope },
  );

  return (
    <section aria-label="At a glance" className="container" ref={scope}>
      <div className="stats">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat__value">
              <span className="stat__number" data-value={s.value} data-decimals={s.decimals ?? 0}>
                {s.value.toFixed(s.decimals ?? 0)}
              </span>
              {s.suffix}
            </span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
