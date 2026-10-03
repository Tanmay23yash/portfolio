import { useRef } from "react";
import { certifications, experience } from "../data/content.js";
import Icon from "./Icons.jsx";
import useReveal from "../hooks/useReveal.js";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "../lib/gsap.js";
import GlowCard from "./GlowCard.jsx";
import SectionTitle from "./SectionTitle.jsx";

const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function Experience() {
  const scope = useRef(null);
  useReveal(scope);

  useGSAP(
    () => {
      const items = gsap.utils.toArray(".timeline__item", scope.current);
      items.forEach((item) =>
        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          onToggle: (self) => item.classList.toggle("is-active", self.isActive),
          end: "max",
        }),
      );
      if (prefersReducedMotion()) {
        gsap.set(".timeline__fill", { scaleY: 1 });
        return;
      }
      gsap.to(".timeline__fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: ".timeline", start: "top 60%", end: "bottom 60%", scrub: 0.6 },
      });
    },
    { scope },
  );

  return (
    <section id="experience" className="section" ref={scope}>
      <div className="container">
        <SectionTitle eyebrow="Experience" title="Where I've been, what I've learned">
          Roles, teams, and the education that shaped how I work.
        </SectionTitle>

        <div className="timeline">
          <span className="timeline__track" aria-hidden="true" />
          <span className="timeline__fill" aria-hidden="true" />
          <ol className="timeline__list">
          {experience.map((job) => (
            <li className="timeline__item" key={`${job.company}-${job.role}`}>
              <span className="timeline__dot" aria-hidden="true" />
              <div className="timeline__meta reveal">
                <span className="company-logo" aria-hidden="true">
                  {job.logo ? <img src={job.logo} alt="" /> : initials(job.company)}
                </span>
                <div className="timeline__meta-text">
                  <span className="timeline__company">{job.company}</span>
                  <span className="timeline__date">{job.date}</span>
                  {job.location && <span className="timeline__date">{job.location}</span>}
                </div>
              </div>
              <div className="reveal">
                <GlowCard>
                  <h3>{job.role}</h3>
                  <ul>
                    {job.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </GlowCard>
              </div>
            </li>
          ))}
          </ol>
        </div>

        {certifications.length > 0 && (
          <div className="more">
            <div className="more__heading reveal">
              <h3>Certifications & achievements</h3>
              <span>{String(certifications.length).padStart(2, "0")} entries</span>
            </div>
            <ul className="certs">
              {certifications.map((c) => {
                const body = (
                  <>
                    <span className="cert__icon" aria-hidden="true">
                      <Icon name="award" />
                    </span>
                    <span className="cert__text">
                      <span className="cert__title">{c.title}</span>
                      <span className="cert__issuer">{c.issuer}</span>
                    </span>
                    {c.href && <Icon name="arrowUpRight" className="cert__arrow" />}
                  </>
                );
                return (
                  <li key={c.title} className="reveal">
                    {c.href ? (
                      <a className="cert" href={c.href} target="_blank" rel="noreferrer">
                        {body}
                      </a>
                    ) : (
                      <div className="cert">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
