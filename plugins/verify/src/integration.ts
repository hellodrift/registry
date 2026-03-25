/**
 * Verify Work integration — no auth needed, just schema registration.
 */

import { defineIntegration } from '@tryvienna/sdk';
import { registerVerifySchema } from './schema';

export const verifyIntegration = defineIntegration({
  id: 'verify',
  name: 'Verify Work',
  description: 'Read testing instructions and launch verification commands',
  icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6a5 5 0 0 0 10 0v-6"/><path d="M12 11V3"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/></svg>' },

  createClient: async () => null,
  schema: registerVerifySchema,
});
