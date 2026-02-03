import { test, expect, describe } from "bun:test";
import { createPublicEnv, DEFAULT_PREFIXES, getPublicEnv } from "./core";

describe("createPublicEnv", () => {
  test("creates mesh from single prefix", () => {
    const env = {
      PUBLIC_API_URL: "https://api.example.com",
    };

    const mesh = createPublicEnv(env, {
      prefixes: ["PUBLIC_", "VITE_", "NEXT_PUBLIC_"],
    });

    expect(mesh.PUBLIC_API_URL).toBe("https://api.example.com");
    expect(mesh.VITE_API_URL).toBe("https://api.example.com");
    expect(mesh.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
  });

  test("creates mesh from multiple different prefixes", () => {
    const env = {
      PUBLIC_API_URL: "https://api.example.com",
      VITE_FEATURE_FLAG: "true",
    };

    const mesh = createPublicEnv(env, {
      prefixes: ["PUBLIC_", "VITE_", "NEXT_PUBLIC_"],
    });

    expect(mesh.PUBLIC_API_URL).toBe("https://api.example.com");
    expect(mesh.VITE_API_URL).toBe("https://api.example.com");
    expect(mesh.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");

    expect(mesh.PUBLIC_FEATURE_FLAG).toBe("true");
    expect(mesh.VITE_FEATURE_FLAG).toBe("true");
    expect(mesh.NEXT_PUBLIC_FEATURE_FLAG).toBe("true");
  });

  test("later definitions win", () => {
    const env = {
      PUBLIC_API_URL: "https://first.example.com",
      VITE_API_URL: "https://second.example.com",
    };

    const mesh = createPublicEnv(env, {
      prefixes: ["PUBLIC_", "VITE_"],
    });

    // The value from VITE_API_URL should win since it comes later in iteration
    expect(mesh.PUBLIC_API_URL).toBe("https://second.example.com");
    expect(mesh.VITE_API_URL).toBe("https://second.example.com");
  });

  test("ignores non-matching prefixes", () => {
    const env = {
      PUBLIC_API_URL: "https://api.example.com",
      SECRET_KEY: "should-not-be-meshed",
      DATABASE_URL: "postgres://...",
    };

    const mesh = createPublicEnv(env, {
      prefixes: ["PUBLIC_", "VITE_"],
    });

    expect(mesh.PUBLIC_API_URL).toBe("https://api.example.com");
    expect(mesh.VITE_API_URL).toBe("https://api.example.com");
    expect(mesh.SECRET_KEY).toBeUndefined();
    expect(mesh.DATABASE_URL).toBeUndefined();
  });

  test("handles undefined values", () => {
    const env: Record<string, string | undefined> = {
      PUBLIC_API_URL: "https://api.example.com",
      PUBLIC_UNDEFINED: undefined,
    };

    const mesh = createPublicEnv(env, {
      prefixes: ["PUBLIC_", "VITE_"],
    });

    expect(mesh.PUBLIC_API_URL).toBe("https://api.example.com");
    expect(mesh.VITE_API_URL).toBe("https://api.example.com");
    expect(mesh.PUBLIC_UNDEFINED).toBeUndefined();
    expect(mesh.VITE_UNDEFINED).toBeUndefined();
  });

  test("uses default prefixes when not specified", () => {
    const env = {
      PUBLIC_API_URL: "https://api.example.com",
    };

    const mesh = createPublicEnv(env);

    expect(mesh.PUBLIC_API_URL).toBe("https://api.example.com");
    expect(mesh.VITE_API_URL).toBe("https://api.example.com");
    expect(mesh.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
    expect(mesh.NX_API_URL).toBe("https://api.example.com");
    expect(mesh.REACT_APP_API_URL).toBe("https://api.example.com");
  });

  test("DEFAULT_PREFIXES contains expected values", () => {
    expect(DEFAULT_PREFIXES).toContain("PUBLIC_");
    expect(DEFAULT_PREFIXES).toContain("VITE_");
    expect(DEFAULT_PREFIXES).toContain("NEXT_PUBLIC_");
    expect(DEFAULT_PREFIXES).toContain("NX_");
    expect(DEFAULT_PREFIXES).toContain("REACT_APP_");
  });

  test("handles empty env", () => {
    const mesh = createPublicEnv({}, { prefixes: ["PUBLIC_", "VITE_"] });
    expect(Object.keys(mesh)).toHaveLength(0);
  });

  test("handles empty prefixes", () => {
    const env = {
      PUBLIC_API_URL: "https://api.example.com",
    };

    const mesh = createPublicEnv(env, { prefixes: [] });
    expect(Object.keys(mesh)).toHaveLength(0);
  });
});

describe("getPublicEnv", () => {
  test("reads from process.env", () => {
    const originalEnv = process.env;
    process.env = {
      ...process.env,
      PUBLIC_TEST_VAR: "test-value",
    };

    const mesh = getPublicEnv({ prefixes: ["PUBLIC_", "VITE_"] });
    expect(mesh.PUBLIC_TEST_VAR).toBe("test-value");
    expect(mesh.VITE_TEST_VAR).toBe("test-value");

    process.env = originalEnv;
  });
});
