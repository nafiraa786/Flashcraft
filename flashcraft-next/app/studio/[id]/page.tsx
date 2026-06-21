"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import EditorHeader from "./components/EditorHeader";
import EditorToolbar from "./components/EditorToolbar";
import CodeEditor from "./components/CodeEditor";
import LivePreview from "./components/LivePreview";
import FileExplorer from "./components/FileExplorer";
import PropertiesPanel from "./components/PropertiesPanel";
import ComponentInspector from "./components/ComponentInspector";
import AIAssistant from "./components/AIAssistant";
import Terminal from "./components/Terminal";
import EnvironmentVariables from "./components/EnvironmentVariables";
import { useWebContainer } from "@/hooks/useWebContainer";

export default function StudioPage() {
  const params = useParams();
  const studioId = params.id as string;
  const { container, isLoading } = useWebContainer();
  const [code, setCode] = useState(`import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header className="border-b border-slate-700 px-8 py-4">
        <h1 className="text-3xl font-bold">Welcome to FlashCraft</h1>
        <p className="text-slate-400 mt-2">Edit this code to see live changes</p>
      </header>
      
      <main className="p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
            <p className="text-slate-300">Start building your app by editing the code on the left.</p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Use React components</li>
              <li>Style with Tailwind CSS</li>
              <li>See live updates instantly</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}`);
  const [selectedFile, setSelectedFile] = useState("App.tsx");
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<'terminal' | 'env'>('terminal');
  const [files, setFiles] = useState([
    { name: "App.tsx", type: "file", content: code },
    { name: "components", type: "folder", children: [] },
    { name: "styles", type: "folder", children: [] },
  ]);
  const [isDirty, setIsDirty] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsDirty(false);
    // TODO: Save to backend
  }, []);

  // Handle divider drag
  useEffect(() => {
    const handleMouseDown = () => {
      isDraggingRef.current = true;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const container = dividerRef.current?.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      if (newHeight > 100 && newHeight < 600) {
        setBottomPanelHeight(newHeight);
      }
    };

    dividerRef.current?.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      dividerRef.current?.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="h-screen bg-[#0a0e1a] text-slate-50 flex flex-col">
      {/* Header */}
      <EditorHeader 
        studioId={studioId} 
        isDirty={isDirty} 
        onSave={handleSave}
      />

      {/* Toolbar */}
      <EditorToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        onAIToggle={() => setShowAI(!showAI)}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-64 border-r border-slate-700 flex flex-col bg-slate-950/50">
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        </div>

        {/* Center & Right - Code/Preview/Inspector with Bottom Terminal */}
        <div className="flex-1 flex flex-col">
          {/* Top Section - Code Editor & Preview */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col border-r border-slate-700">
              <CodeEditor
                code={code}
                onChange={handleCodeChange}
                language="typescript"
                fileName={selectedFile}
              />
            </div>

            {/* Live Preview */}
            <div className="flex-1 flex flex-col bg-white">
              <LivePreview
                code={code}
                zoom={zoom}
                deviceMode={deviceMode}
              />
            </div>
          </div>

          {/* Divider */}
          <div
            ref={dividerRef}
            className="h-1 bg-slate-700 hover:bg-blue-500 cursor-row-resize transition-colors flex-shrink-0"
            style={{ userSelect: isDraggingRef.current ? "none" : "auto" }}
          />

          {/* Bottom Panel - Terminal or Environment Variables */}
          <div
            style={{ height: `${bottomPanelHeight}px` }}
            className="flex flex-col border-t border-slate-700 overflow-hidden"
          >
            {/* Tab Selector */}
            <div className="flex border-b border-slate-700 bg-slate-900/50">
              <button
                onClick={() => setBottomPanelTab('terminal')}
                className={`flex-1 px-4 py-2 text-xs font-medium transition border-b-2 ${
                  bottomPanelTab === 'terminal'
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Terminal
              </button>
              <button
                onClick={() => setBottomPanelTab('env')}
                className={`flex-1 px-4 py-2 text-xs font-medium transition border-b-2 ${
                  bottomPanelTab === 'env'
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Environment
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {bottomPanelTab === 'terminal' ? (
                <Terminal
                  container={container}
                  isLoading={isLoading}
                  env={envVariables}
                />
              ) : (
                <EnvironmentVariables
                  onVariablesChange={setEnvVariables}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Inspector & AI */}
        <div className="w-80 border-l border-slate-700 flex flex-col bg-slate-950/50 overflow-hidden">
          {showAI ? (
            <AIAssistant studioId={studioId} />
          ) : (
            <>
              <ComponentInspector
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
              />
              <PropertiesPanel
                selectedComponent={selectedComponent}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
