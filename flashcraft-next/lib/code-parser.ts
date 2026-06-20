import { FileTree } from "@/types";

export function parseCodeOutput(output: string): FileTree[] {
  try {
    // Extract JSON from markdown code block if present
    let jsonStr = output;

    const jsonMatch = output.match(/```json\n?([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Parse JSON
    const parsed = JSON.parse(jsonStr);

    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error("Invalid output: missing or invalid 'files' array");
    }

    // Validate and transform files
    const files: FileTree[] = parsed.files.map((file: any) => {
      if (!file.path || typeof file.path !== "string") {
        throw new Error("Invalid file: missing or invalid 'path'");
      }

      if (!file.content || typeof file.content !== "string") {
        throw new Error(`Invalid file ${file.path}: missing or invalid 'content'`);
      }

      // Determine file type from extension
      const ext = file.path.split(".").pop()?.toLowerCase() || "";
      let type: FileTree["type"] = "text";

      if (ext === "ts" || ext === "tsx") {
        type = file.path.includes("tsx") ? "jsx" : "typescript";
      } else if (ext === "jsx") {
        type = "jsx";
      } else if (ext === "css") {
        type = "css";
      } else if (ext === "json") {
        type = "json";
      } else if (ext === "html") {
        type = "html";
      } else if (ext === "md") {
        type = "markdown";
      }

      return {
        path: file.path,
        content: file.content,
        type,
      };
    });

    // Validate essential files exist
    const hasAppFile = files.some((f) =>
      f.path.match(/^src\/(App|main|index)\.(tsx?|jsx)$/)
    );

    if (!hasAppFile) {
      throw new Error("Generated code must include src/App.tsx or src/main.tsx");
    }

    return files;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Claude output as JSON: ${error.message}`);
    }
    throw error;
  }
}

export function validateFiles(files: FileTree[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push("No files provided");
    return { valid: false, errors };
  }

  // Check for valid file paths
  const validPaths = new Set<string>();
  for (const file of files) {
    if (!file.path.startsWith("src/") && !file.path === "package.json") {
      errors.push(`Invalid file path: ${file.path} (must be in src/ or be package.json)`);
    }
    if (validPaths.has(file.path)) {
      errors.push(`Duplicate file path: ${file.path}`);
    }
    validPaths.add(file.path);
  }

  // Check for syntax errors in TypeScript files (basic check)
  for (const file of files) {
    if (file.type === "typescript" || file.type === "jsx") {
      // Basic sanity checks
      if (!file.content.trim()) {
        errors.push(`Empty content in ${file.path}`);
      }

      // Check for common issues
      if (file.path.includes(".tsx") && !file.content.includes("export")) {
        errors.push(`${file.path} doesn't export anything (should export React component)`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Helper to generate a default template if Claude fails
export function getDefaultTemplate(): FileTree[] {
  return [
    {
      path: "src/App.tsx",
      content: `import React from 'react';

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">FlashCraft</h1>
        <p className="text-slate-300">Your app is ready to build!</p>
      </div>
    </div>
  );
}`,
      type: "jsx",
    },
    {
      path: "src/index.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
      type: "css",
    },
  ];
}
