"use client";

import { useMemo } from "react";

interface LivePreviewProps {
  code: string;
  zoom: number;
  deviceMode: "desktop" | "tablet" | "mobile";
}

const getDeviceDimensions = (
  mode: "desktop" | "tablet" | "mobile"
) => {
  switch (mode) {
    case "mobile":
      return { width: 375, height: 812 };
    case "tablet":
      return { width: 768, height: 1024 };
    case "desktop":
    default:
      return { width: 1440, height: 900 };
  }
};

export default function LivePreview({
  code,
  zoom,
  deviceMode,
}: LivePreviewProps) {
  const dimensions = getDeviceDimensions(deviceMode);

  const htmlContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          body { margin: 0; overflow: hidden; }
          #root { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const React = window.React;
          const ReactDOM = window.ReactDOM;
          
          ${code}
          
          ReactDOM.createRoot(document.getElementById('root')).render(<App />);
        </script>
      </body>
      </html>
    `;
  }, [code]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Preview Header */}
      <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Preview</span>
        <div className="text-xs text-slate-500">
          {deviceMode === "mobile" && "375 × 812"}
          {deviceMode === "tablet" && "768 × 1024"}
          {deviceMode === "desktop" && "1440 × 900"}
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gradient-to-b from-white to-slate-50">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200"
          style={{
            width: `${dimensions.width * (zoom / 100)}px`,
            height: `${dimensions.height * (zoom / 100)}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-none"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* Error Boundary */}
      <div className="hidden text-xs text-red-600 p-3 bg-red-50 border-t border-red-200"></div>
    </div>
  );
}
