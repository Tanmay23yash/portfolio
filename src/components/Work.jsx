import { useRef } from "react";
import { projects } from "../data/content.js";
import useReveal from "../hooks/useReveal.js";
import Icon from "./Icons.jsx";
import ProjectCover from "./ProjectCover.jsx";
import SectionTitle from "./SectionTitle.jsx";

function ProjectMedia({ project, variant }) {
  if (project.video) {
    return <video src={project.video} poster={project.image} autoPlay muted loop playsInline />;
  }
  if (project.image) {
    return <img src={project.image} alt={`Screenshot of ${project.title.split(":")[0]}`} loading="lazy" />;
  }
  return <ProjectCover title={project.title} accent={project.accent} variant={variant} />;
}

function ProjectCard({ project, variant, featured }) {
  const primary = project.links?.[0]?.href;

  return (
    <article className={`project-card reveal${featured ? " project-card--featured" : ""}`} style={{ "--c": project.accent }}>
      {primary ? (
        <a className="project-card__media" href={primary} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
          <ProjectMedia project={project} variant={variant} />
        </a>
      ) : (
        <div className="project-card__media">
          <ProjectMedia project={project} variant={variant} />
        </div>
      )}
      <div className="project-card__body">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {project.highlights?.length > 0 && (
          <ul className="project-card__highlights">
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        <div className="tags">
          {project.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        {project.links?.length > 0 && (
          <div className="project-card__links">
            {project.links.map((link) => (
              <a key={link.href} className="text-link" href={link.href} target="_blank" rel="noreferrer">
                {link.label} <Icon name="arrowUpRight" />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Work() {
  const scope = useRef(null);
  useReveal(scope);

  // Two projects sit side by side; three or more use the featured + stacked layout.
  const pair = projects.length === 2;
  const [featured, ...others] = projects;
  const side = pair ? [] : others.slice(0, 2);
  const more = pair ? [] : others.slice(2);

  return (
    <section id="work" className="section" ref={scope}>
      <div className="container">
        <SectionTitle eyebrow="Selected work" title="Things I've built">
          LLM applications, models trained from scratch, and the pipelines that ship them.
        </SectionTitle>

        {pair ? (
          <div className="showcase showcase--pair">
            {projects.map((p, i) => (
              <ProjectCard key={p.title} project={p} variant={i} featured />
            ))}
          </div>
        ) : (
          <div className="showcase">
            <ProjectCard project={featured} variant={0} featured />
            <div className="showcase__side">
              {side.map((p, i) => (
                <ProjectCard key={p.title} project={p} variant={i + 1} />
              ))}
            </div>
          </div>
        )}

        {more.length > 0 && (
          <div className="more">
            <div className="more__heading reveal">
              <h3>More projects</h3>
              <span>{String(more.length).padStart(2, "0")} entries</span>
            </div>
            <ul>
              {more.map((p, i) => {
                const href = p.links?.[0]?.href;
                return (
                  <li key={p.title} className="more-row reveal" style={{ "--c": p.accent }}>
                    <span className="more-row__index">{String(i + 1).padStart(2, "0")}</span>
                    <div className="more-row__main">
                      <span className="more-row__title">
                        <i aria-hidden="true" />
                        {p.title}
                      </span>
                      <span className="more-row__desc">{p.description}</span>
                    </div>
                    <div className="tags">
                      {p.tags.map((t) => (
                        <span className="tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {href ? (
                      <a className="more-row__arrow" href={href} target="_blank" rel="noreferrer" aria-label={`Open ${p.title}`}>
                        <Icon name="arrowRight" />
                      </a>
                    ) : (
                      <span className="more-row__arrow is-disabled" aria-hidden="true">
                        <Icon name="arrowRight" />
                      </span>
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
