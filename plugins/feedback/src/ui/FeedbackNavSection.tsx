/**
 * FeedbackNavSection — Nav sidebar canvas for the Feedback plugin.
 *
 * Shows a list of user feedback with status indicators.
 * Settings button opens the FeedbackSettingsDrawer.
 */

import { useState, useEffect, useCallback } from 'react';
import { usePluginQuery } from '@tryvienna/sdk/react';
import {
  NavSection,
  NavItem,
  NavSettingsButton,
  NavHeaderActions,
} from '@tryvienna/ui';
import type { NavSidebarCanvasProps } from '@tryvienna/sdk';
import { Settings } from 'lucide-react';
import { useFeedbackSettings } from './useFeedbackSettings';
import { STATUS_COLORS, STATUS_LABELS, formatRelative } from '../helpers';
import { GET_FEEDBACK_ITEMS } from '../client/operations';

// ─────────────────────────────────────────────────────────────────────────────
// Types & helpers
// ─────────────────────────────────────────────────────────────────────────────

interface FeedbackNav {
  id: string;
  message: string;
  name: string | null;
  email: string | null;
  source: string;
  status: string;
  createdAt: string;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function groupFeedback(items: FeedbackNav[], groupBy: string): Map<string, FeedbackNav[]> {
  const groups = new Map<string, FeedbackNav[]>();
  for (const item of items) {
    let key: string;
    switch (groupBy) {
      case 'status':
        key = STATUS_LABELS[item.status] || item.status;
        break;
      case 'source':
        key = item.source.charAt(0).toUpperCase() + item.source.slice(1);
        break;
      default:
        key = '';
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return groups;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FeedbackNavItem({ item, onSelect }: { item: FeedbackNav; onSelect: () => void }) {
  const statusColor = STATUS_COLORS[item.status] || '#6B7280';
  return (
    <NavItem
      item={{
        id: item.id,
        label: truncate(item.message, 55),
        variant: 'item' as const,
        meta: (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: statusColor,
                flexShrink: 0,
              }}
            />
            <span>{formatRelative(item.createdAt)}</span>
          </span>
        ),
      }}
      onSelect={onSelect}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function FeedbackNavSection({
  pluginId,
  openPluginDrawer,
  openEntityDrawer,
  hostApi,
}: NavSidebarCanvasProps) {
  const { settings } = useFeedbackSettings();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const keys = await hostApi.getCredentialStatus('feedback');
        if (cancelled) return;
        const hasKeys = keys.filter((k) => k.isSet).length >= 2; // need both api_key and base_url
        setIsAuthenticated(hasKeys);
      } catch {
        // ignore
      }
    };
    check();
    const handler = () => { check(); };
    window.addEventListener('vienna-plugin:feedback:credentials-changed', handler);
    return () => { cancelled = true; window.removeEventListener('vienna-plugin:feedback:credentials-changed', handler); };
  }, [hostApi]);

  const { data, loading, error } = usePluginQuery<{ feedbackItems: FeedbackNav[] }>(GET_FEEDBACK_ITEMS, {
    variables: {
      limit: settings.limit,
      status: settings.statusFilter === 'all' ? undefined : settings.statusFilter,
    },
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const items: FeedbackNav[] = data?.feedbackItems ?? [];

  const handleItemSelect = useCallback((item: FeedbackNav) => {
    openEntityDrawer(`@drift//feedback_item/${item.id}`);
  }, [openEntityDrawer]);

  const sectionData = {
    id: `plugin-${pluginId}-nav`,
    label: `Feedback${items.length ? ` (${items.length})` : ''}`,
    items: [],
    isLoading: isAuthenticated && loading && !data,
    hoverActions: (
      <NavHeaderActions>
        <NavSettingsButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openPluginDrawer({ view: 'settings' });
          }}
          ariaLabel="Feedback settings"
        />
      </NavHeaderActions>
    ),
    emptyState: !isAuthenticated
      ? 'Configure API connection in settings'
      : error && !data
        ? error.message
        : 'No feedback found',
  };

  // Not configured
  if (!isAuthenticated) {
    return (
      <NavSection section={sectionData} defaultExpanded>
        <NavItem
          item={{
            id: 'setup',
            label: 'Open Settings to configure',
            variant: 'item',
            icon: <Settings size={14} />,
          }}
          onSelect={() => openPluginDrawer({ view: 'settings' })}
        />
      </NavSection>
    );
  }

  // Grouped view
  if (settings.groupBy !== 'none' && items.length > 0) {
    const groups = groupFeedback(items, settings.groupBy);

    return (
      <NavSection section={sectionData} defaultExpanded>
        {Array.from(groups.entries()).map(([groupName, groupItems]) => (
          <div key={groupName}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '8px 12px 2px',
              }}
            >
              {groupName}
            </div>
            {groupItems.map((item) => (
              <FeedbackNavItem
                key={item.id}
                item={item}
                onSelect={() => handleItemSelect(item)}
              />
            ))}
          </div>
        ))}
      </NavSection>
    );
  }

  // Flat view
  return (
    <NavSection section={sectionData} defaultExpanded>
      {items.map((item) => (
        <FeedbackNavItem
          key={item.id}
          item={item}
          onSelect={() => handleItemSelect(item)}
        />
      ))}
    </NavSection>
  );
}
