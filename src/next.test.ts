import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { withPublicEnv } from "./next";

describe("withPublicEnv (Next.js)", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("returns a function that wraps Next.js config", () => {
    const wrapper = withPublicEnv();
    expect(wrapper).toBeFunction();
  });

  test("preserves existing Next.js config", () => {
    process.env = {};

    const wrapper = withPublicEnv();
    const config = wrapper({
      reactStrictMode: true,
      images: { domains: ["example.com"] },
    });

    expect(config.reactStrictMode).toBe(true);
    expect(config.images).toEqual({ domains: ["example.com"] });
  });

  test("adds NEXT_PUBLIC_ prefixed vars to env", () => {
    process.env = {
      PUBLIC_API_URL: "https://api.example.com",
    };

    const wrapper = withPublicEnv();
    const config = wrapper({});

    expect(config.env!.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
  });

  test("meshes vars from different prefixes into NEXT_PUBLIC_", () => {
    process.env = {
      VITE_FEATURE: "enabled",
      PUBLIC_DEBUG: "true",
    };

    const wrapper = withPublicEnv();
    const config = wrapper({});

    expect(config.env!.NEXT_PUBLIC_FEATURE).toBe("enabled");
    expect(config.env!.NEXT_PUBLIC_DEBUG).toBe("true");
  });

  test("only outputs NEXT_PUBLIC_ prefixed vars", () => {
    process.env = {
      PUBLIC_API_URL: "https://api.example.com",
    };

    const wrapper = withPublicEnv();
    const config = wrapper({});

    const envKeys = Object.keys(config.env!);
    expect(envKeys.every((k) => k.startsWith("NEXT_PUBLIC_"))).toBe(true);
  });

  test("preserves existing env vars in config", () => {
    process.env = {
      PUBLIC_NEW_VAR: "new-value",
    };

    const wrapper = withPublicEnv();
    const config = wrapper({
      env: {
        EXISTING_VAR: "existing-value",
      },
    });

    expect(config.env!.EXISTING_VAR).toBe("existing-value");
    expect(config.env!.NEXT_PUBLIC_NEW_VAR).toBe("new-value");
  });

  test("respects custom prefixes", () => {
    process.env = {
      CUSTOM_VAR: "custom-value",
    };

    const wrapper = withPublicEnv({ prefixes: ["CUSTOM_", "NEXT_PUBLIC_"] });
    const config = wrapper({});

    expect(config.env!.NEXT_PUBLIC_VAR).toBe("custom-value");
  });

  test("handles empty env", () => {
    process.env = {};

    const wrapper = withPublicEnv();
    const config = wrapper({});

    expect(config.env).toEqual({});
  });

  test("handles undefined nextConfig", () => {
    process.env = {
      PUBLIC_VAR: "value",
    };

    const wrapper = withPublicEnv();
    const config = wrapper();

    expect(config.env!.NEXT_PUBLIC_VAR).toBe("value");
  });
});
