export interface PublicEnvConfig {
  prefixes?: string[];
}

export const DEFAULT_PREFIXES = [
  "PUBLIC_",
  "VITE_",
  "NEXT_PUBLIC_",
  "NX_",
  "REACT_APP_",
];

export function createPublicEnv(
  env: Record<string, string | undefined>,
  config: PublicEnvConfig = {}
): Record<string, string> {
  const prefixes = config.prefixes ?? DEFAULT_PREFIXES;
  const mesh: Record<string, string> = {};

  // Track base names and their values (later definitions win)
  const baseNameValues = new Map<string, string>();

  // First pass: extract all base names and their values
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) continue;

    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) {
        const baseName = key.slice(prefix.length);
        // Later definitions win
        baseNameValues.set(baseName, value);
        break;
      }
    }
  }

  // Second pass: create mesh with all prefixes for each base name
  for (const [baseName, value] of baseNameValues) {
    for (const prefix of prefixes) {
      mesh[prefix + baseName] = value;
    }
  }

  return mesh;
}

export function getPublicEnv(config: PublicEnvConfig = {}): Record<string, string> {
  return createPublicEnv(process.env, config);
}
