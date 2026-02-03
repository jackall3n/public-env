import type { Plugin } from "vite";
import { createPublicEnv, DEFAULT_PREFIXES, type PublicEnvConfig } from "./core";

export function publicEnv(config: PublicEnvConfig = {}): Plugin {
  const prefixes = config.prefixes ?? DEFAULT_PREFIXES;

  return {
    name: "public-env",
    config() {
      const mesh = createPublicEnv(process.env, { prefixes });

      // Only define VITE_ prefixed vars for Vite's import.meta.env
      const define = Object.fromEntries(
        Object.entries(mesh)
          .filter(([k]) => k.startsWith("VITE_"))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      );

      return { define };
    },
  };
}

export { createPublicEnv, getPublicEnv, DEFAULT_PREFIXES, type PublicEnvConfig } from "./core";
