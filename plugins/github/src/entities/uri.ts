/**
 * Shared URI segment definitions for GitHub entities.
 *
 * Centralised here so both entity definitions and UI drawer components
 * can reference the same segments without circular imports.
 */

/** URI segments shared by github_pr and github_issue: @drift//{type}/{owner}/{repo}/{number} */
export const GITHUB_ENTITY_URI_SEGMENTS = ['owner', 'repo', 'number'] as const;

/** URI path config for parseEntityURI */
export const GITHUB_URI_PATH = { segments: GITHUB_ENTITY_URI_SEGMENTS as readonly string[] };
