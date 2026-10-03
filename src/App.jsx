import { useCallback, useState } from "react";
import Intro from "./components/Intro.jsx";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Stats from "./components/Stats.jsx";
import Work from "./components/Work.jsx";
import Experience from "./components/Experience.jsx";
import Skills from "./components/Skills.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

const introPending = () => document.documentElement.classList.contains("intro-pending");

export default function App() {
  const [showIntro, setShowIntro] = useState(introPending);

  const finishIntro = useCallback(() => {
    document.documentElement.classList.remove("intro-pending");
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
    window.scrollTo(0, 0);
    setShowIntro(false);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {showIntro && <Intro onDone={finishIntro} />}
      <Navbar />
      <main id="main">
        <Hero ready={!showIntro} />
        <Stats />
        <Work />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
