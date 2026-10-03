// ─────────────────────────────────────────────────────────────────────────────
//  All the words on the site live here. Edit this file to update the portfolio.
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  firstName: "Yash",
  fullName: "Yash Raghuvanshi",
  initials: "YR",
  role: "Machine Learning Engineer",
  // Shown under the hero headline.
  intro:
    "I build LLM applications end to end with RAG, vector search and multi-agent orchestration, and I train transformers from scratch in PyTorch.",
  location: "Kota, Rajasthan, India",
  email: "tanmaysraghuvanshi23@gmail.com",
  resumeUrl: "/resume.pdf",
};

// Hero headline, read as: "Turning [word] / into Intelligent / Products".
export const heroHeadline = ["Turning", "into Intelligent", "Products"];

// The rotating word in the headline. icon is one of: idea, data, research, model, code, concept, design, ship
export const heroWords = [
  { text: "Ideas", icon: "idea" },
  { text: "Data", icon: "data" },
  { text: "Research", icon: "research" },
  { text: "Models", icon: "model" },
  { text: "Code", icon: "code" },
];

export const navLinks = [
  { name: "Work", href: "#work" },
  { name: "Experience", href: "#experience" },
  { name: "Skills", href: "#skills" },
];

// Numbers shown in the strip under the hero. `decimals` is optional.
export const stats = [
  { value: 1, suffix: "+", label: "Year building AI at L&T Technology Services" },
  { value: 5.3, decimals: 1, suffix: "M", label: "Parameter GPT trained from scratch" },
  { value: 98, suffix: "M", label: "Tokens of Hinglish pre-training data" },
  { value: 90, suffix: "+", label: "Automated tests in HireMind's CI" },
];

// The first project is the large featured card; the next two sit beside it.
// Any beyond that appear in the "More projects" list below.
// Optional media: image: "/projects/foo.webp" or video: "/projects/foo.mp4" (files go in /public).
// Without media, a generated cover in the project's accent colour is used.
export const projects = [
  {
    title: "HireMind: AI Mock Interview Platform",
    description:
      "A full-stack platform that runs adaptive technical interviews from a candidate's resume and a target job description, with every question and grade grounded in the resume.",
    highlights: [
      "RAG pipeline with section-aware resume chunking, 768-dim Gemini embeddings in pgvector and cosine top-k retrieval.",
      "Multi-agent orchestrator (planner, question generator, evaluator, report writer) with Pydantic-structured outputs and 5-level adaptive difficulty.",
      "JWT and Google OAuth, per-step LLM token and latency tracing, and Jenkins CI running 90+ pytest and Vitest tests with SonarQube.",
    ],
    tags: ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "pgvector", "Gemini API", "Jenkins"],
    accent: "#ffb45a",
    image: "/projects/hiremind.webp",
    links: [{ label: "Live site", href: "https://tryhiremind.vercel.app" }],
  },
  {
    title: "Mini-GPT: Hinglish GPT from Scratch vs LoRA-Tuned LLM",
    description:
      "A GPT written from scratch in PyTorch and pre-trained on Hinglish tweets, benchmarked against classic NLP baselines and a LoRA-tuned open LLM on code-mixed sentiment.",
    highlights: [
      "5.3M-parameter GPT with a byte-level BPE tokenizer, multi-head causal self-attention and pre-norm transformer blocks.",
      "Pre-trained on 98M tokens on a 4 GB GPU in 40 minutes: validation perplexity fell from 8,659 to 150, and sentiment macro F1 rose 3.9 points.",
      "LoRA-tuned Qwen3.5-0.8B scored best at 0.714 macro F1 over 3 seeds on SemEval-2020 SentiMix, with bootstrap 95% confidence intervals.",
    ],
    tags: ["PyTorch", "Transformers", "LoRA", "Hugging Face", "Gradio"],
    accent: "#7fe3c0",
    image: "/projects/mini-gpt.webp",
    links: [
      { label: "Live demo", href: "https://huggingface.co/spaces/Yash230901/mini-gpt-hinglish" },
      { label: "Source", href: "https://github.com/Tanmay23yash/mini-gpt" },
    ],
  },
];

// Newest first.
export const experience = [
  {
    role: "Associate Engineer",
    company: "L&T Technology Services",
    logo: "", // optional: "/logos/ltts.svg"
    date: "Sep 2025 – Present",
    location: "India",
    points: [
      "Engineered an autonomous AI agent that parses, refactors and modifies codebases from natural-language instructions.",
      "Integrated agentic developer tooling (Claude Code) into the IDE workflow, speeding up development and refactoring.",
      "Designed Jenkins pipelines for automated testing and deployment.",
      "Resolved critical API and backend integration issues with Postman while providing cross-team technical support.",
    ],
  },
  {
    role: "Machine Learning Intern",
    company: "Internshala",
    logo: "",
    date: "Jun 2023 – Aug 2023",
    location: "Remote",
    points: ["Built a disease prediction model with Logistic Regression and compared it against KNN, SVC and Decision Tree classifiers."],
  },
  {
    role: "B.Tech, Computer Science and Engineering",
    company: "Amity University",
    logo: "",
    date: "Graduated Aug 2025",
    location: "Gwalior, Madhya Pradesh",
    points: ["Graduated with a CGPA of 8.44 / 10."],
  },
];

export const certifications = [
  { title: "OCI 2025 Certified Generative AI Professional", issuer: "Oracle" },
  { title: "OCI 2025 Certified Foundations Associate", issuer: "Oracle" },
  { title: "Machine Learning and Deep Learning", issuer: "Coursera · Stanford University" },
  { title: "EF SET English Certificate, C2 Proficient", issuer: "EF SET" },
  {
    title: "CodeChef highest rating 1307",
    issuer: "Gold badge (contests) · Bronze badge (problem solving)",
    href: "https://www.codechef.com/users/singh_tanmay23",
  },
];

// Shown as scrolling rows.
export const skills = [
  ["PyTorch", "TensorFlow", "scikit-learn", "Hugging Face Transformers", "LoRA / PEFT", "LLMs", "RAG", "Embeddings", "Vector Search", "Prompt Engineering", "AI Agents", "NLP", "Deep Learning", "Gemini API", "Pandas", "NumPy"],
  ["Python", "SQL", "C", "C++", "FastAPI", "REST APIs", "Pydantic", "Django", "PostgreSQL", "pgvector", "SQLAlchemy"],
  ["Git", "GitHub", "Jenkins", "CI/CD", "SonarQube", "Postman", "pytest", "Render", "Vercel", "Claude Code"],
];

export const socials = [
  { name: "GitHub", href: "https://github.com/Tanmay23yash", icon: "github" },
  { name: "Hugging Face", href: "https://huggingface.co/Yash230901", icon: "huggingface" },
  { name: "CodeChef", href: "https://www.codechef.com/users/singh_tanmay23", icon: "codechef" },
  // { name: "LinkedIn", href: "https://www.linkedin.com/in/your-handle", icon: "linkedin" },
  { name: "Email", href: `mailto:${profile.email}`, icon: "mail" },
];

export const contact = {
  heading: "Let's build something intelligent",
  subheading: "Have a role, a project, or a question about LLMs? My inbox is open.",
  // Where the form posts. "/api/contact" is this site's own email function (api/contact.js);
  // it needs SMTP_USER and SMTP_PASS set (see README). Set to "" to open the visitor's email app instead.
  formEndpoint: "/api/contact",
};
