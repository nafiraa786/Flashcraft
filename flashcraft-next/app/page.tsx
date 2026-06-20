"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";


const galleryCards = [
  {
    title: "Past Forward",
    subtitle: "Your personal time machine. FlashCraft reimagines you in past decades with character consistency.",
    accent: "featured",
    badge: "2,340 remixes",
    content: <PastForwardPreview />,
  },
  {
    title: "Research Visualization",
    subtitle: "Research paper reimagined as an elegant, interactive narrative site.",
    accent: "",
    content: <ResearchPreview />,
  },
  {
    title: "GemBooth",
    subtitle: "Try native image model effects with your webcam.",
    accent: "",
    content: <GemBoothPreview />,
  },
  {
    title: "Veo 3 Gallery",
    subtitle: "Explore a gallery of stunning Veo videos and remix their prompts to create your own.",
    accent: "",
    content: <VeoPreview />,
  },
];

export default function Home() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [toast, setToast] = useState("");

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(28, el.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [prompt, resizeTextarea]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      const isMeta = event.metaKey || event.ctrlKey;
      if (isMeta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        textareaRef.current?.focus();
      } else if (
        event.key === "/" &&
        activeTag !== "TEXTAREA" &&
        activeTag !== "INPUT"
      ) {
        event.preventDefault();
        textareaRef.current?.focus();
      } else if (event.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  const submitPrompt = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setHasError(true);
      textareaRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/studios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Failed to create studio session");
      }

      const data = await response.json();
      setPrompt("");
      resizeTextarea();
      router.push(`/studio/${data.id}`);
    } catch (error) {
      console.error(error);
      setToast("Error: Failed to initiate workspace. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-slate-50">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header
        className={`header fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isScrolled ? "scrolled" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-7 py-3.5">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={isDrawerOpen}
              aria-controls="drawer"
              onClick={() => setIsDrawerOpen(true)}
              className="menu-btn"
            >
              <MenuIcon />
            </button>
            <a href="#" className="logo flex items-center gap-2.5">
              <FlashIcon />
              FlashCraft
            </a>
          </div>
          <button
            type="button"
            aria-label="User profile"
            className="header-avatar"
          >
            US
          </button>
        </div>
      </header>

      <div
        className={`drawer-overlay ${isDrawerOpen ? "open" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <nav
        id="drawer"
        aria-label="Main menu"
        aria-hidden={!isDrawerOpen}
        className={`drawer ${isDrawerOpen ? "open" : ""}`}
      >
        <div className="drawer-head">
          <span className="drawer-logo">FlashCraft</span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close menu"
            onClick={() => setIsDrawerOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        {["Home", "Gallery", "Pricing", "Docs"].map((item) => (
          <a key={item} href="#" className="drawer-link">
            {item}
          </a>
        ))}
        <div className="drawer-foot">
          <button type="button" className="header-avatar" aria-label="User profile">
            JD
          </button>
        </div>
      </nav>

      <section id="main" className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            AI App Forge <span className="cursor" aria-hidden="true" />
          </span>
          <h1 className="hero-title text-balance">
            Describe it.<br />
            <strong>We&apos;ll forge it.</strong>
          </h1>
          <p className="hero-sub">
            Type an idea. FlashCraft builds the working app — UI, logic, and data wired together.
          </p>

          <div className={`input-wrapper ${hasError ? "has-error" : ""}`}>
            <div className="input-container">
              <div className="input-inner">
                <div className="prompt-row">
                  <span className="prompt-glyph">&gt;</span>
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      setHasError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitPrompt();
                      }
                    }}
                    aria-label="Describe the app you want to build"
                    placeholder="A habit tracker with streaks and a calm dark UI…"
                    rows={1}
                    disabled={isSubmitting}
                    className="min-h-0 w-full resize-none bg-transparent text-base leading-6 text-slate-50 placeholder:text-slate-400 focus:outline-none"
                  />
                  <kbd className="kbd-hint">⌘K</kbd>
                </div>
                <p className="error-msg" role="alert">
                  Type something for FlashCraft to forge.
                </p>
                <div className="input-actions">
                  <div className="input-left-actions">
                    <button type="button" className="icon-btn" aria-label="Voice input">
                      <MicIcon />
                    </button>
                    <button type="button" className="icon-btn" aria-label="Attach file">
                      <PlusIcon />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="send-btn"
                    aria-label="Forge this app"
                    disabled={isSubmitting}
                    onClick={submitPrompt}
                  >
                    {isSubmitting ? <Spinner /> : <SendIcon />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="presets-block">
            <div className="preset-row">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    setPrompt(`Build a production-ready app similar to ${preset.label}.

Include:
- landing page
- onboarding
- authentication
- responsive UI
- API structure
- database models
- scalable architecture
- modern animations
 `);
                    setHasError(false);
                    textareaRef.current?.focus();
                  }}
                >
                  <span className="glyph">{preset.icon}</span>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="stats-bar reveal" data-reveal>
          <div className="stat">
            <span className="stat-num">12,400+</span>
            <span className="stat-label">apps forged this week</span>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat">
            <span className="stat-num">38,200</span>
            <span className="stat-label">builders forging daily</span>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat">
            <span className="stat-num">4.9 / 5</span>
            <span className="stat-label">average build rating</span>
          </div>
        </section>

        <section className="discover-section">
          <div className="discover-header reveal" data-reveal>
            <div>
              <span className="discover-eyebrow">From the forge</span>
              <h2 className="discover-title">Remix what others built</h2>
            </div>
            <a href="#" className="browse-btn">
              Browse the gallery
              <ArrowIcon />
            </a>
          </div>

          <div className="cards-grid">
            {galleryCards.map((card, index) => (
              <a
                key={card.title}
                href="#"
                className={`card ${card.accent === "featured" ? "featured" : ""} reveal ${
                  index < 2 ? "" : ""
                }`}
                data-reveal
              >
                <div className="card-image">
                  <div className="skeleton" aria-hidden="true" />
                  {card.accent === "featured" && (
                    <div className="remix-badge">
                      <RefreshIcon />
                      {card.badge}
                    </div>
                  )}
                  {card.content}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-desc">{card.subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
          {toast ? (
            <>
              <span className="dot" />
              <span>{toast}</span>
            </>
          ) : null}
        </div>

        <footer className="footer">
          <div className="footer-brand">FlashCraft — forged daily</div>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Support</a>
          </div>
          <div>© 2026 FlashCraft. All rights reserved.</div>
        </footer>
      </section>
    </main>
  );
}

function Spinner() {
  return <div className="spinner" />;
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function FlashIcon() {
  return (
    <svg className="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path d="M18 2L8 18H14L10 30L26 12H18L22 2H18Z" fill="url(#flashGrad)" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function SendIcon() {
  return (
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.3125 0.981587C8.66767 1.0545 8.97902 1.20558 9.2627 1.43374C9.48724 1.61438 9.73029 1.85933 9.97949 2.10854L14.707 6.83608L13.293 8.25014L9 3.95717V15.0431H7V3.95717L2.70703 8.25014L1.29297 6.83608L6.02051 2.10854C6.26971 1.85933 6.51277 1.61438 6.7373 1.43374C6.97662 1.24126 7.28445 1.04542 7.6875 0.981587C7.8973 0.94841 8.1031 0.956564 8.3125 0.981587Z" fill="currentColor"></path></svg>  );
}



function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[12px] w-[12px] text-[#3B82F6]">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function PastForwardPreview() {
  return (
    <div className="card-past-forward h-full w-full">
      <div className="cf-title">Past Forward</div>
      <div className="cf-sub">Generate Yourself Through The Decades</div>
      <div className="cf-photos">
        <div className="cf-photo"><PhotoIcon /></div>
        <div className="cf-photo"><PhotoIcon /></div>
        <div className="cf-photo"><PhotoIcon /></div>
      </div>
    </div>
  );
}

function ResearchPreview() {
  return (
    <div className="card-research h-full w-full">
      <div className="cr-orb" />
      <div className="cr-title">AlphaQubit</div>
      <div className="cr-sub">AI for Quantum Error Correction</div>
    </div>
  );
}

function GemBoothPreview() {
  return (
    <div className="card-gembooth h-full w-full">
      <div className="gb-preview">
        <div className="gb-face" />
        <div className="gb-tags">
          <span className="gb-tag">AI BANANA</span>
          <span className="gb-tag">+ 808</span>
        </div>
      </div>
    </div>
  );
}

function VeoPreview() {
  return (
    <div className="card-veo h-full w-full">
      <div className="veo-preview">
        <div className="veo-play">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[13px] w-[13px] ml-0.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] text-[#555]">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <circle cx="12" cy="13" r="3" />
      <path d="M8 6l1.5-2h5L16 6" />
    </svg>
  );
}

function EducationVideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[12px] w-[12px] text-red-500"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
      <path d="M8 10l4 2-4 2v-4z" />
    </svg>
  );
}

function GamersCommunityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[12px] w-[12px] text-indigo-500"
    >
      <path d="M7 7h10l2 8-2 2h-2l-1-2H10l-1 2H7l-2-2 2-8zm2 3v2h2v-2H9zm4 0v2h2v-2h-2z" />
    </svg>
  );
}

function WorkspaceRentalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[12px] w-[12px] text-orange-500"
    >
      <path d="M3 10L12 3l9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 14h6" />
    </svg>
  );
}

function DeliveryRideIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[12px] w-[12px] text-black"
    >
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M5 18H3V6h13v12" />
      <path d="M16 8h4l1 3v7h-2" />
    </svg>
  );
}

function FreelancerNetworkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[12px] w-[12px] text-blue-600"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function PodcastMusicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[12px] w-[12px] text-green-500"
    >
      <path d="M12 2a7 7 0 0 0-7 7v3a4 4 0 0 0 3 3.9V19a4 4 0 0 0 8 0v-3.1A4 4 0 0 0 19 12V9a7 7 0 0 0-7-7zm-2 17a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm4-7a2 2 0 1 1-4 0V9a2 2 0 1 1 4 0v3z" />
    </svg>
  );
}

const presets = [
  { label: "TikTok for education", icon: <EducationVideoIcon /> },
  { label: "Discord for gamers", icon: <GamersCommunityIcon /> },
  { label: "Airbnb for workspaces", icon: <WorkspaceRentalIcon /> },
  { label: "Uber for delivery", icon: <DeliveryRideIcon /> },
  { label: "LinkedIn for freelancers", icon: <FreelancerNetworkIcon /> },
  { label: "Spotify for podcasts", icon: <PodcastMusicIcon /> },
];