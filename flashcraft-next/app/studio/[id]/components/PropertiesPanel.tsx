"use client";

import { Settings2, Copy, Trash2 } from "lucide-react";

interface PropertiesPanelProps {
  selectedComponent: string | null;
}

export default function PropertiesPanel({
  selectedComponent,
}: PropertiesPanelProps) {
  if (!selectedComponent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4">
        <Settings2 size={32} className="mb-2" />
        <p className="text-xs text-center">Select a component to edit properties</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3 flex items-center gap-2">
        <Settings2 size={16} className="text-slate-400" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Properties</h3>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Dimensions */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">
            Dimensions
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Width"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Height"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="X"
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Y"
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">
            Background
          </label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded border border-slate-600 cursor-pointer" />
            <input
              type="text"
              placeholder="#000000"
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-700 px-4 py-3 flex items-center gap-2">
        <button className="flex-1 p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 text-xs">
          <Copy size={14} /> Duplicate
        </button>
        <button className="flex-1 p-2 hover:bg-red-900/20 rounded transition text-red-400 hover:text-red-300 flex items-center justify-center gap-2 text-xs">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}
