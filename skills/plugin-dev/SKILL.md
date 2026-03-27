---
name: plugin-dev
description: Build Vienna plugins — scaffold with vcli, then implement integrations, entities, sidebar/drawer/menu-bar canvases, and GraphQL schemas. Use when the user wants to create, build, or modify a Vienna plugin.
version: "2.0"
author: Vienna
icon: puzzle-piece
category: Development
tags: [plugins, development, vienna, drawer, sidebar, entity, integration, scaffold]
allowed-tools: WebFetch Read Glob Grep Bash Write Edit
user-invocable: true
argument-hint: Describe the plugin you want to build
---

# Vienna Plugin Development

You are building a plugin for Vienna, a programmable desktop IDE. Plugins extend Vienna via three primitives: **integrations** (API connections), **entities** (typed data), and **canvases** (UI slots).

## Step 1: Scaffold with vcli

**Always start by scaffolding.** The `vcli` CLI generates a complete, working plugin skeleton with all the right patterns.

```bash
node packages/vcli/bin/vcli.mjs plugin scaffold \
  --name=my-plugin \
  --canvas=sidebar,drawer,menu-bar \
  --entity=task,comment \
  --auth=oauth \
  --description="My plugin description"
```

Run from the **registry repo root** (`registry/`). The scaffold auto-detects the registry and outputs to `plugins/<name>/`.

### Flags

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--name` | kebab-case | required | Plugin name |
| `--canvas` | `sidebar`, `drawer`, `menu-bar` | `sidebar,drawer` | UI canvases (comma-separated) |
| `--entity` | kebab-case names | none | Entity types (comma-separated) |
| `--auth` | `oauth`, `pat`, `api-key`, `none` | `none` | Authentication pattern |
| `--description` | string | `"A Vienna plugin"` | Plugin description |
| `--dry-run` | flag | false | Preview without writing |

### Auth patterns

- **`oauth`** — Full OAuth PKCE + PAT fallback (like GitHub/Linear plugins)
- **`pat`** — Personal access token only
- **`api-key`** — API key credential
- **`none`** — No authentication (like the Weather plugin)

### Canvas auto-expansion

`drawer` is always included when `sidebar` or `menu-bar` is selected — the drawer serves as the routing hub for settings and entity views.

### What gets generated

A full plugin with 11-21 files depending on options:
- `package.json`, `tsconfig.json`, `codegen.ts`
- `src/index.ts` — `definePlugin()` bundling everything
- `src/integration.ts` — `defineIntegration()` with auth pattern
- `src/schema.ts` — GraphQL types/queries via Pothos SchemaBuilder
- `src/api.ts` — API client method stubs
- `src/entities/` — `defineEntity()` per entity type
- `src/client/operations.ts` — GraphQL query documents
- `src/ui/` — Canvas components (NavSection, PluginDrawer, SettingsDrawer, MenuBarIcon, MenuBarContent, EntityDrawer, useSettings hook)

## Step 2: Implement the plugin

After scaffolding, work through the `TODO` comments in the generated code:

1. **`src/integration.ts`** — Set OAuth URLs, import your API client library, implement `createClient`
2. **`src/schema.ts`** — Define GraphQL types matching your API response shapes, implement `resolve` and `search` handlers
3. **`src/api.ts`** — Implement API wrapper methods
4. **`src/entities/*.ts`** — Adjust URI segments, display metadata (emoji, colors), output fields
5. **`src/ui/*.tsx`** — Customize UI components with real data queries
6. **`src/client/operations.ts`** — Add GraphQL operations matching your schema

## Plugin Architecture Reference

### Three primitives

| Primitive | Factory | Purpose |
|-----------|---------|---------|
| **Entity** | `defineEntity()` | Typed data with URI pattern, display metadata, cache config |
| **Integration** | `defineIntegration<TClient>()` | API connection with auth, client factory, GraphQL schema |
| **Canvas** | Part of `definePlugin()` | UI slots: `nav-sidebar`, `drawer`, `menu-bar` |

### Canvas types and props

| Canvas | Config | Props |
|--------|--------|-------|
| `nav-sidebar` | `{ component, label, priority? }` | `{ pluginId, openPluginDrawer, openEntityDrawer, hostApi, logger }` |
| `drawer` | `{ component, label, footer? }` | `{ pluginId, payload, drawer, openEntityDrawer, hostApi, logger }` |
| `menu-bar` | `{ icon, component, label, priority? }` | Icon: `{ pluginId, hostApi, logger }`, Content: `{ pluginId, onClose, openPluginDrawer, hostApi, logger }` |

### Real plugin examples (in `registry/plugins/`)

| Plugin | Auth | Canvases | Entities | Pattern |
|--------|------|----------|----------|---------|
| **github** | OAuth PKCE + PAT | sidebar, drawer | PR, Issue, WorkflowRun, Repo | Full integration with ~24 API methods |
| **linear** | OAuth PKCE | sidebar, drawer | Issue | Project management integration |
| **weather** | none | menu-bar, drawer | none | Simple API, menu-bar icon + popover |

When implementing a plugin, **read the corresponding real plugin** for patterns. For example, if building an OAuth sidebar plugin, read `plugins/github/src/`.

## Plugin Imports

Plugins may ONLY import from these packages:

- **`@tryvienna/sdk`** — `defineEntity`, `defineIntegration`, `definePlugin`, `PluginLogger`, `SecureStorage`, URI utilities, types
- **`@tryvienna/sdk/react`** — `usePluginQuery`, `usePluginMutation`, `useEntity`, `useHostApi`, `useActiveWorkstreamId`
- **`@tryvienna/sdk/graphql`** — Pre-defined GraphQL operations
- **`@tryvienna/ui`** — Radix-based component library (80+ components)

**Do NOT import** `@vienna/ipc`, `@vienna/logger`, `@vienna/env`, or any host-internal packages.

For logging, use `PluginLogger` injected via context — never `console.*`:

```typescript
// In createClient:
createClient: async (ctx) => {
  ctx.logger.info('Creating client');
}

// In entity handlers (via schema builder):
resolve: async (id, ctx) => {
  ctx.logger.debug('Resolving entity', { id });
}
```

## Conventions (Enforced by ESLint)

- **8pt grid spacing** — Tailwind classes: `p-2`, `gap-4`, `m-3` (base unit 4px)
- **ESM only** — no `require()`, no CommonJS
- **No `.js` import extensions** — bundler module resolution
- **Strict TypeScript** — `strict: true`, `noUncheckedIndexedAccess: true`
- **No `process.env`** — use `@vienna/env` (host only) or secure storage (plugins)
- **No `console.*`** — use `PluginLogger` from context

## Documentation

Fetch additional documentation pages as needed:

| Page | URL | When to fetch |
|------|-----|---------------|
| Plugin Development | {{DOCS_BASE_URL}}/guide/plugin-development | Detailed architecture and concepts |
| Weather Plugin Tutorial | {{DOCS_BASE_URL}}/guide/weather-plugin-tutorial | Menu-bar plugin example |
| SDK Reference | {{DOCS_BASE_URL}}/reference/sdk | Full API reference |
| Logging | {{DOCS_BASE_URL}}/guide/logging | Structured logging details |

For the UI component catalog, read: `packages/ui/src/COMPONENTS.md`

## Workflow

1. **Understand** what the user wants the plugin to do — which external service, what data, what UI
2. **Scaffold** with `vcli plugin scaffold` using the right flags for auth, canvases, and entities
3. **Install dependencies** — `cd plugins/<name> && pnpm install`
4. **Read real plugin examples** in `registry/plugins/` for the closest pattern
5. **Implement** by filling in TODOs: integration auth, API methods, schema types, UI components
6. **Read `packages/ui/src/COMPONENTS.md`** for available UI components
7. **Run `pnpm typecheck`** to verify TypeScript correctness
8. **Run `pnpm codegen`** after schema changes to regenerate GraphQL types

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/vcli/bin/vcli.mjs` | CLI scaffold entry point |
| `plugins/github/src/index.ts` | Canonical plugin definition |
| `plugins/github/src/integration.ts` | OAuth PKCE + PAT integration |
| `plugins/github/src/schema.ts` | GraphQL schema with entityObjectType |
| `plugins/github/src/ui/GitHubNavSection.tsx` | Sidebar canvas pattern |
| `plugins/github/src/ui/GitHubPluginDrawer.tsx` | Drawer routing pattern |
| `plugins/weather/src/ui/WeatherMenuBarIcon.tsx` | Menu-bar icon pattern |
| `packages/ui/src/COMPONENTS.md` | Full UI component catalog |
