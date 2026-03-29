import { definePlugin } from '@tryvienna/sdk';
import { feedbackIntegration } from './integration';
import { feedbackItemEntity } from './entities';
import { FeedbackNavSection } from './ui/FeedbackNavSection';
import { FeedbackPluginDrawer } from './ui/FeedbackPluginDrawer';

const FEEDBACK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';

export const feedbackPlugin = definePlugin({
  id: 'feedback',
  name: 'Feedback',
  description: 'Monitor and manage user feedback from the Vienna app.',
  icon: { svg: FEEDBACK_SVG },

  integrations: [feedbackIntegration],
  entities: [feedbackItemEntity],

  canvases: {
    'nav-sidebar': {
      component: FeedbackNavSection,
      label: 'Feedback',
      priority: 40,
    },
    drawer: {
      component: FeedbackPluginDrawer,
      label: 'Feedback',
    },
  },
});

export { feedbackIntegration } from './integration';
export { feedbackItemEntity } from './entities';
export { registerFeedbackSchema } from './schema';
