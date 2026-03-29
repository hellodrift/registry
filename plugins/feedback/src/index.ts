import { definePlugin } from '@tryvienna/sdk';
import { feedbackIntegration } from './integration';
import { feedbackItemEntity } from './entities';
import { FeedbackNavSection } from './ui/FeedbackNavSection';
import { FeedbackPluginDrawer } from './ui/FeedbackPluginDrawer';
import { FEEDBACK_SVG } from './helpers';

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
