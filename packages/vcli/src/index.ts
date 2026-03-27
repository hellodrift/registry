import { Command } from 'commander';
import { registerPluginScaffoldCommand } from './commands/plugin-scaffold.ts';

const program = new Command();

program
  .name('vcli')
  .description('Vienna plugin development CLI')
  .version('0.0.1');

const pluginCmd = program
  .command('plugin')
  .description('Plugin development commands');

registerPluginScaffoldCommand(pluginCmd);

program.parse();
