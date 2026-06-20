import { WebContainer } from "@webcontainer/api";
import { FileTree } from "@/types";

interface WebContainerInstance {
  container: WebContainer;
  sessionId: string;
  createdAt: Date;
  url?: string;
  port?: number;
}

// In-memory cache of WebContainer instances (will lose on server restart)
const instances = new Map<string, WebContainerInstance>();

// Timeout for cleaning up idle containers (15 minutes)
const CONTAINER_TIMEOUT = 15 * 60 * 1000;

// Maximum concurrent containers
const MAX_CONTAINERS = 10;

export async function getOrCreateWebContainer(
  sessionId: string
): Promise<WebContainerInstance> {
  // Check if already exists
  if (instances.has(sessionId)) {
    const instance = instances.get(sessionId)!;
    return instance;
  }

  // Check if we're at capacity
  if (instances.size >= MAX_CONTAINERS) {
    // Clean up oldest idle instance
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, instance] of instances) {
      if (instance.createdAt.getTime() < oldestTime) {
        oldestTime = instance.createdAt.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await destroyWebContainer(oldestKey);
    }
  }

  // Create new instance
  console.log(`[WebContainer] Creating new instance for session ${sessionId}`);

  const container = await WebContainer.boot();

  const instance: WebContainerInstance = {
    container,
    sessionId,
    createdAt: new Date(),
  };

  instances.set(sessionId, instance);

  // Auto-cleanup after timeout
  setTimeout(() => {
    if (instances.has(sessionId)) {
      console.log(`[WebContainer] Cleaning up expired instance ${sessionId}`);
      destroyWebContainer(sessionId).catch(console.error);
    }
  }, CONTAINER_TIMEOUT);

  return instance;
}

export async function mountFilesAndStartServer(
  sessionId: string,
  files: FileTree[],
  onLog?: (log: string) => void
): Promise<{ url: string; port: number }> {
  const instance = await getOrCreateWebContainer(sessionId);
  const log = (msg: string) => {
    console.log(`[WebContainer] ${msg}`);
    onLog?.(msg);
  };

  try {
    // Mount files to WebContainer
    log("Mounting files...");

    const fileTree: Record<string, any> = {
      "package.json": {
        file: {
          contents: `{
  "name": "flashcraft-app",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.17",
    "vite": "^5.1.0"
  }
}`,
        },
      },
      "vite.config.js": {
        file: {
          contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  }
})`,
        },
      },
      "index.html": {
        file: {
          contents: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FlashCraft App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
        },
      },
      "postcss.config.js": {
        file: {
          contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
        },
      },
      "tailwind.config.js": {
        file: {
          contents: `export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
        },
      },
      src: {
        directory: {
          "main.jsx": {
            file: {
              contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
            },
          },
          "index.css": {
            file: {
              contents: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
            },
          },
        },
      },
    };

    // Mount user files
    for (const file of files) {
      const parts = file.path.split("/");
      let current = fileTree;

      // Navigate/create directory structure
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        if (!current[part].directory) {
          current[part] = { directory: {} };
        }
        current = current[part].directory;
      }

      // Create file
      const fileName = parts[parts.length - 1];
      current[fileName] = {
        file: {
          contents: file.content,
        },
      };
    }

    await instance.container.mount(fileTree);
    log("Files mounted successfully");

    // Install dependencies
    log("Installing dependencies (npm install)...");
    const installProcess = await instance.container.spawn("npm", ["install"]);

    let installOutput = "";
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          installOutput += data;
          log(`[npm] ${data.substring(0, 100)}`); // Log first 100 chars
        },
      })
    );

    const installExitCode = await installProcess.exit;
    if (installExitCode !== 0) {
      throw new Error(`npm install failed with code ${installExitCode}`);
    }

    log("Dependencies installed");

    // Start dev server
    log("Starting dev server (npm run dev)...");
    const devProcess = await instance.container.spawn("npm", ["run", "dev"]);

    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          log(`[vite] ${data.substring(0, 100)}`);
        },
      })
    );

    // Wait for server ready event
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Dev server did not start within 30 seconds"));
      }, 30000);

      instance.container.on("server-ready", (port, url) => {
        clearTimeout(timeout);
        instance.url = url;
        instance.port = port;
        log(`Server ready at ${url}`);
        resolve({ url, port });
      });

      // Handle server errors
      devProcess.exit
        .then((code) => {
          if (code !== 0) {
            clearTimeout(timeout);
            reject(new Error(`Dev server exited with code ${code}`));
          }
        })
        .catch((err) => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
}

export async function destroyWebContainer(sessionId: string): Promise<void> {
  const instance = instances.get(sessionId);
  if (!instance) return;

  try {
    console.log(`[WebContainer] Destroying instance ${sessionId}`);
    // WebContainer doesn't have an explicit destroy method, just remove from cache
    instances.delete(sessionId);
  } catch (error) {
    console.error(`[WebContainer] Error destroying instance:`, error);
  }
}

export function getWebContainerInstance(
  sessionId: string
): WebContainerInstance | undefined {
  return instances.get(sessionId);
}

export function getAllInstances(): WebContainerInstance[] {
  return Array.from(instances.values());
}

export function getInstanceCount(): number {
  return instances.size;
}
