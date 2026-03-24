/**
 * Verify Work — GraphQL schema registration.
 *
 * Provides queries to read testing-instructions.md from directories,
 * and a mutation to open a terminal running `pnpm run dev`.
 * Resolvers run in the main process (Node.js).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { platform } from 'node:os';

// ─────────────────────────────────────────────────────────────────────────────
// File reading
// ─────────────────────────────────────────────────────────────────────────────

const INSTRUCTIONS_FILENAME = 'testing-instructions.md';

interface TestingInstructions {
  directory: string;
  label: string;
  content: string;
}

function readTestingInstructions(directories: string[]): TestingInstructions[] {
  const results: TestingInstructions[] = [];
  for (const dir of directories) {
    const filePath = join(dir, INSTRUCTIONS_FILENAME);
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const label = dir.split('/').pop() ?? dir;
        results.push({ directory: dir, label, content });
      } catch {
        // skip unreadable files
      }
    }
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminal launching (reuses pattern from plugin-quick-actions)
// ─────────────────────────────────────────────────────────────────────────────

function openTerminalWithCommand(command: string, cwd: string): { success: boolean; error: string | null } {
  try {
    const os = platform();
    const escapedCwd = cwd.replace(/'/g, "'\\''");

    if (os === 'darwin') {
      const escaped = `cd '${escapedCwd}' && ${command}`.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const appleScript = `tell application "Terminal"
activate
set w to do script ""
delay 2
do script "clear; ${escaped}" in w
end tell`;
      execFile('osascript', ['-e', appleScript], { timeout: 10000 }, () => {});
    } else if (os === 'win32') {
      spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `cd /d "${cwd}" && ${command}`], {
        detached: true,
        stdio: 'ignore',
      }).unref();
    } else {
      for (const term of ['x-terminal-emulator', 'gnome-terminal', 'xterm']) {
        try {
          spawn(term, ['-e', `bash -c 'cd "${cwd}" && ${command}; exec bash'`], {
            detached: true,
            stdio: 'ignore',
          }).unref();
          break;
        } catch { continue; }
      }
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Open URL in default browser
// ─────────────────────────────────────────────────────────────────────────────

function openUrlInBrowser(url: string): { success: boolean; error: string | null } {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { success: false, error: `Disallowed URL scheme: ${parsed.protocol}` };
    }
    const os = platform();
    if (os === 'darwin') {
      execFile('open', [url], () => {});
    } else if (os === 'win32') {
      spawn('cmd.exe', ['/c', 'start', url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      execFile('xdg-open', [url], () => {});
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerVerifySchema(rawBuilder: unknown): void {
  const builder = rawBuilder as any;

  // ── Types ────────────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const TestingInstructionsRef = builder.objectRef<TestingInstructions>('VerifyTestingInstructions');
  builder.objectType(TestingInstructionsRef, {
    description: 'Testing instructions from a directory',
    fields: (t) => ({
      directory: t.exposeString('directory'),
      label: t.exposeString('label'),
      content: t.exposeString('content'),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const RunResultRef = builder.objectRef<{ success: boolean; error: string | null }>('VerifyRunResult');
  builder.objectType(RunResultRef, {
    description: 'Result of launching a terminal command',
    fields: (t) => ({
      success: t.exposeBoolean('success'),
      error: t.string({ nullable: true, resolve: (parent) => parent.error }),
    }),
  });

  // ── Queries ──────────────────────────────────────────────────────────────

  builder.queryFields((t) => ({
    verifyTestingInstructions: t.field({
      type: [TestingInstructionsRef],
      description: 'Read testing-instructions.md from the given directories',
      args: {
        directories: t.arg.stringList({ required: true }),
      },
      resolve: (_root, args) => {
        return readTestingInstructions(args.directories);
      },
    }),
  }));

  // ── Mutations ────────────────────────────────────────────────────────────

  builder.mutationFields((t) => ({
    verifyOpenTerminal: t.field({
      type: RunResultRef,
      description: 'Open a system terminal running a command in the given directory',
      args: {
        command: t.arg.string({ required: true }),
        cwd: t.arg.string({ required: true }),
      },
      resolve: (_root, args) => {
        return openTerminalWithCommand(args.command, args.cwd);
      },
    }),
    verifyOpenUrl: t.field({
      type: RunResultRef,
      description: 'Open a URL in the default system browser',
      args: {
        url: t.arg.string({ required: true }),
      },
      resolve: (_root, args) => {
        return openUrlInBrowser(args.url);
      },
    }),
  }));
}
