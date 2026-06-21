"use client";

import { Undo2, Redo2, Zap, Smartphone, Tablet, Monitor } from "lucide-react";

interface EditorToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  deviceMode: "desktop" | "tablet" | "mobile";
  onDeviceModeChange: (mode: "desktop" | "tablet" | "mobile") => void;
  onAIToggle: () => void;
}

export default function EditorToolbar({
  zoom,
  onZoomChange,
  deviceMode,
  onDeviceModeChange,
  onAIToggle,
}: EditorToolbarProps) {
  return (
    <div className="border-b border-slate-700 bg-slate-900/30 px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Undo/Redo */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-slate-200"
          title="Undo (Cmd+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-slate-200"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Center: Device Mode & Zoom */}
      <div className="flex items-center gap-4">
        {/* Device Mode */}
        <div className="flex items-center gap-1 border border-slate-700 rounded-lg p-1">
          <button
            onClick={() => onDeviceModeChange("desktop")}
            className={`p-2 rounded transition ${
              deviceMode === "desktop"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-700 text-slate-400"
            }`}
            title="Desktop (1440px)"
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => onDeviceModeChange("tablet")}
            className={`p-2 rounded transition ${
              deviceMode === "tablet"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-700 text-slate-400"
            }`}
            title="Tablet (768px)"
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => onDeviceModeChange("mobile")}
            className={`p-2 rounded transition ${
              deviceMode === "mobile"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-700 text-slate-400"
            }`}
            title="Mobile (375px)"
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onZoomChange(Math.max(25, zoom - 10))}
            className="px-2 py-1 text-sm hover:bg-slate-700 rounded transition text-slate-400"
          >
            −
          </button>
          <input
            type="range"
            min="25"
            max="400"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-32 h-1 bg-slate-700 rounded-lg cursor-pointer"
          />
          <button
            onClick={() => onZoomChange(Math.min(400, zoom + 10))}
            className="px-2 py-1 text-sm hover:bg-slate-700 rounded transition text-slate-400"
          >
            +
          </button>
          <span className="text-xs text-slate-500 w-10 text-right">{zoom}%</span>
        </div>
      </div>

      {/* Right: AI Assistant Toggle */}
      <button
        onClick={onAIToggle}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg transition text-purple-300 text-sm font-medium"
        title="Toggle AI Assistant"
      >
        <Zap size={16} />
        AI Assistant
      </button>
    </div>
  );
}
