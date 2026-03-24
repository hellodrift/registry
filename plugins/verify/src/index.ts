/**
 * @vienna/plugin-verify — Verify Work plugin.
 *
 * Shows a hand icon in the menu bar. Clicking opens a drawer with
 * the contents of testing-instructions.md from the active workstream's
 * directories. Footer CTA opens a terminal running `pnpm run dev`.
 * If no file exists, offers to generate one via the active workstream.
 */

import { definePlugin } from '@vienna/sdk';
import { verifyIntegration } from './integration';
import { VerifyMenuBarIcon } from './ui/VerifyMenuBarIcon';
import { VerifyMenuBarContent } from './ui/VerifyMenuBarContent';
import { VerifyPluginDrawer } from './ui/VerifyPluginDrawer';
import { VerifyDrawerFooter } from './ui/VerifyDrawer';

const HAND_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6a5 5 0 0 0 10 0v-6"/><path d="M12 11V3"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/></svg>';

export const verifyPlugin = definePlugin({
  id: 'verify',
  name: 'Verify Work',
  description: 'Read testing instructions and verify work from the menu bar.',
  icon: { svg: HAND_SVG },

  integrations: [verifyIntegration],
  entities: [],

  canvases: {
    'menu-bar': {
      icon: VerifyMenuBarIcon,
      component: VerifyMenuBarContent,
      label: 'Verify Work',
      priority: 80,
    },
    drawer: {
      component: VerifyPluginDrawer,
      footer: VerifyDrawerFooter,
      label: 'Verify Work',
    },
  },
});

export { verifyIntegration } from './integration';
export { registerVerifySchema } from './schema';
