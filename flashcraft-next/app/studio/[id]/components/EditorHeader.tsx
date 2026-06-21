"use client";

import { useState } from "react";
import { ChevronDown, Share2, Download, MoreHorizontal } from "lucide-react";

interface EditorHeaderProps {
  studioId: string;
  isDirty: boolean;
  onSave: () => void;
}

export default function EditorHeader({
  studioId,
  isDirty,
  onSave,
}: EditorHeaderProps) {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Project Name & Breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                className="bg-slate-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-lg font-semibold hover:text-blue-400 transition"
              >
                {projectName}
              </button>
            )}
            {isDirty && (
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" />
            )}
          </div>
          <span className="text-slate-500 text-sm">/ {studioId.slice(0, 8)}...</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
            disabled={!isDirty}
          >
            {isDirty ? "Save*" : "Saved"}
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition" title="Share">
            <Share2 size={18} />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition" title="Export">
            <Download size={18} />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition" title="More options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
