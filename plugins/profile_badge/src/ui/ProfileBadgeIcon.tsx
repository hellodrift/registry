/**
 * ProfileBadgeIcon — Menu-bar icon showing the active profile's emoji.
 */

import type { MenuBarIconProps } from '@tryvienna/sdk';
import { usePluginQuery, gql } from '@tryvienna/sdk/react';

const ACTIVE_PROFILE = gql`
  query ActiveContentProfileBadge {
    activeContentProfile {
      name
      metadata {
        icon
        displayName
      }
    }
  }
`;

export function ProfileBadgeIcon(_props: MenuBarIconProps) {
  const { data } = usePluginQuery(ACTIVE_PROFILE, { pollInterval: 5000 });
  const icon = data?.activeContentProfile?.metadata?.icon;

  return (
    <span className="text-[13px] leading-none">
      {icon || '👤'}
    </span>
  );
}
