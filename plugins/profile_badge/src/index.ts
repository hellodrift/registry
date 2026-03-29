/**
 * @vienna/plugin-profile-badge — Shows the active content profile in the menu bar.
 *
 * Displays the profile's emoji icon in the menu bar. Clicking it opens
 * a popover showing the profile name, description, and source URL.
 */

import { definePlugin } from '@tryvienna/sdk';
import { ProfileBadgeIcon } from './ui/ProfileBadgeIcon';
import { ProfileBadgeContent } from './ui/ProfileBadgeContent';

const USER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';

export const profileBadgePlugin = definePlugin({
  id: 'profile_badge',
  name: 'Profile Badge',
  description: 'Shows the active content profile in the menu bar',
  icon: { svg: USER_SVG },

  integrations: [],
  entities: [],

  canvases: {
    'menu-bar': {
      icon: ProfileBadgeIcon,
      component: ProfileBadgeContent,
      label: 'Active Profile',
      priority: 90,
    },
  },
});
