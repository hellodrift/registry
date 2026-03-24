/**
 * @vienna/plugin-weather — Weather forecast plugin.
 *
 * Shows current temperature in the menu bar with a popover
 * for the 7-day forecast. Clicking a day opens the hourly
 * forecast in the drawer.
 */

import { definePlugin } from '@vienna/sdk';
import { weatherApiIntegration } from './integration';
import { WeatherPluginDrawer } from './ui/WeatherPluginDrawer';
import { WeatherMenuBarIcon } from './ui/WeatherMenuBarIcon';
import { WeatherMenuBarContent } from './ui/WeatherMenuBarContent';

const CLOUD_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>';

export const weatherPlugin = definePlugin({
  id: 'weather',
  name: 'Weather',
  description: 'Weather forecast in the menu bar',
  icon: { svg: CLOUD_SVG },

  integrations: [weatherApiIntegration],
  entities: [],

  canvases: {
    drawer: {
      component: WeatherPluginDrawer,
      label: 'Weather',
      icon: 'cloud-lightning',
    },
    'menu-bar': {
      icon: WeatherMenuBarIcon,
      component: WeatherMenuBarContent,
      label: 'Weather',
      priority: 30,
    },
  },
});
