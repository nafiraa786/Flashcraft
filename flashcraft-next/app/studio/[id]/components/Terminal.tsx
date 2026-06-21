"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Trash2, Copy, ChevronDown } from "lucide-react";
import { useTerminal, TerminalOutput } from "@/hooks/useTerminal";
import { WebContainer } from "@webcontainer/api";

interface TerminalProps {
  container: WebContainer | null;
  isLoading: boolean;
  env?: Record<string, string>;
}

const COMMON_COMMANDS = [
  "npm install",
  "npm run dev",
  "npm run build",
  "npm test",
  "git status",
  "git add .",
  "git commit -m",
  "ls -la",
  "pwd",
];

export default function Terminal({
  container,
  isLoading,
  env = {},
}: TerminalProps) {
  const { outputs, isExecuting, executeCommand, clearTerminal, getPreviousCommand, getNextCommand } = useTerminal(container);
  const [input, setInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputs]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      const filtered = COMMON_COMMANDS.filter((cmd) =>
        cmd.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isExecuting && container) {
      executeCommand(input, env);
      setInput("");
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setInput(getPreviousCommand());
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setInput(getNextCommand());
    } else if (e.key === "Tab" && filteredSuggestions.length > 0) {
      e.preventDefault();
      setInput(filteredSuggestions[0]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const copyOutput = () => {
    const text = outputs.map((o) => o.content).join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-green-500" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Terminal</h3>
          {isLoading && <span className="text-xs text-slate-500 ml-2">Initializing...</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyOutput}
            className="p-1.5 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200"
            title="Copy output"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => clearTerminal()}
            className="p-1.5 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200"
            title="Clear terminal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {isLoading ? (
          <div className="text-slate-500">Initializing development environment...</div>
        ) : (
          outputs.map((output, index) => (
            <div
              key={index}
              className={`${
                output.type === "stdout"
                  ? "text-slate-300"
                  : output.type === "stderr"
                  ? "text-red-400"
                  : output.type === "command"
                  ? "text-green-400"
                  : output.type === "error"
                  ? "text-red-500 font-semibold"
                  : "text-slate-500"
              }`}
            >
              {output.content}
            </div>
          ))
        )}
        <div ref={outputEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-900/50 p-4 space-y-2">
        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden max-h-32 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="text-green-500 font-mono text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command (e.g., npm install)..."
            disabled={isExecuting || isLoading || !container}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none font-mono text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={isExecuting || isLoading || !container || !input.trim()}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs font-medium transition disabled:opacity-50"
          >
            {isExecuting ? "Running..." : "Run"}
          </button>
        </form>
      </div>
    </div>
  );
}
