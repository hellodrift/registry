/**
 * GitHubPluginDrawer — Plugin-level drawer for the GitHub plugin.
 *
 * Routes between views based on `payload.view`:
 * - 'settings' → GitHubSettingsDrawer
 * - default → Settings redirect
 *
 * The host app wraps this in DrawerContainer (providing title, close button, etc.),
 * so this component only renders content — no drawer chrome needed.
 *
 * Opened from the nav section's gear icon via `openPluginDrawer({ view: 'settings' })`.
 */

import { DrawerBody } from '@vienna/ui';
import type { PluginDrawerCanvasProps } from '@vienna/sdk';
import { GitHubSettingsDrawer } from './GitHubSettingsDrawer';

export function GitHubPluginDrawer({
  payload,
  drawer,
  hostApi,
  logger,
}: PluginDrawerCanvasProps) {
  const view = (payload.view as string) ?? 'default';

  switch (view) {
    case 'settings':
      return (
        <DrawerBody>
          <GitHubSettingsDrawer hostApi={hostApi} logger={logger} />
        </DrawerBody>
      );

    default:
      return (
        <DrawerBody>
          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              className="text-xs text-primary bg-transparent border-none cursor-pointer hover:underline"
              onClick={() => drawer.open({ view: 'settings' })}
            >
              Open Settings
            </button>
          </div>
        </DrawerBody>
      );
  }
}
