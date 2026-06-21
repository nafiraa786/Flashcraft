"use client";

import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  fileName: string;
}

export default function CodeEditor({
  code,
  onChange,
  language,
  fileName,
}: CodeEditorProps) {
  const editorRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        // Trigger save
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-slate-700 px-4 py-3 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium text-slate-300">{fileName}</span>
        </div>
      </div>
      <Editor
        ref={editorRef}
        language={language}
        value={code}
        onChange={(value) => onChange(value || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 24,
          fontFamily: 'JetBrains Mono, monospace',
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          renderLineHighlight: "gutter",
        }}
      />
    </div>
  );
}
