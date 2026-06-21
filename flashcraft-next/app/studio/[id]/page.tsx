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

export default function StudioPage() {
  const params = useParams();
  const studioId = params.id as string;
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
  const [files, setFiles] = useState([
    { name: "App.tsx", type: "file", content: code },
    { name: "components", type: "folder", children: [] },
    { name: "styles", type: "folder", children: [] },
  ]);
  const [isDirty, setIsDirty] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsDirty(false);
    // TODO: Save to backend
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

        {/* Center - Code Editor & Preview */}
        <div className="flex-1 flex">
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
