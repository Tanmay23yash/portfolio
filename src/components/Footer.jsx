import { profile, socials } from "../data/content.js";
import Icon from "./Icons.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <a href="#contact" className="footer__big">
            Let's talk.
          </a>
          <div className="socials">
            {socials.map((s) => (
              <a
                key={s.name}
                className="social"
                href={s.href}
                target={s.icon === "mail" ? undefined : "_blank"}
                rel="noreferrer"
                aria-label={s.name}
                title={s.name}
              >
                <Icon name={s.icon} />
              </a>
            ))}
          </div>
        </div>
        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {profile.fullName}
          </span>
          <a href="#hero">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
