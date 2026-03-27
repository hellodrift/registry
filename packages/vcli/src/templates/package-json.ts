import type { TemplateContext } from '../types.ts';

export function renderPackageJson(ctx: TemplateContext): string {
  const { naming, auth } = ctx;

  const dependencies: Record<string, string> = {
    '@tryvienna/sdk': 'file:../../../vienna/.worktrees/plugins/packages/sdk',
    'zod': '^3.25.67',
  };

  // Add auth-specific client libraries as placeholders
  if (auth === 'oauth' || auth === 'pat') {
    dependencies['// TODO: add your API client library'] = '';
  }

  const depsEntries = Object.entries(dependencies)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(',\n');

  return `{
  "name": "plugin-${naming.pluginName}",
  "version": "0.0.1",
  "private": true,
  "description": "${ctx.description}",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema.ts",
    "./ui": "./src/ui/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "codegen": "graphql-codegen --config codegen.ts",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format:check": "prettier --check .",
    "format": "prettier --write ."
  },
  "dependencies": {
${depsEntries}
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^6.1.2",
    "@graphql-codegen/client-preset": "^5.2.3",
    "@graphql-typed-document-node/core": "^3.2.0",
    "@types/node": "^25.3.2",
    "@types/react": "^19.0.0",
    "@vienna/graphql": "file:../../../vienna/.worktrees/plugins/packages/graphql",
    "@tryvienna/ui": "file:../../../vienna/.worktrees/plugins/packages/ui",
    "graphql-tag": "^2.12.6",
    "lucide-react": "^0.500.0",
    "tsx": "^4.20.3",
    "typescript": "^5.9.3"
  }
}
`;
}
