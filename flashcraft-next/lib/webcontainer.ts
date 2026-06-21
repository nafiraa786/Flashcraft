import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  try {
    webcontainerInstance = await WebContainer.boot();
    return webcontainerInstance;
  } catch (error) {
    console.error('Failed to boot WebContainer:', error);
    throw new Error('Failed to initialize development environment');
  }
}

export async function createFile(
  container: WebContainer,
  path: string,
  content: string
): Promise<void> {
  await container.fs.writeFile(path, content);
}

export async function readFile(
  container: WebContainer,
  path: string
): Promise<string> {
  const content = await container.fs.readFile(path, 'utf-8');
  return content as string;
}

export async function deleteFile(
  container: WebContainer,
  path: string
): Promise<void> {
  await container.fs.rm(path);
}

export async function listFiles(
  container: WebContainer,
  path: string = '/'
): Promise<any[]> {
  try {
    const files = await container.fs.readdir(path, { withFileTypes: true });
    return files.map((file: any) => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: `${path}${path === '/' ? '' : '/'}${file.name}`,
    }));
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

export async function executeCommand(
  container: WebContainer,
  command: string,
  args: string[] = [],
  env: Record<string, string> = {}
): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    const process = container.spawn(command, args, {
      env: {
        ...process.env,
        ...env,
        PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      },
    });

    process.output.pipeTo(
      new WritableStream({
        write: (chunk) => {
          stdout += chunk;
        },
      })
    );

    process.stderr?.pipeTo(
      new WritableStream({
        write: (chunk) => {
          stderr += chunk;
        },
      })
    );

    process.exit.then((code) => {
      exitCode = code;
      resolve({ stdout, stderr, exitCode });
    });
  });
}
