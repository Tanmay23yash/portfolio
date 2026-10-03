import { lazy, Suspense, useRef, useState } from "react";
import { contact, profile, socials } from "../data/content.js";
import useInView from "../hooks/useInView.js";
import useReveal from "../hooks/useReveal.js";
import GlowCard from "./GlowCard.jsx";
import Icon from "./Icons.jsx";
import SceneBoundary from "./SceneBoundary.jsx";
import SectionTitle from "./SectionTitle.jsx";

const ContactScene = lazy(() => import("./three/ContactScene.jsx"));

const EMPTY = { name: "", email: "", message: "", company: "" };

const mailtoHref = (form) => {
  const subject = form.name ? `Hello from ${form.name}` : "Hello";
  const body = form.message ? `${form.message}\n\n${form.name}\n${form.email}` : "";
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export default function Contact() {
  const scope = useRef(null);
  useReveal(scope);
  const [nearRef, near] = useInView({ rootMargin: "600px", once: true });
  const [visibleRef, visible] = useInView({ rootMargin: "0px" });
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle" });
  const [copied, setCopied] = useState(false);
  const openedAt = useRef(Date.now());

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!contact.formEndpoint) {
      window.location.href = mailtoHref(form);
      setStatus({ state: "mailto" });
      return;
    }

    setStatus({ state: "sending" });
    try {
      const res = await fetch(contact.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, elapsed: Date.now() - openedAt.current }),
        signal: AbortSignal.timeout(30_000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't send your message right now.");
      setStatus({ state: "success", sentTo: form.name });
      setForm(EMPTY);
    } catch (err) {
      const unreachable = err instanceof TypeError || err.name === "TimeoutError";
      setStatus({ state: "error", message: unreachable ? "Couldn't reach the server." : err.message });
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="section" ref={scope}>
      <div className="container">
        <SectionTitle eyebrow="Contact" title={contact.heading}>
          {contact.subheading}
        </SectionTitle>

        <div className="contact__grid">
          <div className="reveal">
            <GlowCard>
              <form className="contact-form" onSubmit={onSubmit}>
                <div className="field">
                  <label htmlFor="name">Your name</label>
                  <input id="name" name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={update} placeholder="What should I call you?" />
                </div>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} value={form.email} onChange={update} placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={5}
                    value={form.message}
                    onChange={update}
                    placeholder="Tell me about your project, role, or idea…"
                  />
                </div>
                {/* Honeypot: hidden from people, irresistible to bots. */}
                <div className="hp" aria-hidden="true">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={update} />
                </div>
                <button className="submit-btn" type="submit" disabled={status.state === "sending"}>
                  {status.state === "sending" ? "Sending…" : "Send message"}
                  <Icon name="send" />
                </button>
                <p className={`form-status is-${status.state}`} role="status" aria-live="polite">
                  {status.state === "success" && `Thanks, ${status.sentTo}! Your message is on its way. I'll reply by email.`}
                  {status.state === "mailto" && "Opening your email app…"}
                  {status.state === "error" && (
                    <>
                      {status.message}{" "}
                      <a href={mailtoHref(form)}>Email me directly instead.</a>
                    </>
                  )}
                </p>
              </form>
            </GlowCard>
          </div>

          <div className="contact__scene reveal">
            <div
              className="contact__canvas"
              ref={(el) => {
                nearRef.current = el;
                visibleRef.current = el;
              }}
            >
              {near && (
                <SceneBoundary>
                  <Suspense fallback={<div className="scene-fallback" />}>
                    <ContactScene name={form.name || status.sentTo || ""} sent={status.state === "success"} active={visible} />
                  </Suspense>
                </SceneBoundary>
              )}
            </div>
            <div className="contact__direct">
              <div className="contact__email-group">
                <a className="contact__email" href={`mailto:${profile.email}`}>
                  <Icon name="mail" />
                  {profile.email}
                </a>
                <button type="button" className="copy-btn" onClick={copyEmail} aria-label="Copy email address" title="Copy email address">
                  <Icon name={copied ? "check" : "copy"} />
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? "Email address copied" : ""}
                </span>
              </div>
              <div className="socials">
                {socials
                  .filter((s) => s.icon !== "mail")
                  .map((s) => (
                    <a key={s.name} className="social" href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name}>
                      <Icon name={s.icon} />
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
