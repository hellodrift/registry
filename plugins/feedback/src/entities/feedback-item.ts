import { defineEntity } from '@tryvienna/sdk';
import { FEEDBACK_ENTITY_URI_SEGMENTS } from './uri';
import { FeedbackEntityDrawer } from '../ui/FeedbackEntityDrawer';
import { FEEDBACK_SVG } from '../helpers';

export const feedbackItemEntity = defineEntity({
  type: 'feedback_item',
  name: 'Feedback',
  description: 'User feedback submitted through the Vienna app',
  icon: { svg: FEEDBACK_SVG },
  source: 'integration',
  uri: [...FEEDBACK_ENTITY_URI_SEGMENTS],

  display: {
    emoji: '\u{1F4AC}',
    colors: { bg: '#3B82F6', text: '#FFFFFF', border: '#2563EB' },
    description: 'User feedback from Vienna',
    outputFields: [
      { key: 'status', label: 'Status', metadataPath: 'status' },
      { key: 'source', label: 'Source', metadataPath: 'source' },
      { key: 'name', label: 'Name', metadataPath: 'name' },
      { key: 'email', label: 'Email', metadataPath: 'email' },
      { key: 'createdAt', label: 'Submitted', metadataPath: 'createdAt' },
    ],
  },

  cache: { ttl: 30_000, maxSize: 200 },

  ui: { drawer: FeedbackEntityDrawer },
});
