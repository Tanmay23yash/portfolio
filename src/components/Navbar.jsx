import { useEffect, useState } from "react";
import { navLinks, profile } from "../data/content.js";
import useAmbientMusic from "../hooks/useAmbientMusic.js";
import Icon from "./Icons.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { playing, toggle } = useAmbientMusic();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <header className={`navbar${scrolled || open ? " is-scrolled" : ""}`}>
      <div className="container navbar__inner">
        <div className="navbar__brand">
          <a href="#hero" className="logo" aria-label={`${profile.fullName}, back to top`}>
            <span className="logo__mark">{profile.initials}</span>
            <span>{profile.firstName}</span>
          </a>
          <button
            type="button"
            className={`audio-btn${playing ? " is-playing" : ""}`}
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? "Pause background music" : "Play background music"}
            title={playing ? "Pause music" : "Play some lo-fi"}
          >
            {[7, 12, 5, 10].map((h, i) => (
              <i key={i} style={{ "--i": i, "--h": `${h}px` }} />
            ))}
          </button>
        </div>

        <nav className="navbar__links" aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.name}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <a href="#contact" className="contact-btn">
            Contact me
            <Icon name="arrowUpRight" />
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span>
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          {[...navLinks, { name: "Contact me", href: "#contact" }].map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.name}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
