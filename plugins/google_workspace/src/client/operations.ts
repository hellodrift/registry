/**
 * GraphQL query and mutation documents for the Google Workspace plugin UI.
 */

import { gql } from 'graphql-tag';

// ── Auth ─────────────────────────────────────────────────────────────────────

export const GET_GWS_AUTH_STATUS = gql`
  query GetGwsAuthStatus {
    gwsAuthStatus {
      authenticated
      email
      tokenError
    }
  }
`;

// ── Gmail ────────────────────────────────────────────────────────────────────

export const GET_GMAIL_THREADS = gql`
  query GetGmailThreads($query: String, $limit: Int) {
    gmailThreads(query: $query, limit: $limit) {
      id
      subject
      from
      date
      snippet
      unread
      messageCount
    }
  }
`;

export const GET_GMAIL_THREAD = gql`
  query GetGmailThread($threadId: String!) {
    gmailThread(threadId: $threadId) {
      id
      subject
      from
      to
      date
      snippet
      unread
      messageCount
      labelIds
      messages {
        id
        threadId
        from
        to
        subject
        date
        snippet
        body
        bodyHtml
        labelIds
      }
    }
  }
`;

// ── Calendar ─────────────────────────────────────────────────────────────────

export const GET_CALENDAR_AGENDA = gql`
  query GetCalendarAgenda {
    calendarAgenda {
      id
      summary
      start
      end
      startFormatted
      endFormatted
      allDay
      location
      hangoutLink
      htmlLink
    }
  }
`;

export const GET_CALENDAR_EVENTS = gql`
  query GetCalendarEvents($timeMin: String, $timeMax: String, $query: String, $limit: Int) {
    calendarEvents(timeMin: $timeMin, timeMax: $timeMax, query: $query, limit: $limit) {
      id
      summary
      start
      end
      startFormatted
      endFormatted
      allDay
      location
      hangoutLink
      htmlLink
    }
  }
`;

export const GET_CALENDAR_EVENT = gql`
  query GetCalendarEvent($eventId: String!) {
    calendarEvent(eventId: $eventId) {
      id
      summary
      description
      location
      start
      end
      startFormatted
      endFormatted
      allDay
      status
      htmlLink
      organizer
      hangoutLink
      attendeeNames
      createdAt
      updatedAt
      attendees {
        email
        displayName
        responseStatus
        self
      }
    }
  }
`;

// ── Drive ────────────────────────────────────────────────────────────────────

export const GET_DRIVE_FILES = gql`
  query GetDriveFiles($query: String, $limit: Int) {
    driveFiles(query: $query, limit: $limit) {
      id
      name
      mimeType
      mimeTypeLabel
      modifiedTime
      ownerName
      webViewLink
    }
  }
`;

export const GET_DRIVE_FILE = gql`
  query GetDriveFile($fileId: String!) {
    driveFile(fileId: $fileId) {
      id
      name
      mimeType
      mimeTypeLabel
      modifiedTime
      createdTime
      size
      ownerName
      ownerEmail
      webViewLink
      webContentLink
      starred
      shared
    }
  }
`;

// ── Mutations ────────────────────────────────────────────────────────────────

export const SEND_GMAIL_EMAIL = gql`
  mutation SendGmailEmail($to: String!, $subject: String!, $body: String!) {
    gwsSendEmail(to: $to, subject: $subject, body: $body) {
      success
      message
    }
  }
`;

export const CREATE_CALENDAR_EVENT = gql`
  mutation CreateCalendarEvent($summary: String!, $start: String!, $end: String!, $attendees: [String!]) {
    gwsCreateEvent(summary: $summary, start: $start, end: $end, attendees: $attendees) {
      success
      message
    }
  }
`;
