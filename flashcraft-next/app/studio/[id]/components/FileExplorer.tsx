"use client";

import { ChevronRight, File, Folder, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface FileItem {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
}

interface FileExplorerProps {
  files: FileItem[];
  selectedFile: string;
  onSelectFile: (name: string) => void;
}

export default function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Files</h3>
        <button className="p-1 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200">
          <Plus size={14} />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {files.map((item) => (
          <FileTreeItem
            key={item.name}
            item={item}
            selected={selectedFile}
            onSelect={onSelectFile}
            expanded={expandedFolders}
            onToggle={toggleFolder}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}

function FileTreeItem({
  item,
  selected,
  onSelect,
  expanded,
  onToggle,
  level,
}: {
  item: FileItem;
  selected: string;
  onSelect: (name: string) => void;
  expanded: Set<string>;
  onToggle: (name: string) => void;
  level: number;
}) {
  const isExpanded = expanded.has(item.name);
  const isFolder = item.type === "folder";
  const isSelected = selected === item.name;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            onToggle(item.name);
          } else {
            onSelect(item.name);
          }
        }}
        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
          isSelected
            ? "bg-blue-600/30 text-blue-300 border-l-2 border-blue-500"
            : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
        }`}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
      >
        {isFolder && (
          <ChevronRight
            size={14}
            className={`transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        )}
        {!isFolder && <File size={14} className="text-slate-500" />}
        {isFolder && <Folder size={14} className="text-yellow-500" />}
        <span className="truncate">{item.name}</span>
      </button>
      {isFolder && isExpanded && item.children && (
        <>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.name}
              item={child}
              selected={selected}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </>
      )}
    </div>
  );
}
