import { $ } from "bun";

const entrypoints = ["./src/index.ts", "./src/vite.ts", "./src/next.ts"];

// Build ESM
console.log("Building ESM...");
await Bun.build({
  entrypoints,
  outdir: "./dist",
  target: "node",
  format: "esm",
});

// Build CJS
console.log("Building CJS...");
for (const entry of entrypoints) {
  const name = entry.split("/").pop()!.replace(".ts", ".cjs");
  await Bun.build({
    entrypoints: [entry],
    outdir: "./dist",
    target: "node",
    format: "cjs",
    naming: name,
  });
}

// Generate types
console.log("Generating types...");
await $`tsc --emitDeclarationOnly`;

console.log("Build complete!");
