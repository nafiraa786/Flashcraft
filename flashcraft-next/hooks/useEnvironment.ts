import { useState, useCallback } from 'react';
import {
  validateEnvironmentVariable,
  encryptValue,
  decryptValue,
  getEnvironmentVariables,
  formatEnvFile,
  parseEnvFile,
} from '@/lib/environment';

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  encrypted: boolean;
  environment: 'all' | 'development' | 'staging' | 'production';
}

export function useEnvironment(initialVariables: EnvironmentVariable[] = []) {
  const [variables, setVariables] = useState<EnvironmentVariable[]>(initialVariables);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addVariable = useCallback(
    (key: string, value: string, options: { encrypted?: boolean; environment?: EnvironmentVariable['environment'] } = {}) => {
      const validation = validateEnvironmentVariable(key, value);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const id = `${key}_${Date.now()}`;
      const newVariable: EnvironmentVariable = {
        id,
        key,
        value: options.encrypted ? encryptValue(value) : value,
        encrypted: options.encrypted ?? false,
        environment: options.environment ?? 'all',
      };

      setVariables((prev) => [...prev, newVariable]);
      return newVariable;
    },
    []
  );

  const updateVariable = useCallback(
    (id: string, updates: Partial<EnvironmentVariable>) => {
      if (updates.key) {
        const validation = validateEnvironmentVariable(
          updates.key,
          updates.value || ''
        );
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      setVariables((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
              ...v,
              ...updates,
              value: updates.value
                ? updates.encrypted
                  ? encryptValue(updates.value)
                  : updates.value
                : v.value,
            }
            : v
        )
      );
    },
    []
  );

  const deleteVariable = useCallback((id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const getVariable = useCallback(
    (key: string) => {
      const variable = variables.find((v) => v.key === key);
      if (!variable) return undefined;
      return {
        ...variable,
        value: variable.encrypted ? decryptValue(variable.value) : variable.value,
      };
    },
    [variables]
  );

  const getAllVariables = useCallback(
    (environment: 'development' | 'staging' | 'production' = 'development') => {
      return getEnvironmentVariables(variables, environment);
    },
    [variables]
  );

  const exportEnvFile = useCallback(() => {
    const decryptedVars = variables.map((v) => ({
      ...v,
      value: v.encrypted ? decryptValue(v.value) : v.value,
    }));
    return formatEnvFile(decryptedVars);
  }, [variables]);

  const importEnvFile = useCallback((content: string) => {
    const parsed = parseEnvFile(content);
    setVariables(
      parsed.map((v) => ({
        ...v,
        id: `${v.key}_${Date.now()}`,
      }))
    );
  }, []);

  return {
    variables,
    editingId,
    setEditingId,
    addVariable,
    updateVariable,
    deleteVariable,
    getVariable,
    getAllVariables,
    exportEnvFile,
    importEnvFile,
  };
}
