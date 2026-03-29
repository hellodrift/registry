/**
 * Google Workspace API wrapper functions.
 *
 * Each function takes a GwsClient and returns shaped data.
 * Errors are wrapped in GraphQLError for schema resolvers.
 */

import { GraphQLError } from 'graphql';
import type { GwsClient } from './gws-client';
import { GwsError } from './gws-client';
import {
  rawThreadToShape,
  rawEventToShape,
  rawAgendaEventToShape,
  rawFileToShape,
  type GmailThreadShape,
  type GmailMessageShape,
  type CalendarEventShape,
  type DriveFileShape,
  type GwsAuthStatusShape,
  rawMessageToShape,
} from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────────────────────

function wrapGwsError(err: unknown, context: string): never {
  if (err instanceof GraphQLError) throw err;
  if (err instanceof GwsError) {
    throw new GraphQLError(`Google Workspace error: ${err.message}`, {
      extensions: { code: 'GWS_ERROR', exitCode: err.exitCode, context },
    });
  }
  throw err;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export async function checkAuthStatus(client: GwsClient): Promise<GwsAuthStatusShape> {
  const status = await client.authStatus();
  return {
    authenticated: status.token_valid,
    email: status.user,
    tokenError: status.token_error,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Gmail
// ─────────────────────────────────────────────────────────────────────────────

export async function listThreads(
  client: GwsClient,
  input: { query?: string; maxResults?: number },
): Promise<GmailThreadShape[]> {
  try {
    const params: Record<string, unknown> = {};
    if (input.query) params.q = input.query;
    if (input.maxResults) params.maxResults = input.maxResults;
    const result = await client.gmailThreadsList(params);
    const threadStubs = result.threads;
    if (threadStubs.length === 0) return [];

    // threads.list only returns id/snippet — fetch each with metadata to get headers
    const threads = await Promise.all(
      threadStubs.map(async (stub) => {
        try {
          const full = await client.gmailThreadsGetMetadata(stub.id);
          return rawThreadToShape(full);
        } catch {
          // Fall back to stub data if individual fetch fails
          return rawThreadToShape(stub);
        }
      }),
    );
    return threads;
  } catch (err) {
    wrapGwsError(err, 'listThreads');
  }
}

/** Get a thread with full message bodies (for drawer detail view). */
export async function getThread(
  client: GwsClient,
  input: { threadId: string },
): Promise<GmailThreadShape | null> {
  try {
    const result = await client.gmailThreadsGetFull(input.threadId);
    return rawThreadToShape(result);
  } catch (err) {
    wrapGwsError(err, 'getThread');
  }
}

export async function getMessage(
  client: GwsClient,
  input: { messageId: string },
): Promise<GmailMessageShape | null> {
  try {
    const result = await client.gmailMessagesGet(input.messageId);
    return rawMessageToShape(result);
  } catch (err) {
    wrapGwsError(err, 'getMessage');
  }
}

export async function sendEmail(
  client: GwsClient,
  input: { to: string; subject: string; body: string },
): Promise<{ success: boolean; message: string }> {
  try {
    await client.gmailSend(input.to, input.subject, input.body);
    return { success: true, message: 'Email sent successfully' };
  } catch (err) {
    wrapGwsError(err, 'sendEmail');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar
// ─────────────────────────────────────────────────────────────────────────────

export async function getAgenda(client: GwsClient): Promise<CalendarEventShape[]> {
  try {
    const result = await client.calendarAgenda();
    return result.events.map(rawAgendaEventToShape);
  } catch (err) {
    wrapGwsError(err, 'getAgenda');
  }
}

export async function listEvents(
  client: GwsClient,
  input: { timeMin?: string; timeMax?: string; maxResults?: number; query?: string },
): Promise<CalendarEventShape[]> {
  try {
    const params: Record<string, unknown> = {};
    if (input.timeMin) params.timeMin = input.timeMin;
    if (input.timeMax) params.timeMax = input.timeMax;
    if (input.maxResults) params.maxResults = input.maxResults;
    if (input.query) params.q = input.query;
    params.singleEvents = true;
    params.orderBy = 'startTime';
    const result = await client.calendarEventsList(params);
    return result.items.map(rawEventToShape);
  } catch (err) {
    wrapGwsError(err, 'listEvents');
  }
}

export async function getEvent(
  client: GwsClient,
  input: { eventId: string },
): Promise<CalendarEventShape | null> {
  try {
    const result = await client.calendarEventsGet(input.eventId);
    return rawEventToShape(result);
  } catch (err) {
    wrapGwsError(err, 'getEvent');
  }
}

export async function createEvent(
  client: GwsClient,
  input: { summary: string; start: string; end: string; attendees?: string[] },
): Promise<{ success: boolean; message: string }> {
  try {
    await client.calendarInsertEvent(input);
    return { success: true, message: 'Event created successfully' };
  } catch (err) {
    wrapGwsError(err, 'createEvent');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Drive
// ─────────────────────────────────────────────────────────────────────────────

export async function listFiles(
  client: GwsClient,
  input: { query?: string; pageSize?: number },
): Promise<DriveFileShape[]> {
  try {
    const params: Record<string, unknown> = {
      fields: 'files(id,name,mimeType,modifiedTime,createdTime,size,owners,webViewLink,webContentLink,starred,shared)',
    };
    if (input.query) params.q = input.query;
    if (input.pageSize) params.pageSize = input.pageSize;
    if (!input.query) {
      params.orderBy = 'modifiedTime desc';
    }
    const result = await client.driveFilesList(params);
    return result.files.map(rawFileToShape);
  } catch (err) {
    wrapGwsError(err, 'listFiles');
  }
}

export async function getFile(
  client: GwsClient,
  input: { fileId: string },
): Promise<DriveFileShape | null> {
  try {
    const result = await client.driveFilesGet(
      input.fileId,
      'id,name,mimeType,modifiedTime,createdTime,size,owners,webViewLink,webContentLink,starred,shared,parents',
    );
    return rawFileToShape(result);
  } catch (err) {
    wrapGwsError(err, 'getFile');
  }
}
