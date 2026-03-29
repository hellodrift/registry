/**
 * FeedbackPluginDrawer — Plugin-level drawer for the Feedback plugin.
 *
 * Routes between views based on `payload.view`:
 * - 'settings' -> FeedbackSettingsDrawer
 * - default -> Settings redirect
 */

import { DrawerBody } from '@tryvienna/ui';
import type { PluginDrawerCanvasProps } from '@tryvienna/sdk';
import { FeedbackSettingsDrawer } from './FeedbackSettingsDrawer';

export function FeedbackPluginDrawer({
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
          <FeedbackSettingsDrawer hostApi={hostApi} logger={logger} />
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
