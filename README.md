# public-env

Share public environment variables across frameworks. Define once with any prefix, access everywhere.

## Installation

```bash
npm install public-env
# or
bun add public-env
```

## Problem

Different frameworks use different prefixes for public env vars:
- Vite: `VITE_`
- Next.js: `NEXT_PUBLIC_`
- Create React App: `REACT_APP_`
- Nx: `NX_`

This means you either duplicate vars in `.env` or write framework-specific code.

## Solution

Define your env var once with any supported prefix:

```env
PUBLIC_API_URL=https://api.example.com
```

`public-env` creates a mesh that makes it available under all prefixes:

```js
import { createPublicEnv } from 'public-env';

const env = createPublicEnv(process.env);
// env.PUBLIC_API_URL === "https://api.example.com"
// env.VITE_API_URL === "https://api.example.com"
// env.NEXT_PUBLIC_API_URL === "https://api.example.com"
```

## Usage

### Core

```js
import { createPublicEnv, getPublicEnv } from 'public-env';

// From custom env object
const mesh = createPublicEnv({ PUBLIC_API_URL: 'https://api.example.com' });

// From process.env
const mesh = getPublicEnv();

// Custom prefixes
const mesh = createPublicEnv(process.env, {
  prefixes: ['PUBLIC_', 'VITE_', 'NEXT_PUBLIC_']
});
```

### Vite

```js
// vite.config.ts
import { defineConfig } from 'vite';
import { publicEnv } from 'public-env/vite';

export default defineConfig({
  plugins: [publicEnv()],
});
```

Now `VITE_*` vars are available in your app via `import.meta.env`, populated from any matching prefix in your `.env`.

### Next.js

```js
// next.config.js
import { withPublicEnv } from 'public-env/next';

export default withPublicEnv()({
  // your next config
});
```

Now `NEXT_PUBLIC_*` vars are available, populated from any matching prefix.

## Default Prefixes

- `PUBLIC_`
- `VITE_`
- `NEXT_PUBLIC_`
- `NX_`
- `REACT_APP_`

## API

### `createPublicEnv(env, config?)`

Creates a mesh of env vars from the given object.

- `env`: Object with env vars
- `config.prefixes`: Array of prefixes to match (default: all)

### `getPublicEnv(config?)`

Shorthand for `createPublicEnv(process.env, config)`.

### `publicEnv(config?)` (Vite plugin)

Vite plugin that populates `import.meta.env.VITE_*` from the mesh.

### `withPublicEnv(config?)` (Next.js)

Next.js config wrapper that populates `NEXT_PUBLIC_*` vars.

## License

MIT
