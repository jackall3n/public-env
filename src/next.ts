import { createPublicEnv, DEFAULT_PREFIXES, type PublicEnvConfig } from "./core";

type NextConfig = {
  env?: Record<string, string>;
  [key: string]: unknown;
};

export function withPublicEnv(config: PublicEnvConfig = {}) {
  const prefixes = config.prefixes ?? DEFAULT_PREFIXES;

  return (nextConfig: NextConfig = {}): NextConfig => {
    const mesh = createPublicEnv(process.env, { prefixes });

    // Only include NEXT_PUBLIC_ prefixed vars for Next.js
    const publicVars = Object.fromEntries(
      Object.entries(mesh).filter(([k]) => k.startsWith("NEXT_PUBLIC_"))
    );

    return {
      ...nextConfig,
      env: {
        ...nextConfig.env,
        ...publicVars,
      },
    };
  };
}

export { createPublicEnv, getPublicEnv, DEFAULT_PREFIXES, type PublicEnvConfig } from "./core";
