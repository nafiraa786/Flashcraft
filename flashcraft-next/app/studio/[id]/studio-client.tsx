"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "../studio.css";
import { useWebContainer } from "../../../lib/webcontainer/useWebContainer";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
interface Toast {
  id: number;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  time: string;
  thought?: { label: string; duration: string; items: string[] };
  files?: { name: string; type: string; status: string; additions: number; deletions?: number; path: string }[];
  buildStatus?: string;
}

// ═══════════════════════════════════════════
// SVG ICON COMPONENTS
// ═══════════════════════════════════════════
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconGit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}

// Keep other essential icons
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconResize() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCursor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="3 3 10.07 19.97 12.58 11.58 21 10.07 3 3" />
    </svg>
  );
}

function IconMonitor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconTablet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function IconMobile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function IconDeploy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconDots() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function IconAttach() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconTemplate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconThumbsUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconFilePlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function IconFileTsPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  );
}

// ═══════════════════════════════════════════
// TOAST ICON MAP
// ═══════════════════════════════════════════
const toastIcons: Record<string, React.ReactNode> = {
  success: <IconCheck />,
  error: <IconX />,
  warning: <IconWarning />,
  info: <IconInfo />,
};

// ═══════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════
function formatTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

let nextId = 1;

// ═══════════════════════════════════════════
// MAIN WORKSPACE COMPONENT
// ═══════════════════════════════════════════
export default function StudioWorkspaceClient({ initialPrompt }: { initialPrompt: string }) {
  // ─── WEBCONTAINER ───
  const { isBooted, url, logs } = useWebContainer();

  // ─── STATE ───
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [mode, setModeState] = useState<"preview" | "code" | "files">("preview");
  const [activeTree, setActiveTreeState] = useState("Explorer");
  const [activePreviewTab, setActivePreviewTab] = useState("Home");
  const [device, setDeviceState] = useState("desktop");
  const [activeTool, setActiveTool] = useState("Cursor");
  const [visualEdit, setVisualEdit] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!initialPrompt) return [];
    return [
      {
        id: nextId++,
        role: "user",
        content: initialPrompt,
        time: formatTime(),
      },
    ];
  });
  const [isTyping, setIsTyping] = useState(() => !!initialPrompt);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Panel resizing
  const [panelWidth, setPanelWidth] = useState(420);
  const isResizing = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  // ─── TOAST SYSTEM ───
  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ─── INITIAL PROMPT ───
  useEffect(() => {
    if (initialPrompt) {

      const timer = setTimeout(() => {
        setIsTyping(false);
        const aiMsg: Message = {
          id: nextId++,
          role: "ai",
          content: `I'll build this for you. Let me analyze your requirements and generate the necessary components.`,
          time: formatTime(),
          thought: {
            label: "Analyzing requirements",
            duration: "1.2s",
            items: [
              "Identified key sections and features",
              "Selected modern design patterns with glassmorphism",
              "Planning responsive breakpoints: mobile, tablet, desktop",
              "Preparing component structure with React + Tailwind",
            ],
          },
          files: [
            { name: "page.tsx", type: "ts", status: "new", additions: 142, path: "src/app" },
            { name: "components.tsx", type: "ts", status: "new", additions: 89, path: "src/components" },
            { name: "globals.css", type: "css", status: "modified", additions: 45, deletions: 12, path: "src/styles" },
          ],
          buildStatus: "Build successful — 3 files changed, 276 additions",
        };
        setMessages((prev) => [...prev, aiMsg]);
        showToast("Build completed successfully", "success");
      }, 2500);
      return () => clearTimeout(timer);
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // ─── SCROLL CHAT ───
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);



  // ─── PANEL RESIZE ───
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const diff = resizeStartX.current - e.clientX;
      const newW = Math.max(320, Math.min(800, resizeStartW.current + diff));
      setPanelWidth(newW);
    };
    const onUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ─── AUTO RESIZE TEXTAREA ───
  const resizeTextarea = useCallback(() => {
    const el = chatInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [chatInput, resizeTextarea]);

  // ─── FOCUS CMD INPUT ───
  useEffect(() => {
    if (cmdOpen && cmdInputRef.current) {
      cmdInputRef.current.focus();
    }
  }, [cmdOpen]);

  // ─── HANDLERS ───
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      showToast(`Switched to ${next} theme`, "info");
      return next;
    });
  }, [showToast]);

  const handleSend = useCallback(() => {
    const val = chatInput.trim();
    if (!val) return;

    const userMsg: Message = {
      id: nextId++,
      role: "user",
      content: val,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: nextId++,
        role: "ai",
        content: `I've processed your request: "${val}". I'll generate the necessary components and update the preview.`,
        time: formatTime(),
        buildStatus: "Build successful — 1 file changed, 24 additions",
      };
      setMessages((prev) => [...prev, aiMsg]);
      showToast("Response generated", "success");
    }, 2000);
  }, [chatInput, showToast]);

  const startPanelResize = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    resizeStartX.current = e.clientX;
    resizeStartW.current = panelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [panelWidth]);

  // Device sizes
  const deviceSizes: Record<string, string> = {
    desktop: "1280×720",
    tablet: "768×1024",
    mobile: "375×667",
  };

  // Command palette items
  const commands = [
    { action: "deploy", name: "Deploy Project", desc: "Build and deploy to production", shortcut: "⌘⇧D", section: "Actions" },
    { action: "preview", name: "Toggle Preview", desc: "Switch between preview and code", shortcut: "⌘⇧P", section: "Actions" },
    { action: "chat", name: "New Chat", desc: "Start a new conversation", shortcut: "⌘⇧N", section: "Actions" },
    { action: "theme", name: "Toggle Theme", desc: "Switch between light and dark", shortcut: "⌘⇧T", section: "Settings" },
    { action: "settings", name: "Open Settings", desc: "Configure workspace preferences", shortcut: "⌘,", section: "Settings" },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      cmd.desc.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const handleCommand = useCallback(
    (action: string) => {
      setCmdOpen(false);
      setCmdQuery("");
      switch (action) {
        case "deploy":
          showToast("Deploying project...", "info");
          setTimeout(() => showToast("Deployment successful!", "success"), 3000);
          break;
        case "preview":
          setModeState("preview");
          showToast("Switched to preview mode", "info");
          break;
        case "chat":
          showToast("New chat started", "success");
          break;
        case "theme":
          toggleTheme();
          break;
        case "settings":
          showToast("Settings opened", "info");
          break;
      }
    },
    [showToast, toggleTheme]
  );

  // ─── KEYBOARD SHORTCUTS ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "Escape" && cmdOpen) {
        setCmdOpen(false);
        setCmdQuery("");
      }
      if (isMeta && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
      if (isMeta && e.shiftKey && e.key === "T") {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmdOpen, chatInput]);

  // Derive project name from prompt
  const projectName = initialPrompt
    ? initialPrompt.length > 30
      ? initialPrompt.substring(0, 30) + "…"
      : initialPrompt
    : "New Project";

  return (
    <div className="studio-root" data-studio-theme={theme}>
      {/* ═══ TOAST CONTAINER ═══ */}
      <div className="s-toast-container" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`s-toast s-toast-${t.type}`}
            role="alert"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          >
            <div className="s-toast-icon">{toastIcons[t.type]}</div>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ═══ COMMAND PALETTE ═══ */}
      <div
        className={`s-cmd-palette-overlay ${cmdOpen ? "s-active" : ""}`}
        role="dialog"
        aria-label="Command palette"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setCmdOpen(false);
            setCmdQuery("");
          }
        }}
      >
        <div className="s-cmd-palette">
          <div className="s-cmd-input-wrapper">
            <IconSearch />
            <input
              ref={cmdInputRef}
              type="text"
              className="s-cmd-input"
              placeholder="Search commands..."
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            <span className="s-cmd-kbd">ESC</span>
          </div>
          {["Actions", "Settings"].map((section) => {
            const items = filteredCommands.filter((c) => c.section === section);
            if (items.length === 0) return null;
            return (
              <div className="s-cmd-section" key={section}>
                <div className="s-cmd-section-label">{section}</div>
                {items.map((cmd) => (
                  <div
                    key={cmd.action}
                    className="s-cmd-item"
                    onClick={() => handleCommand(cmd.action)}
                  >
                    <div className="s-cmd-item-icon">
                      {cmd.action === "deploy" && <IconDeploy />}
                      {cmd.action === "preview" && <IconPlay />}
                      {cmd.action === "chat" && <IconChat />}
                      {cmd.action === "theme" && <IconSun />}
                      {cmd.action === "settings" && <IconSettings />}
                    </div>
                    <div className="s-cmd-item-info">
                      <div className="s-cmd-item-name">{cmd.name}</div>
                      <div className="s-cmd-item-desc">{cmd.desc}</div>
                    </div>
                    <span className="s-cmd-item-shortcut">{cmd.shortcut}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ TOP BAR ═══ */}
      <header className="s-topbar" role="banner">
        <div className="s-win-dots" role="group" aria-label="Window controls">
          <div className="s-win-dot s-red" role="button" tabIndex={0} aria-label="Close window" onClick={() => showToast("Close window", "info")} />
          <div className="s-win-dot s-yellow" role="button" tabIndex={0} aria-label="Minimize window" onClick={() => showToast("Minimize window", "info")} />
          <div className="s-win-dot s-green" role="button" tabIndex={0} aria-label="Maximize window" onClick={() => showToast("Maximize window", "info")} />
        </div>

        <div className="s-topbar-divider" aria-hidden="true" />

        <button className="s-project-select" aria-label="Select project">
          <IconDashboard />
          <span className="s-project-name">{projectName}</span>
          <IconChevronDown />
        </button>

        <nav className="s-mode-toggle" role="tablist" aria-label="View mode">
          {(["preview", "code", "files"] as const).map((m) => (
            <button
              key={m}
              className={`s-mode-btn ${mode === m ? "s-active" : ""}`}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setModeState(m);
                showToast(`Switched to ${m} mode`, "info");
              }}
            >
              {m === "preview" && <IconPlay />}
              {m === "code" && <IconCode />}
              {m === "files" && <IconFile />}
              {m.charAt(0).toUpperCase() + m.slice(1)}
              <span className="s-mode-indicator" aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div className="s-topbar-spacer" aria-hidden="true" />

        <div className="s-topbar-right" role="group" aria-label="Toolbar actions">
          <span className="s-pro-chip" role="button" tabIndex={0} onClick={() => showToast("Pro features unlocked", "success")}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            PRO
          </span>
          <button className="s-tb-btn" onClick={() => showToast("Opening documentation...", "info")}>
            <IconInfo />
            <span>Docs</span>
          </button>
          <button className="s-tb-btn" onClick={() => showToast("Integrations panel opened", "info")}>
            <IconDashboard />
            <span>Integrations</span>
          </button>
          <button
            className="s-tb-btn s-tb-btn-deploy"
            onClick={() => {
              showToast("Deploying project...", "info");
              setTimeout(() => showToast("Deployment successful! Live at https://your-app.vercel.app", "success"), 3000);
            }}
          >
            <IconDeploy />
            <span>Deploy</span>
          </button>
          <div className="s-avatar" role="button" tabIndex={0} aria-label="User account" onClick={() => showToast("Account settings", "info")}>
            US
            <span className="s-avatar-status" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* ═══ ADDRESS BAR ═══ */}
      <nav className="s-addrbar" role="navigation" aria-label="Browser navigation">
        <button className="s-nav-btn" aria-label="Go back" onClick={() => showToast("Navigated back", "info")}>
          <IconArrowLeft />
          <span className="s-nav-tooltip">Back</span>
        </button>
        <button className="s-nav-btn" aria-label="Go forward" disabled>
          <IconArrowRight />
          <span className="s-nav-tooltip">Forward</span>
        </button>
        <button className="s-nav-btn" aria-label="Reload page" onClick={() => showToast("Page reloaded", "success")}>
          <IconRefresh />
          <span className="s-nav-tooltip">Reload</span>
        </button>

        <div className="s-url-pill" role="textbox" aria-label="Address bar" tabIndex={0}>
          <div className="s-secure-dot" aria-hidden="true" />
          <span className="s-url-text">localhost</span>
          <span className="s-url-sep">:</span>
          <span className="s-port">3000</span>
        </div>

        <div className="s-addr-spacer" aria-hidden="true" />

        <button
          className={`s-addr-action ${visualEdit ? "s-active" : ""}`}
          aria-label="Visual edit mode"
          aria-pressed={visualEdit}
          onClick={() => {
            setVisualEdit(!visualEdit);
            showToast(visualEdit ? "Visual edit disabled" : "Visual edit enabled", "info");
          }}
        >
          <IconResize />
          <span>Visual Edit</span>
        </button>
        <button className="s-nav-btn" style={{ border: "1px solid var(--s-border)" }} aria-label="Copy URL" onClick={() => {
          navigator.clipboard?.writeText("http://localhost:3000");
          showToast("URL copied to clipboard", "success");
        }}>
          <IconCopy />
          <span className="s-nav-tooltip">Copy URL</span>
        </button>
        <button className="s-nav-btn" style={{ border: "1px solid var(--s-border)" }} aria-label="Open in browser" onClick={() => showToast("Opened in new tab", "success")}>
          <IconExternal />
          <span className="s-nav-tooltip">Open in browser</span>
        </button>
      </nav>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="s-layout">
        {/* ─── FILE TREE ─── */}
        <aside className="s-file-tree" role="complementary" aria-label="File explorer">
          {[
            { icon: <IconFolder />, label: "Explorer", active: true },
            { icon: <IconSearch />, label: "Search" },
            { icon: <IconGit />, label: "Git", badge: 3 },
          ].map((item) => (
            <div
              key={item.label}
              className={`s-tree-icon ${activeTree === item.label ? "s-active" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              onClick={() => {
                setActiveTreeState(item.label);
                showToast(`${item.label} panel opened`, "info");
              }}
            >
              {item.icon}
              {item.badge && <span className="s-tree-badge">{item.badge}</span>}
              <span className="s-tree-tooltip">{item.label}</span>
            </div>
          ))}

          <div className="s-tree-divider" aria-hidden="true" />

          {[
            { icon: <IconShield />, label: "Debug" },
            { icon: <IconGrid />, label: "Extensions" },
          ].map((item) => (
            <div
              key={item.label}
              className={`s-tree-icon ${activeTree === item.label ? "s-active" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              onClick={() => {
                setActiveTreeState(item.label);
                showToast(`${item.label} panel opened`, "info");
              }}
            >
              {item.icon}
              <span className="s-tree-tooltip">{item.label}</span>
            </div>
          ))}

          <div style={{ flex: 1 }} aria-hidden="true" />
          <div className="s-tree-divider" aria-hidden="true" />

          <div
            className={`s-tree-icon ${activeTree === "Settings" ? "s-active" : ""}`}
            role="button"
            tabIndex={0}
            aria-label="Settings"
            onClick={() => {
              setActiveTreeState("Settings");
              showToast("Settings panel opened", "info");
            }}
          >
            <IconSettings />
            <span className="s-tree-tooltip">Settings</span>
          </div>
        </aside>

        {/* ─── PREVIEW PANE ─── */}
        <main className="s-preview" role="main" aria-label="Preview">
          <div className="s-preview-glow" aria-hidden="true" />

          <div className="s-preview-tabs" role="tablist" aria-label="Preview tabs">
            {["Home", "About"].map((tab) => (
              <button
                key={tab}
                className={`s-preview-tab ${activePreviewTab === tab ? "s-active" : ""}`}
                role="tab"
                aria-selected={activePreviewTab === tab}
                onClick={() => setActivePreviewTab(tab)}
              >
                {tab === "Home" ? <IconHome /> : <IconInfo />}
                {tab}
                <span className="s-tab-close" role="button" aria-label="Close tab" onClick={(e) => { e.stopPropagation(); showToast("Tab closed", "info"); }}>
                  <IconClose />
                </span>
              </button>
            ))}
          </div>

          <div className="s-preview-content" id="preview-content">
            {!isBooted && (
               <div className="s-preview-empty" id="preview-empty">
                 <div className="s-preview-empty-icon" aria-hidden="true"><IconMonitor /></div>
                 <h3>Booting Environment...</h3>
                 <p>Initializing WebContainer and installing dependencies.</p>
                 <div className="s-preview-logs" style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888', maxHeight: '100px', overflow: 'hidden', textAlign: 'left' }}>
                    {logs.slice(-3).map((log, i) => <div key={i}>{log}</div>)}
                 </div>
               </div>
            )}
            {isBooted && !url && (
               <div className="s-preview-empty" id="preview-empty">
                 <div className="s-preview-empty-icon" aria-hidden="true"><IconMonitor /></div>
                 <h3>Starting Server...</h3>
                 <p>Running development server, please wait.</p>
                 <div className="s-preview-logs" style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888', maxHeight: '100px', overflow: 'hidden', textAlign: 'left' }}>
                    {logs.slice(-3).map((log, i) => <div key={i}>{log}</div>)}
                 </div>
               </div>
            )}
            {isBooted && url && (
               <iframe
                 src={url}
                 className="s-preview-iframe"
                 title="Preview"
                 style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                 allow="cross-origin-isolated"
               />
            )}
          </div>

          <div className="s-device-indicator" aria-hidden="true">
            <span>{device.charAt(0).toUpperCase() + device.slice(1)}</span>
            <span>·</span>
            <span>{deviceSizes[device]}</span>
          </div>

          <div className="s-float-toolbar" role="toolbar" aria-label="Preview tools">
            {[
              { icon: <IconCursor />, label: "Cursor", tool: true },
              { icon: <IconChat />, label: "Comment", tool: true },
            ].map((item) => (
              <button
                key={item.label}
                className={`s-float-btn ${activeTool === item.label ? "s-active" : ""}`}
                aria-label={`${item.label} tool`}
                onClick={() => setActiveTool(item.label)}
              >
                {item.icon}
                <span className="s-float-tooltip">{item.label}</span>
              </button>
            ))}

            <div className="s-float-sep" aria-hidden="true" />

            {[
              { icon: <IconMonitor />, label: "Desktop", dev: "desktop" },
              { icon: <IconTablet />, label: "Tablet", dev: "tablet" },
              { icon: <IconMobile />, label: "Mobile", dev: "mobile" },
            ].map((item) => (
              <button
                key={item.label}
                className={`s-float-btn ${device === item.dev ? "s-active" : ""}`}
                aria-label={`${item.label} view`}
                onClick={() => {
                  setDeviceState(item.dev);
                  showToast(`Switched to ${item.label} view`, "info");
                }}
              >
                {item.icon}
                <span className="s-float-tooltip">{item.label}</span>
              </button>
            ))}

            <div className="s-float-sep" aria-hidden="true" />

            <button className="s-float-btn" aria-label="Preview settings" onClick={() => showToast("Preview settings", "info")}>
              <IconSettings />
              <span className="s-float-tooltip">Settings</span>
            </button>
          </div>
        </main>

        {/* ─── RIGHT PANEL ─── */}
        <aside
          ref={panelRef}
          className="s-panel"
          role="complementary"
          aria-label="Chat panel"
          style={{ width: panelWidth }}
        >
          <div
            className="s-panel-resize-handle"
            aria-hidden="true"
            onMouseDown={startPanelResize}
          />

          {/* Panel header */}
          <header className="s-panel-head">
            <div className="s-panel-head-left">
              <button className="s-panel-title-btn" aria-label={`Current project: ${projectName}`}>
                <span className="s-project-name">{projectName}</span>
                <IconChevronDown />
              </button>
              <button className="s-add-tab-btn" aria-label="New chat" onClick={() => showToast("New chat started", "success")}>+</button>
            </div>
            <div className="s-panel-head-right">
              <button className="s-panel-head-btn" aria-label="Chat history" onClick={() => showToast("Chat history", "info")}>
                <IconClock />
              </button>
              <button className="s-panel-head-btn" aria-label="More options" onClick={() => showToast("More options", "info")}>
                <IconDots />
              </button>
            </div>
          </header>

          {/* Panel tabs */}
          <div className="s-panel-tabs" role="tablist" aria-label="Chat sessions">
            <button className="s-panel-tab s-active" role="tab" aria-selected="true">
              <span className="s-tab-status" aria-hidden="true" />
              Main
            </button>
          </div>

          {/* Chat scroll area */}
          <div ref={chatScrollRef} className="s-chat-scroll" role="log" aria-label="Chat messages" aria-live="polite">
            {/* Date separator */}
            <div className="s-date-separator" aria-hidden="true">
              <div className="s-date-separator-line" />
              <span className="s-date-separator-label">Today</span>
              <div className="s-date-separator-line" />
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <div className="s-message-group s-user-message" role="article" aria-label="Your message">
                    <div className="s-user-bubble">{msg.content}</div>
                    <div className="s-user-meta">
                      <span className="s-user-name">You</span>
                      <span>·</span>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                ) : (
                  <div className="s-message-group s-ai-message" role="article" aria-label="AI response">
                    <div className="s-ai-label">
                      <div className="s-ai-avatar" aria-hidden="true">
                        <IconStar />
                      </div>
                      <span className="s-ai-name">FlashCraft</span>
                      <span className="s-ai-model">gemini-2.5</span>
                      <span className="s-ai-time">{msg.time}</span>
                    </div>

                    {/* Thought block */}
                    {msg.thought && (
                      <ThoughtBlock thought={msg.thought} />
                    )}

                    {/* Chat bubble */}
                    <div className="s-chat-bubble">{msg.content}</div>

                    {/* File cards */}
                    {msg.files?.map((file) => (
                      <div
                        key={file.name}
                        className="s-file-card"
                        role="button"
                        tabIndex={0}
                        aria-label={`View file: ${file.name}`}
                        onClick={() => showToast(`Opening ${file.name}`, "info")}
                      >
                        <div className={`s-file-card-icon ${file.type === "ts" ? "s-ts" : "s-css"}`} aria-hidden="true">
                          {file.type === "ts" ? <IconFileTsPlus /> : <IconFilePlus />}
                        </div>
                        <div className="s-file-card-info">
                          <div className="s-file-card-name">{file.name}</div>
                          <div className="s-file-card-meta">
                            <span className={`s-file-status ${file.status === "new" ? "s-new" : "s-modified"}`}>{file.status}</span>
                            {file.path}
                          </div>
                        </div>
                        <span className="s-file-diff-badge">+{file.additions}</span>
                        {file.deletions && <span className="s-file-diff-badge s-negative">-{file.deletions}</span>}
                        <svg className="s-file-card-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </div>
                    ))}

                    {/* Build status */}
                    {msg.buildStatus && (
                      <div className="s-status-row" role="status">
                        <div className="s-status-dot" aria-hidden="true" />
                        <span className="s-status-text">
                          {msg.buildStatus.split(" — ")[0]}{" "}
                          <span className="s-status-detail">— {msg.buildStatus.split(" — ")[1]}</span>
                        </span>
                      </div>
                    )}

                    {/* Message actions */}
                    <div className="s-message-actions" role="group" aria-label="Message actions">
                      <button className="s-msg-action-btn" onClick={() => showToast("Message copied", "success")}>
                        <IconCopy /> Copy
                      </button>
                      <button className="s-msg-action-btn" onClick={() => showToast("Regenerating...", "info")}>
                        <IconRefresh /> Regenerate
                      </button>
                      <button className="s-msg-action-btn" onClick={() => showToast("Feedback sent", "success")}>
                        <IconThumbsUp /> Like
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="s-typing-indicator" role="status" aria-label="AI is typing">
                <div className="s-typing-dots" aria-hidden="true">
                  <div className="s-typing-dot" />
                  <div className="s-typing-dot" />
                  <div className="s-typing-dot" />
                </div>
                <span className="s-typing-text">FlashCraft is thinking...</span>
              </div>
            )}
          </div>

          {/* Input zone */}
          <div className="s-input-zone" role="form" aria-label="Message input">
            {/* Context chips */}
            {messages.some((m) => m.files) && (
              <div className="s-context-chips" role="group" aria-label="Context attachments">
                {messages
                  .filter((m) => m.files)
                  .flatMap((m) => m.files || [])
                  .slice(-3)
                  .map((file) => (
                    <button key={file.name} className="s-ctx-chip s-active" role="button">
                      <IconFilePlus />
                      {file.name}
                    </button>
                  ))}
              </div>
            )}

            {/* Input box */}
            <div className="s-input-box">
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Tell FlashCraft what to build..."
                rows={1}
                autoComplete="off"
                spellCheck="false"
                aria-label="Message input"
              />
              <div className="s-input-actions">
                <div className="s-input-actions-left">
                  <button className="s-ia-btn" aria-label="Attach file" onClick={() => showToast("File picker opened", "info")}>
                    <IconAttach />
                    <span className="s-ia-tooltip">Attach file</span>
                  </button>
                  <button className="s-ia-btn" aria-label="Screenshot" onClick={() => showToast("Screenshot captured", "success")}>
                    <IconImage />
                    <span className="s-ia-tooltip">Screenshot</span>
                  </button>
                  <div className="s-input-divider" aria-hidden="true" />
                  <button className="s-model-pill" aria-label="Switch AI model">
                    <span className="s-model-indicator" aria-hidden="true" />
                    gemini-2.5
                    <IconChevronDown />
                  </button>
                </div>
                <div className="s-input-actions-right">
                  <button className="s-ia-btn" aria-label="Insert template" onClick={() => showToast("Template gallery opened", "info")}>
                    <IconTemplate />
                    <span className="s-ia-tooltip">Template</span>
                  </button>
                  <button
                    className="s-send-btn"
                    aria-label="Send message"
                    disabled={!chatInput.trim()}
                    onClick={handleSend}
                  >
                    <IconSend />
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="s-kb-hint" id="input-hint">
              <kbd>⌘</kbd>
              <span className="s-hint-sep">+</span>
              <kbd>↵</kbd>
              <span className="s-hint-action">to send</span>
              <span className="s-hint-sep">·</span>
              <kbd>⌘</kbd>
              <span className="s-hint-sep">+</span>
              <kbd>K</kbd>
              <span className="s-hint-action">for commands</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// THOUGHT BLOCK COMPONENT
// ═══════════════════════════════════════════
function ThoughtBlock({ thought }: { thought: { label: string; duration: string; items: string[] } }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`s-thought ${open ? "s-open" : ""}`}
      role="region"
      aria-label="Thinking process"
      onClick={() => setOpen(!open)}
    >
      <div className="s-thought-head" role="button" tabIndex={0} aria-expanded={open}>
        <div className="s-thought-pulse" aria-hidden="true" />
        <span className="s-thought-label">{thought.label}</span>
        <span className="s-thought-duration">{thought.duration}</span>
        <svg className="s-thought-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <div className="s-thought-body" aria-hidden={!open}>
        <ul>
          {thought.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
