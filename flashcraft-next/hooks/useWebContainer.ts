import { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { getWebContainer } from '@/lib/webcontainer';

export function useWebContainer() {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initContainer = async () => {
      try {
        const wc = await getWebContainer();
        if (mounted) {
          setContainer(wc);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to initialize WebContainer'
          );
          setContainer(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initContainer();

    return () => {
      mounted = false;
    };
  }, []);

  return { container, isLoading, error };
}
