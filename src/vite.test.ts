import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { publicEnv } from "./vite";

describe("publicEnv (Vite plugin)", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("returns a Vite plugin with correct name", () => {
    const plugin = publicEnv();
    expect(plugin.name).toBe("public-env");
  });

  test("has a config hook", () => {
    const plugin = publicEnv();
    expect(plugin.config).toBeFunction();
  });

  test("config hook returns define with VITE_ prefixed vars", () => {
    process.env = {
      PUBLIC_API_URL: "https://api.example.com",
    };

    const plugin = publicEnv();
    const config = plugin.config!({}, { command: "serve", mode: "development" });

    expect(config).toHaveProperty("define");
    expect(config!.define!["import.meta.env.VITE_API_URL"]).toBe(
      JSON.stringify("https://api.example.com")
    );
  });

  test("meshes vars from different prefixes into VITE_", () => {
    process.env = {
      NEXT_PUBLIC_FEATURE: "enabled",
      PUBLIC_DEBUG: "true",
    };

    const plugin = publicEnv();
    const config = plugin.config!({}, { command: "serve", mode: "development" });

    expect(config!.define!["import.meta.env.VITE_FEATURE"]).toBe(
      JSON.stringify("enabled")
    );
    expect(config!.define!["import.meta.env.VITE_DEBUG"]).toBe(
      JSON.stringify("true")
    );
  });

  test("only outputs VITE_ prefixed vars in define", () => {
    process.env = {
      PUBLIC_API_URL: "https://api.example.com",
    };

    const plugin = publicEnv();
    const config = plugin.config!({}, { command: "serve", mode: "development" });

    const defineKeys = Object.keys(config!.define!);
    expect(defineKeys.every((k) => k.startsWith("import.meta.env.VITE_"))).toBe(true);
  });

  test("respects custom prefixes", () => {
    process.env = {
      CUSTOM_VAR: "custom-value",
    };

    const plugin = publicEnv({ prefixes: ["CUSTOM_", "VITE_"] });
    const config = plugin.config!({}, { command: "serve", mode: "development" });

    expect(config!.define!["import.meta.env.VITE_VAR"]).toBe(
      JSON.stringify("custom-value")
    );
  });

  test("handles empty env", () => {
    process.env = {};

    const plugin = publicEnv();
    const config = plugin.config!({}, { command: "serve", mode: "development" });

    expect(config!.define).toEqual({});
  });
});
