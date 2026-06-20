import { useState, useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import { viteTemplate } from './template';

let webcontainerInstance: WebContainer | null = null;

export function useWebContainer() {
  const [isBooted, setIsBooted] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Prevent strict mode double-booting in dev
    if (hasStarted.current) return;
    hasStarted.current = true;

    let isMounted = true;

    async function init() {
      try {
        if (!webcontainerInstance) {
          addLog('Booting WebContainer...');
          webcontainerInstance = await WebContainer.boot();
          addLog('WebContainer booted.');
        }

        if (!isMounted) return;
        setIsBooted(true);

        addLog('Mounting files...');
        await webcontainerInstance.mount(viteTemplate);
        
        webcontainerInstance.on('server-ready', (port, serverUrl) => {
          addLog(`Server ready on port ${port} at ${serverUrl}`);
          setUrl(serverUrl);
        });

        addLog('Installing dependencies (this may take a moment)...');
        const installProcess = await webcontainerInstance.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addLog(`[npm install] ${data}`);
            },
          })
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          addLog(`Installation failed with code ${installExitCode}`);
          return;
        }

        addLog('Starting dev server...');
        const startProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);
        
        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addLog(`[vite] ${data}`);
            },
          })
        );

      } catch (error: any) {
        addLog(`Error initializing WebContainer: ${error.message}`);
        console.error('WebContainer Error:', error);
      }
    }

    init();

    return () => {
      isMounted = false;
      // Note: we don't destroy the instance here so it persists across hot reloads in dev mode
    };
  }, []);

  function addLog(log: string) {
    setLogs((prev) => [...prev, log]);
    console.log(log);
  }

  return { isBooted, url, logs, webcontainerInstance };
}
