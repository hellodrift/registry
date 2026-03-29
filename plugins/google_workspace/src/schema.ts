/**
 * Google Workspace GraphQL schema registration.
 *
 * Registers all GWS-specific GraphQL types, queries, mutations,
 * and entity handlers on the Pothos builder.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { GraphQLError } from 'graphql';
import { buildEntityURI } from '@tryvienna/sdk';
import type { BaseEntity } from '@tryvienna/sdk';
import { gmailThreadEntity, calendarEventEntity, driveFileEntity } from './entities';
import { GMAIL_THREAD_URI_PATH, CALENDAR_EVENT_URI_PATH, DRIVE_FILE_URI_PATH } from './entities/uri';
import { googleWorkspaceIntegration } from './integration';
import { GwsClient } from './gws-client';
import * as api from './api';
import type {
  GmailThreadShape,
  GmailMessageShape,
  CalendarEventShape,
  CalendarAttendeeShape,
  DriveFileShape,
  GwsAuthStatusShape,
} from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getGwsClient(ctx: any): Promise<GwsClient> {
  const client = await ctx.getIntegrationClient?.('google_workspace');
  if (!client) {
    throw new GraphQLError('Google Workspace not connected. Run `gws auth login` in your terminal.', {
      extensions: { code: 'INTEGRATION_NOT_AVAILABLE' },
    });
  }
  return client as GwsClient;
}

async function getGwsClientOrNull(ctx: any): Promise<GwsClient | null> {
  const client = await ctx.getIntegrationClient?.('google_workspace');
  return (client as GwsClient) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerGoogleWorkspaceSchema(rawBuilder: unknown): void {
  const builder = rawBuilder as any;

  // ── Object Types ─────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GwsAuthStatusRef = builder.objectRef<GwsAuthStatusShape>('GwsAuthStatus');
  builder.objectType(GwsAuthStatusRef, {
    description: 'Google Workspace CLI authentication status',
    fields: (t) => ({
      authenticated: t.exposeBoolean('authenticated'),
      email: t.exposeString('email', { nullable: true }),
      tokenError: t.exposeString('tokenError', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GwsMutationResultRef = builder.objectRef<{ success: boolean; message: string }>('GwsMutationResult');
  builder.objectType(GwsMutationResultRef, {
    description: 'Result of a Google Workspace mutation',
    fields: (t) => ({
      success: t.exposeBoolean('success'),
      message: t.exposeString('message'),
    }),
  });

  // ── Gmail Types ──────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GmailMessageRef = builder.objectRef<GmailMessageShape>('GmailMessage');
  builder.objectType(GmailMessageRef, {
    description: 'A single email message',
    fields: (t) => ({
      id: t.exposeString('id'),
      threadId: t.exposeString('threadId'),
      from: t.exposeString('from', { nullable: true }),
      to: t.exposeString('to', { nullable: true }),
      subject: t.exposeString('subject', { nullable: true }),
      date: t.exposeString('date', { nullable: true }),
      snippet: t.exposeString('snippet', { nullable: true }),
      body: t.exposeString('body', { nullable: true }),
      bodyHtml: t.exposeString('bodyHtml', { nullable: true }),
      labelIds: t.exposeStringList('labelIds', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const GmailThreadRef = builder.objectRef<GmailThreadShape>('GmailThread');
  builder.objectType(GmailThreadRef, {
    description: 'A Gmail email thread',
    fields: (t) => ({
      id: t.exposeString('id'),
      snippet: t.exposeString('snippet', { nullable: true }),
      subject: t.exposeString('subject', { nullable: true }),
      from: t.exposeString('from', { nullable: true }),
      to: t.exposeString('to', { nullable: true }),
      date: t.exposeString('date', { nullable: true }),
      unread: t.exposeBoolean('unread', { nullable: true }),
      messageCount: t.exposeInt('messageCount', { nullable: true }),
      labelIds: t.exposeStringList('labelIds', { nullable: true }),
      messages: t.field({
        type: [GmailMessageRef],
        nullable: true,
        resolve: (thread) => thread.messages ?? null,
      }),
    }),
  });

  // ── Calendar Types ───────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const CalendarAttendeeRef = builder.objectRef<CalendarAttendeeShape>('CalendarAttendee');
  builder.objectType(CalendarAttendeeRef, {
    description: 'An attendee of a calendar event',
    fields: (t) => ({
      email: t.exposeString('email'),
      displayName: t.exposeString('displayName', { nullable: true }),
      responseStatus: t.exposeString('responseStatus', { nullable: true }),
      self: t.exposeBoolean('self', { nullable: true }),
    }),
  });

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const CalendarEventRef = builder.objectRef<CalendarEventShape>('CalendarEvent');
  builder.objectType(CalendarEventRef, {
    description: 'A Google Calendar event',
    fields: (t) => ({
      id: t.exposeString('id'),
      summary: t.exposeString('summary', { nullable: true }),
      description: t.exposeString('description', { nullable: true }),
      location: t.exposeString('location', { nullable: true }),
      start: t.exposeString('start', { nullable: true }),
      end: t.exposeString('end', { nullable: true }),
      startFormatted: t.exposeString('startFormatted', { nullable: true }),
      endFormatted: t.exposeString('endFormatted', { nullable: true }),
      allDay: t.exposeBoolean('allDay', { nullable: true }),
      status: t.exposeString('status', { nullable: true }),
      htmlLink: t.exposeString('htmlLink', { nullable: true }),
      organizer: t.exposeString('organizer', { nullable: true }),
      hangoutLink: t.exposeString('hangoutLink', { nullable: true }),
      attendeeNames: t.exposeString('attendeeNames', { nullable: true }),
      createdAt: t.exposeString('createdAt', { nullable: true }),
      updatedAt: t.exposeString('updatedAt', { nullable: true }),
      attendees: t.field({
        type: [CalendarAttendeeRef],
        nullable: true,
        resolve: (event) => event.attendees ?? null,
      }),
    }),
  });

  // ── Drive Types ──────────────────────────────────────────────────────────

  // @ts-expect-error — builder type args not available across .d.ts boundary
  const DriveFileRef = builder.objectRef<DriveFileShape>('DriveFile');
  builder.objectType(DriveFileRef, {
    description: 'A Google Drive file',
    fields: (t) => ({
      id: t.exposeString('id'),
      name: t.exposeString('name'),
      mimeType: t.exposeString('mimeType'),
      mimeTypeLabel: t.exposeString('mimeTypeLabel', { nullable: true }),
      modifiedTime: t.exposeString('modifiedTime', { nullable: true }),
      createdTime: t.exposeString('createdTime', { nullable: true }),
      size: t.exposeString('size', { nullable: true }),
      ownerName: t.exposeString('ownerName', { nullable: true }),
      ownerEmail: t.exposeString('ownerEmail', { nullable: true }),
      webViewLink: t.exposeString('webViewLink', { nullable: true }),
      webContentLink: t.exposeString('webContentLink', { nullable: true }),
      starred: t.exposeBoolean('starred', { nullable: true }),
      shared: t.exposeBoolean('shared', { nullable: true }),
    }),
  });

  // ── Queries ──────────────────────────────────────────────────────────────

  builder.queryFields((t) => ({
    gwsAuthStatus: t.field({
      type: GwsAuthStatusRef,
      description: 'Check gws CLI authentication status',
      resolve: async (_root, _args, ctx) => {
        // Always create a fresh client to check auth — don't rely on integration client
        // since it returns null when token is expired
        const tempClient = new GwsClient();
        return api.checkAuthStatus(tempClient);
      },
    }),

    // ── Gmail Queries ────────────────────────────────────────────────────

    gmailThreads: t.field({
      type: [GmailThreadRef],
      description: 'List Gmail threads. Returns empty array if not authenticated.',
      args: {
        query: t.arg.string({ description: 'Gmail search query (e.g. "is:unread", "from:alice@")' }),
        limit: t.arg.int({ defaultValue: 20, description: 'Max threads to return' }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClientOrNull(ctx);
        if (!client) return [];
        return api.listThreads(client, {
          query: args.query ?? undefined,
          maxResults: args.limit ?? 20,
        });
      },
    }),

    gmailThread: t.field({
      type: GmailThreadRef,
      nullable: true,
      description: 'Get a single Gmail thread by ID',
      args: { threadId: t.arg.string({ required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClient(ctx);
        return api.getThread(client, { threadId: args.threadId });
      },
    }),

    // ── Calendar Queries ─────────────────────────────────────────────────

    calendarAgenda: t.field({
      type: [CalendarEventRef],
      description: 'Get upcoming calendar events (agenda view). Returns empty array if not authenticated.',
      resolve: async (_root, _args, ctx) => {
        const client = await getGwsClientOrNull(ctx);
        if (!client) return [];
        return api.getAgenda(client);
      },
    }),

    calendarEvents: t.field({
      type: [CalendarEventRef],
      description: 'List calendar events with filters',
      args: {
        timeMin: t.arg.string({ description: 'Start of time range (ISO 8601)' }),
        timeMax: t.arg.string({ description: 'End of time range (ISO 8601)' }),
        query: t.arg.string({ description: 'Free-text search query' }),
        limit: t.arg.int({ defaultValue: 20, description: 'Max events to return' }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClientOrNull(ctx);
        if (!client) return [];
        return api.listEvents(client, {
          timeMin: args.timeMin ?? undefined,
          timeMax: args.timeMax ?? undefined,
          query: args.query ?? undefined,
          maxResults: args.limit ?? 20,
        });
      },
    }),

    calendarEvent: t.field({
      type: CalendarEventRef,
      nullable: true,
      description: 'Get a single calendar event by ID',
      args: { eventId: t.arg.string({ required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClient(ctx);
        return api.getEvent(client, { eventId: args.eventId });
      },
    }),

    // ── Drive Queries ────────────────────────────────────────────────────

    driveFiles: t.field({
      type: [DriveFileRef],
      description: 'List Google Drive files. Returns empty array if not authenticated.',
      args: {
        query: t.arg.string({ description: 'Drive search query (e.g. "name contains \'report\'")' }),
        limit: t.arg.int({ defaultValue: 20, description: 'Max files to return' }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClientOrNull(ctx);
        if (!client) return [];
        return api.listFiles(client, {
          query: args.query ?? undefined,
          pageSize: args.limit ?? 20,
        });
      },
    }),

    driveFile: t.field({
      type: DriveFileRef,
      nullable: true,
      description: 'Get a single Drive file by ID',
      args: { fileId: t.arg.string({ required: true }) },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClient(ctx);
        return api.getFile(client, { fileId: args.fileId });
      },
    }),
  }));

  // ── Mutations ──────────────────────────────────────────────────────────

  builder.mutationFields((t) => ({
    gwsSendEmail: t.field({
      type: GwsMutationResultRef,
      description: 'Send an email via Gmail',
      args: {
        to: t.arg.string({ required: true }),
        subject: t.arg.string({ required: true }),
        body: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClient(ctx);
        return api.sendEmail(client, {
          to: args.to,
          subject: args.subject,
          body: args.body,
        });
      },
    }),

    gwsCreateEvent: t.field({
      type: GwsMutationResultRef,
      description: 'Create a new Google Calendar event',
      args: {
        summary: t.arg.string({ required: true }),
        start: t.arg.string({ required: true, description: 'Start time (ISO 8601)' }),
        end: t.arg.string({ required: true, description: 'End time (ISO 8601)' }),
        attendees: t.arg.stringList({ description: 'Attendee email addresses' }),
      },
      resolve: async (_root, args, ctx) => {
        const client = await getGwsClient(ctx);
        return api.createEvent(client, {
          summary: args.summary,
          start: args.start,
          end: args.end,
          attendees: args.attendees ?? undefined,
        });
      },
    }),
  }));

  // ── Entity Handler Registration ──────────────────────────────────────────

  builder.registerEntityHandlers(gmailThreadEntity, {
    integrations: { google_workspace: googleWorkspaceIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.google_workspace.client as GwsClient;
      if (!client) return null;
      try {
        const thread = await api.getThread(client, { threadId: id['threadId'] });
        if (!thread) return null;
        return {
          id: thread.id,
          type: 'gmail_thread',
          uri: buildEntityURI('gmail_thread', id, GMAIL_THREAD_URI_PATH),
          title: thread.subject ?? '(no subject)',
          description: thread.snippet ?? `From: ${thread.from ?? 'Unknown'}`,
          createdAt: thread.date ? new Date(thread.date).getTime() : undefined,
        } as BaseEntity;
      } catch {
        return null;
      }
    },
    search: async (query, ctx) => {
      const client = ctx.integrations.google_workspace.client as GwsClient;
      if (!client) return [];
      try {
        const threads = await api.listThreads(client, {
          query: query.query || '',
          maxResults: query.limit ?? 20,
        });
        return threads.map((thread) => ({
          id: thread.id,
          type: 'gmail_thread',
          uri: buildEntityURI('gmail_thread', { threadId: thread.id }, GMAIL_THREAD_URI_PATH),
          title: thread.subject ?? '(no subject)',
          description: thread.snippet ?? `From: ${thread.from ?? 'Unknown'}`,
          createdAt: thread.date ? new Date(thread.date).getTime() : undefined,
        } as BaseEntity));
      } catch {
        return [];
      }
    },
    resolveContext: async (entity) => {
      return `### Gmail Thread: ${entity.title}\n- **URI:** ${entity.uri}\n- ${entity.description ?? ''}`;
    },
  });

  builder.registerEntityHandlers(calendarEventEntity, {
    integrations: { google_workspace: googleWorkspaceIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.google_workspace.client as GwsClient;
      if (!client) return null;
      try {
        const event = await api.getEvent(client, { eventId: id['eventId'] });
        if (!event) return null;
        return {
          id: event.id,
          type: 'calendar_event',
          uri: buildEntityURI('calendar_event', id, CALENDAR_EVENT_URI_PATH),
          title: event.summary ?? '(no title)',
          description: event.startFormatted ? `${event.startFormatted}${event.location ? ` \u2022 ${event.location}` : ''}` : undefined,
          createdAt: event.createdAt ? new Date(event.createdAt).getTime() : undefined,
          updatedAt: event.updatedAt ? new Date(event.updatedAt).getTime() : undefined,
        } as BaseEntity;
      } catch {
        return null;
      }
    },
    search: async (query, ctx) => {
      const client = ctx.integrations.google_workspace.client as GwsClient;
      if (!client) return [];
      try {
        const events = await api.listEvents(client, {
          query: query.query || undefined,
          maxResults: query.limit ?? 20,
        });
        return events.map((event) => ({
          id: event.id,
          type: 'calendar_event',
          uri: buildEntityURI('calendar_event', { eventId: event.id }, CALENDAR_EVENT_URI_PATH),
          title: event.summary ?? '(no title)',
          description: event.startFormatted ?? undefined,
          createdAt: event.createdAt ? new Date(event.createdAt).getTime() : undefined,
        } as BaseEntity));
      } catch {
        return [];
      }
    },
    resolveContext: async (entity) => {
      return `### Calendar Event: ${entity.title}\n- **URI:** ${entity.uri}\n- ${entity.description ?? ''}`;
    },
  });

  builder.registerEntityHandlers(driveFileEntity, {
    integrations: { google_workspace: googleWorkspaceIntegration },
    resolve: async (id, ctx) => {
      const client = ctx.integrations.google_workspace.client as GwsClient;
      if (!client) return null;
      try {
        const file = await api.getFile(client, { fileId: id['fileId'] });
        if (!file) return null;
        return {
          id: file.id,
          type: 'drive_file',
          uri: buildEntityURI('drive_file', id, DRIVE_FILE_URI_PATH),
          title: file.name,
          description: `${file.mimeTypeLabel ?? file.mimeType}${file.ownerName ? ` \u2022 ${file.ownerName}` : ''}`,
          updatedAt: file.modifiedTime ? new Date(file.modifiedTime).getTime() : undefined,
        } as BaseEntity;
      } catch {
        return null;
      }
    },
    search: async (query, ctx) => {
      const client = ctx.integrations.google_workspace.client as GwsClient;
      if (!client) return [];
      try {
        const searchQuery = query.query ? `name contains '${query.query.replace(/'/g, "\\'")}'` : undefined;
        const files = await api.listFiles(client, {
          query: searchQuery,
          pageSize: query.limit ?? 20,
        });
        return files.map((file) => ({
          id: file.id,
          type: 'drive_file',
          uri: buildEntityURI('drive_file', { fileId: file.id }, DRIVE_FILE_URI_PATH),
          title: file.name,
          description: file.mimeTypeLabel ?? file.mimeType,
          updatedAt: file.modifiedTime ? new Date(file.modifiedTime).getTime() : undefined,
        } as BaseEntity));
      } catch {
        return [];
      }
    },
    resolveContext: async (entity) => {
      return `### Drive File: ${entity.title}\n- **URI:** ${entity.uri}\n- ${entity.description ?? ''}`;
    },
  });
}
