import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key';

interface EnvironmentVariable {
  key: string;
  value: string;
  encrypted: boolean;
  environment: 'all' | 'development' | 'staging' | 'production';
}

export function encryptValue(value: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0')),
      iv
    );
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.warn('Encryption failed, returning plain text:', error);
    return value;
  }
}

export function decryptValue(encrypted: string): string {
  try {
    const [ivHex, encryptedData] = encrypted.split(':');
    if (!ivHex || !encryptedData) return encrypted;

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0')),
      iv
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.warn('Decryption failed, returning original:', error);
    return encrypted;
  }
}

export function validateEnvironmentVariable(key: string, value: string): {
  valid: boolean;
  error?: string;
} {
  // Key validation
  if (!key || !/^[A-Z_][A-Z0-9_]*$/.test(key)) {
    return {
      valid: false,
      error: 'Variable name must start with letter or underscore and contain only uppercase letters, numbers, and underscores',
    };
  }

  // Value validation
  if (!value) {
    return {
      valid: false,
      error: 'Variable value cannot be empty',
    };
  }

  return { valid: true };
}

export function formatEnvFile(variables: EnvironmentVariable[]): string {
  return variables
    .map((v) => `${v.key}=${v.encrypted ? decryptValue(v.value) : v.value}`)
    .join('\n');
}

export function parseEnvFile(content: string): EnvironmentVariable[] {
  const lines = content.split('\n').filter((line) => line.trim() && !line.startsWith('#'));

  return lines.map((line) => {
    const [key, value] = line.split('=');
    return {
      key: key.trim(),
      value: value ? value.trim() : '',
      encrypted: false,
      environment: 'all',
    };
  });
}

export function getEnvironmentVariables(
  variables: EnvironmentVariable[],
  environment: 'development' | 'staging' | 'production' = 'development'
): Record<string, string> {
  return variables
    .filter((v) => v.environment === 'all' || v.environment === environment)
    .reduce(
      (acc, v) => {
        acc[v.key] = v.encrypted ? decryptValue(v.value) : v.value;
        return acc;
      },
      {} as Record<string, string>
    );
}
