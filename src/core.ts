export interface PublicEnvConfig {
  prefixes?: string[];
  debug?: boolean;
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
  const debug = config.debug ?? false;
  const mesh: Record<string, string> = {};

  if (debug) {
    console.log("[public-env] Starting with prefixes:", prefixes);
    console.log("[public-env] Input env keys:", Object.keys(env).length);
  }

  // Track base names and their values (later definitions win)
  const baseNameValues = new Map<string, string>();

  // First pass: extract all base names and their values
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) continue;

    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) {
        const baseName = key.slice(prefix.length);
        if (debug) {
          const existing = baseNameValues.get(baseName);
          if (existing) {
            console.log(`[public-env] Overwriting ${baseName}: "${existing}" -> "${value}" (from ${key})`);
          } else {
            console.log(`[public-env] Found ${baseName} = "${value}" (from ${key})`);
          }
        }
        // Later definitions win
        baseNameValues.set(baseName, value);
        break;
      }
    }
  }

  if (debug) {
    console.log("[public-env] Unique base names found:", baseNameValues.size);
  }

  // Second pass: create mesh with all prefixes for each base name
  for (const [baseName, value] of baseNameValues) {
    for (const prefix of prefixes) {
      mesh[prefix + baseName] = value;
      if (debug) {
        console.log(`[public-env] Meshed: ${prefix}${baseName} = "${value}"`);
      }
    }
  }

  if (debug) {
    console.log("[public-env] Output mesh keys:", Object.keys(mesh).length);
  }

  return mesh;
}

export function getPublicEnv(config: PublicEnvConfig = {}): Record<string, string> {
  return createPublicEnv(process.env, config);
}
