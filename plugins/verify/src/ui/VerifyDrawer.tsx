/**
 * VerifyDrawer — Shows testing instructions and verification controls.
 *
 * Reads testing-instructions.md from the active workstream's directories.
 * If no file exists, offers to generate one via workstream message.
 * Footer (rendered via DrawerCanvasConfig.footer) shows "Start Dev Server" and orb URL.
 */

import { useState, useMemo } from 'react';
import {
  DrawerBody,
  DrawerPanelFooter,
  Button,
  Markdown,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@vienna/ui';
import { Terminal, FileText, ChevronDown, Sparkles, ExternalLink } from 'lucide-react';
import { gql } from 'graphql-tag';
import { usePluginQuery, usePluginMutation, useActiveWorkstreamId, useWorkstream } from '@vienna/sdk/react';

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL operations
// ─────────────────────────────────────────────────────────────────────────────

const GET_WORKSTREAM_DIRS = gql`
  query GetWorkstreamDirsForVerify($workstreamId: ID!) {
    directoriesWithBranchInfo(workstreamId: $workstreamId) {
      path
      effectivePath
      label
    }
  }
`;

const GET_TESTING_INSTRUCTIONS = gql`
  query GetTestingInstructions($directories: [String!]!) {
    verifyTestingInstructions(directories: $directories) {
      directory
      label
      content
    }
  }
`;

const OPEN_TERMINAL = gql`
  mutation VerifyOpenTerminal($command: String!, $cwd: String!) {
    verifyOpenTerminal(command: $command, cwd: $cwd) {
      success
      error
    }
  }
`;

const OPEN_URL = gql`
  mutation VerifyOpenUrl($url: String!) {
    verifyOpenUrl(url: $url) {
      success
      error
    }
  }
`;

const GENERATE_PROMPT = `Generate a testing-instructions.md file in the root of this project. It should contain:

1. A brief summary of what was changed
2. Step-by-step manual verification instructions
3. What to look for (expected behavior)
4. Any edge cases to test

Write the file now.`;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DirectoryWithBranch {
  path: string;
  effectivePath: string;
  label?: string;
}

interface TestingInstruction {
  directory: string;
  label: string;
  content: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared hook for workstream directories + orb URL
// ─────────────────────────────────────────────────────────────────────────────

function useVerifyDirectories() {
  const workstreamId = useActiveWorkstreamId();

  const { data: dirsData } = usePluginQuery<{ directoriesWithBranchInfo: DirectoryWithBranch[] }>(
    GET_WORKSTREAM_DIRS,
    {
      variables: { workstreamId: workstreamId! },
      skip: !workstreamId,
      fetchPolicy: 'cache-and-network',
    },
  );

  const directories = useMemo(() => {
    const dirs = dirsData?.directoriesWithBranchInfo ?? [];
    return dirs.map((d) => d.effectivePath ?? d.path).filter(Boolean);
  }, [dirsData]);

  const orbUrl = useMemo(() => {
    if (directories.length === 0) return null;
    const dir = directories[0];
    const segments = dir.split('/');
    const worktreeName = segments[segments.length - 1];
    return `http://web.${worktreeName}.orb.local`;
  }, [directories]);

  return { workstreamId, directories, orbUrl };
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer component (rendered via DrawerCanvasConfig.footer)
// ─────────────────────────────────────────────────────────────────────────────

export function VerifyDrawerFooter(_props: Record<string, unknown>) {
  const { directories, orbUrl } = useVerifyDirectories();
  const [openTerminal, { loading: terminalLoading }] = usePluginMutation(OPEN_TERMINAL);
  const [openUrl] = usePluginMutation(OPEN_URL);

  const handleVerify = async () => {
    if (directories.length === 0) return;
    await openTerminal({
      variables: { command: 'docker compose up web', cwd: directories[0] },
    });
  };

  const handleOpenSite = async () => {
    if (!orbUrl) return;
    await openUrl({ variables: { url: orbUrl } });
  };

  return (
    <DrawerPanelFooter>
      <div className="space-y-2 w-full">
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={terminalLoading || directories.length === 0}
        >
          <Terminal size={14} className="mr-2" />
          {terminalLoading ? 'Starting...' : 'Start Dev Server'}
        </Button>
        {orbUrl && (
          <Button
            variant="outline"
            className="w-full min-w-0"
            onClick={handleOpenSite}
          >
            <ExternalLink size={14} className="mr-2 shrink-0" />
            <span className="truncate">{orbUrl}</span>
          </Button>
        )}
      </div>
    </DrawerPanelFooter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main drawer body
// ─────────────────────────────────────────────────────────────────────────────

export function VerifyDrawer() {
  const { workstreamId, directories } = useVerifyDirectories();
  const { sendMessage } = useWorkstream(workstreamId);
  const [generating, setGenerating] = useState(false);

  const { data: instructionsData, loading, refetch } = usePluginQuery<{
    verifyTestingInstructions: TestingInstruction[];
  }>(GET_TESTING_INSTRUCTIONS, {
    variables: { directories },
    skip: directories.length === 0,
    fetchPolicy: 'network-only',
  });

  const instructions = instructionsData?.verifyTestingInstructions ?? [];

  const handleGenerate = async () => {
    if (!workstreamId) return;
    setGenerating(true);
    try {
      await sendMessage(GENERATE_PROMPT);
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (!workstreamId) {
    return (
      <DrawerBody>
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <span className="text-3xl">✋</span>
          <span className="text-sm text-muted-foreground text-center">
            No active workstream. Select a workstream to see testing instructions.
          </span>
        </div>
      </DrawerBody>
    );
  }

  if (loading && instructions.length === 0) {
    return (
      <DrawerBody>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </DrawerBody>
    );
  }

  if (instructions.length === 0) {
    return (
      <DrawerBody>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <FileText size={32} className="text-muted-foreground" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">No testing instructions</p>
            <p className="text-xs text-muted-foreground">
              No <code className="px-1 py-0.5 rounded bg-muted text-[11px]">testing-instructions.md</code> found in the workstream directories.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
            >
              <Sparkles size={14} className="mr-1.5" />
              {generating ? 'Sending...' : 'Generate'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </DrawerBody>
    );
  }

  return (
    <DrawerBody>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {instructions.length} {instructions.length === 1 ? 'file' : 'files'} found
          </span>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>

        {instructions.length === 1 ? (
          <div className="rounded border border-border p-4">
            <Markdown content={instructions[0].content} />
          </div>
        ) : (
          instructions.map((inst) => (
            <Collapsible key={inst.directory} defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-muted/50 transition-colors text-left">
                <ChevronDown size={14} className="text-muted-foreground transition-transform [[data-state=closed]_&]:-rotate-90" />
                <FileText size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium truncate">{inst.label}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded border border-border p-4 mt-1">
                  <Markdown content={inst.content} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>
    </DrawerBody>
  );
}
