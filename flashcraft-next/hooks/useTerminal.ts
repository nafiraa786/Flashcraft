import { useState, useCallback, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

export interface TerminalOutput {
  type: 'stdout' | 'stderr' | 'command' | 'info' | 'error';
  content: string;
  timestamp: Date;
}

export function useTerminal(container: WebContainer | null) {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([
    {
      type: 'info',
      content: 'Terminal ready. Type "help" for available commands.',
      timestamp: new Date(),
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const historyIndexRef = useRef(-1);

  const addOutput = useCallback((output: TerminalOutput) => {
    setOutputs((prev) => [...prev, output]);
  }, []);

  const clearTerminal = useCallback(() => {
    setOutputs([
      {
        type: 'info',
        content: 'Terminal cleared',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const executeCommand = useCallback(
    async (
      command: string,
      env: Record<string, string> = {}
    ) => {
      if (!container || !command.trim()) return;

      setIsExecuting(true);
      addOutput({
        type: 'command',
        content: `$ ${command}`,
        timestamp: new Date(),
      });

      setCommandHistory((prev) => [...prev, command]);
      historyIndexRef.current = -1;

      try {
        const [cmd, ...args] = command.split(' ');

        const process = container.spawn(cmd, args, {
          env: {
            ...env,
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            HOME: '/home/user',
          },
        });

        let stdout = '';
        let stderr = '';

        process.output.pipeTo(
          new WritableStream({
            write: (chunk) => {
              stdout += chunk;
              addOutput({
                type: 'stdout',
                content: chunk,
                timestamp: new Date(),
              });
            },
          })
        );

        process.stderr?.pipeTo(
          new WritableStream({
            write: (chunk) => {
              stderr += chunk;
              addOutput({
                type: 'stderr',
                content: chunk,
                timestamp: new Date(),
              });
            },
          })
        );

        const exitCode = await process.exit;
        if (exitCode !== 0) {
          addOutput({
            type: 'error',
            content: `Command exited with code ${exitCode}`,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        addOutput({
          type: 'error',
          content: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      } finally {
        setIsExecuting(false);
      }
    },
    [container, addOutput]
  );

  const getPreviousCommand = useCallback(() => {
    if (commandHistory.length === 0) return '';
    historyIndexRef.current = Math.min(
      historyIndexRef.current + 1,
      commandHistory.length - 1
    );
    return commandHistory[commandHistory.length - 1 - historyIndexRef.current];
  }, [commandHistory]);

  const getNextCommand = useCallback(() => {
    if (historyIndexRef.current <= 0) {
      historyIndexRef.current = -1;
      return '';
    }
    historyIndexRef.current--;
    return commandHistory[commandHistory.length - 1 - historyIndexRef.current];
  }, [commandHistory]);

  return {
    outputs,
    isExecuting,
    commandHistory,
    executeCommand,
    addOutput,
    clearTerminal,
    getPreviousCommand,
    getNextCommand,
  };
}
