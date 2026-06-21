"use client";

import { Layers, Eye, EyeOff } from "lucide-react";

interface ComponentInspectorProps {
  selectedComponent: string | null;
  onSelectComponent: (id: string) => void;
}

const COMPONENTS = [
  { id: "header", name: "Header", type: "Component", visible: true },
  { id: "main", name: "Main", type: "Section", visible: true },
  { id: "button", name: "Button", type: "Component", visible: true },
  { id: "input", name: "Input", type: "Component", visible: true },
];

export default function ComponentInspector({
  selectedComponent,
  onSelectComponent,
}: ComponentInspectorProps) {
  return (
    <div className="border-b border-slate-700 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3 flex items-center gap-2">
        <Layers size={16} className="text-slate-400" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Layers</h3>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {COMPONENTS.map((component) => (
          <div
            key={component.id}
            onClick={() => onSelectComponent(component.id)}
            className={`flex items-center justify-between px-4 py-3 border-l-2 transition-colors cursor-pointer ${
              selectedComponent === component.id
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-medium">{component.type}</span>
              <span className="truncate">{component.name}</span>
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-slate-600 rounded transition text-slate-500 hover:text-slate-300"
            >
              {component.visible ? (
                <Eye size={14} />
              ) : (
                <EyeOff size={14} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
