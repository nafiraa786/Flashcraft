"use client";

import { useState } from "react";
import { Settings2, Plus, Download, Upload, Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import { useEnvironment, EnvironmentVariable } from "@/hooks/useEnvironment";

interface EnvironmentVariablesProps {
  onVariablesChange?: (variables: Record<string, string>) => void;
}

export default function EnvironmentVariables({
  onVariablesChange,
}: EnvironmentVariablesProps) {
  const env = useEnvironment();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newEncrypted, setNewEncrypted] = useState(false);
  const [newEnvironment, setNewEnvironment] = useState<EnvironmentVariable['environment']>("all");
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [currentEnvironment, setCurrentEnvironment] = useState<'development' | 'staging' | 'production'>('development');

  const handleAddVariable = () => {
    setError(null);
    try {
      env.addVariable(newKey, newValue, {
        encrypted: newEncrypted,
        environment: newEnvironment,
      });
      setNewKey("");
      setNewValue("");
      setNewEncrypted(false);
      setNewEnvironment("all");
      setShowAddForm(false);
      onVariablesChange?.(env.getAllVariables(currentEnvironment));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add variable");
    }
  };

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const handleExport = () => {
    const content = env.exportEnvFile();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          env.importEnvFile(content);
          setError(null);
          onVariablesChange?.(env.getAllVariables(currentEnvironment));
        } catch (err) {
          setError("Failed to import .env file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 size={16} className="text-blue-500" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Environment Variables</h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="p-1.5 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200 cursor-pointer" title="Import .env">
            <Upload size={14} />
            <input type="file" onChange={handleImport} className="hidden" accept=".env" />
          </label>
          <button
            onClick={handleExport}
            className="p-1.5 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200"
            title="Export .env"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200"
            title="Add variable"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Environment Filter */}
      <div className="border-b border-slate-700 px-4 py-2 flex gap-2 flex-shrink-0">
        {(['development', 'staging', 'production'] as const).map((env_name) => (
          <button
            key={env_name}
            onClick={() => setCurrentEnvironment(env_name)}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              currentEnvironment === env_name
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {env_name.charAt(0).toUpperCase() + env_name.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="border-b border-slate-700 p-4 space-y-3 bg-slate-900/50 flex-shrink-0">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Variable Name</label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="DATABASE_URL"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Value</label>
            <input
              type={newEncrypted ? "password" : "text"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter value"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Environment</label>
              <select
                value={newEnvironment}
                onChange={(e) => setNewEnvironment(e.target.value as EnvironmentVariable['environment'])}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={newEncrypted}
                  onChange={(e) => setNewEncrypted(e.target.checked)}
                  className="w-3 h-3"
                />
                Encrypt
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddVariable}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-medium transition"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-xs font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto">
        {env.variables.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            <div className="text-center">
              <Settings2 size={32} className="mx-auto mb-2 opacity-50" />
              <p>No environment variables yet</p>
              <p className="text-xs mt-1">Add your first variable to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {env.variables.map((variable) => (
              <div
                key={variable.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-green-400">{variable.key}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">{variable.environment}</span>
                    {variable.encrypted && (
                      <span className="text-xs px-2 py-0.5 bg-orange-600/30 text-orange-300 rounded">Encrypted</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-400 flex-1 truncate">
                    {showValues.has(variable.id) ? variable.value : "•".repeat(20)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleShowValue(variable.id)}
                      className="p-1 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200"
                    >
                      {showValues.has(variable.id) ? (
                        <EyeOff size={12} />
                      ) : (
                        <Eye size={12} />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(variable.value)}
                      className="p-1 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => env.deleteVariable(variable.id)}
                      className="p-1 hover:bg-red-900/30 rounded transition text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
