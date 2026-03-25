/**
 * VerifyMenuBarContent — Popover that opens the drawer.
 *
 * Immediately opens the drawer and closes the popover, so the hand icon
 * acts as a direct toggle for the verification drawer.
 */

import { useEffect } from 'react';
import type { MenuBarCanvasProps } from '@tryvienna/sdk';

export function VerifyMenuBarContent({ onClose, openPluginDrawer }: MenuBarCanvasProps) {
  useEffect(() => {
    openPluginDrawer({ view: 'verify' });
    onClose();
  }, [openPluginDrawer, onClose]);

  return null;
}
