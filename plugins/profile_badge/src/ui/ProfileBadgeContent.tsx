/**
 * ProfileBadgeContent — Popover showing active profile details.
 */

import type { MenuBarCanvasProps } from '@tryvienna/sdk';
import { usePluginQuery, gql } from '@tryvienna/sdk/react';

const ACTIVE_PROFILE = gql`
  query ActiveContentProfileDetails {
    activeContentProfile {
      name
      isDefault
      isFork
      metadata {
        displayName
        description
        icon
        tags
        sourceUrl
      }
    }
  }
`;

export function ProfileBadgeContent(_props: MenuBarCanvasProps) {
  const { data, loading } = usePluginQuery(ACTIVE_PROFILE);
  const profile = data?.activeContentProfile;

  if (loading && !profile) {
    return <div className="text-sm text-muted-foreground px-2 py-1">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-sm text-muted-foreground px-2 py-1">No active profile</div>;
  }

  const displayName = profile.metadata?.displayName ?? profile.name;
  const icon = profile.metadata?.icon;

  return (
    <div className="flex flex-col gap-2" style={{ minWidth: 260 }}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <div className="text-sm font-semibold">{displayName}</div>
          {profile.metadata?.description && (
            <div className="text-xs text-muted-foreground">
              {profile.metadata.description}
            </div>
          )}
        </div>
      </div>

      {profile.metadata?.tags && profile.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.metadata.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {profile.metadata?.sourceUrl && (
        <div className="text-[10px] text-muted-foreground truncate">
          {profile.metadata.sourceUrl.replace(/\.git$/, '')}
        </div>
      )}

      <div className="border-t border-border pt-1.5 text-[10px] text-muted-foreground">
        Profile: <span className="font-medium text-foreground">{profile.name}</span>
        {profile.isDefault && ' (default)'}
        {profile.isFork && ' (fork)'}
      </div>
    </div>
  );
}
