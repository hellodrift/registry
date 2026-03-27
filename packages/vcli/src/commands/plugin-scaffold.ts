import fs from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import type { TemplateContext, CanvasType } from '../types.ts';
import { buildNamingContext, buildEntityNaming } from '../naming.ts';
import {
  validatePluginName,
  parseCanvases,
  parseAuth,
  parseEntities,
  expandCanvases,
} from '../validation.ts';
import { buildFileMap } from '../templates/index.ts';
import { writeFileMap } from '../writer.ts';

interface ScaffoldOptions {
  name: string;
  canvas: string;
  entity: string;
  auth: string;
  description: string;
  dryRun: boolean;
  output?: string;
}

/**
 * Find the registry plugins/ directory by walking up from cwd looking for registry.json.
 * Falls back to cwd if not in a registry repo.
 */
function resolveOutputDir(pluginName: string, explicitOutput?: string): string {
  if (explicitOutput) {
    return path.resolve(explicitOutput, pluginName);
  }

  // Walk up to find registry.json
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'registry.json'))) {
      return path.join(dir, 'plugins', pluginName);
    }
    dir = path.dirname(dir);
  }

  // Fallback: create in cwd
  return path.resolve(process.cwd(), pluginName);
}

export function registerPluginScaffoldCommand(program: Command): void {
  program
    .command('scaffold')
    .description('Scaffold a new Vienna plugin')
    .requiredOption('--name <name>', 'Plugin name (kebab-case)')
    .option('--canvas <canvases>', 'Canvases to include (comma-separated: sidebar,drawer,menu-bar)', 'sidebar,drawer')
    .option('--entity <entities>', 'Entity types to scaffold (comma-separated, kebab-case)', '')
    .option('--auth <type>', 'Authentication pattern (oauth, pat, api-key, none)', 'none')
    .option('--description <desc>', 'Plugin description', 'A Vienna plugin')
    .option('--dry-run', 'Preview files without writing', false)
    .option('--output <dir>', 'Output directory (default: auto-detect registry or cwd)')
    .action((opts: ScaffoldOptions) => {
      // Validate
      const nameErr = validatePluginName(opts.name);
      if (nameErr) {
        console.error(`Error: ${nameErr}`);
        process.exit(1);
      }

      let canvases: CanvasType[];
      try {
        canvases = parseCanvases(opts.canvas);
      } catch (e) {
        console.error(`Error: ${(e as Error).message}`);
        process.exit(1);
      }

      let auth;
      try {
        auth = parseAuth(opts.auth);
      } catch (e) {
        console.error(`Error: ${(e as Error).message}`);
        process.exit(1);
      }

      let entityNames: string[];
      try {
        entityNames = parseEntities(opts.entity);
      } catch (e) {
        console.error(`Error: ${(e as Error).message}`);
        process.exit(1);
      }

      // Build context
      const ctx: TemplateContext = {
        naming: buildNamingContext(opts.name),
        entities: entityNames.map(buildEntityNaming),
        canvases: expandCanvases(canvases),
        auth,
        description: opts.description,
      };

      // Generate file map
      const files = buildFileMap(ctx);

      // Resolve output directory
      const outputDir = resolveOutputDir(opts.name, opts.output);

      if (!opts.dryRun && fs.existsSync(outputDir)) {
        console.error(`Error: Directory "${outputDir}" already exists.`);
        process.exit(1);
      }

      // Write
      writeFileMap(outputDir, files, { dryRun: opts.dryRun });

      if (!opts.dryRun) {
        console.log(`\nCreated plugin "${opts.name}" at ${outputDir}/\n`);
        console.log(`Generated ${files.size} files:\n`);
        for (const filePath of [...files.keys()].sort()) {
          console.log(`  ${filePath}`);
        }
        console.log('\nNext steps:');
        console.log(`  cd ${path.relative(process.cwd(), outputDir)}`);
        console.log('  pnpm install');
        console.log('  pnpm typecheck');
        console.log('  # Start editing src/index.ts');
        console.log('');
      }
    });
}
