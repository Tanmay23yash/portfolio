import { lazy, Suspense } from "react";
import { heroHeadline, heroWords, profile } from "../data/content.js";
import useInView from "../hooks/useInView.js";
import Icon from "./Icons.jsx";
import WordSlider from "./WordSlider.jsx";
import SceneBoundary from "./SceneBoundary.jsx";

const HeroScene = lazy(() => import("./three/HeroScene.jsx"));

export default function Hero({ ready }) {
  const [sceneRef, sceneVisible] = useInView({ rootMargin: "0px" });
  const [first, second, third] = heroHeadline;

  return (
    <section id="hero" className={`hero is-animated${ready ? " is-ready" : ""}`}>
      <div className="hero__glow" />
      <div className="hero__grid" />

      <div className="container hero__layout">
        <div className="hero__copy">
          <h1 className="hero__headline">
            <span className="hero__line hero__line--first">
              {first}
              <WordSlider words={heroWords} />
            </span>
            <span className="hero__line">{second}</span>
            <span className="hero__line">{third}</span>
          </h1>

          <p className="hero__sub">
            Hi, I'm <strong>{profile.firstName}</strong> 👋, a <strong>{profile.role}</strong>. {profile.intro}
          </p>

          <div className="hero__cta-row">
            <a href="#work" className="cta">
              <span className="cta__circle" />
              <span className="cta__label">See my work</span>
              <span className="cta__arrow">
                <Icon name="arrowDown" />
              </span>
            </a>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="ghost-link" target="_blank" rel="noreferrer">
                <Icon name="file" /> Résumé
              </a>
            )}
          </div>
        </div>

        <div className="hero__scene" ref={sceneRef}>
          <SceneBoundary>
            <Suspense fallback={<div className="scene-fallback" />}>
              <HeroScene active={sceneVisible} />
            </Suspense>
          </SceneBoundary>
          <span className="hero__scene-hint" aria-hidden="true">
            <span className="hint--pointer">drag to look around · click the lamp</span>
            <span className="hint--touch">tap the lamp</span>
          </span>
        </div>
      </div>
    </section>
  );
}
