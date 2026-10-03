import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap.js";

// Fades and lifts every `.reveal` element inside `scope` as it scrolls into view.
export default function useReveal(scope) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray(".reveal", scope.current).forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    },
    { scope },
  );
}
