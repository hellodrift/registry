# Drift Official Registry

Shareable content for [Drift](https://github.com/hellodrift) — quick actions, and more to come.

## Structure

```
registry.json                  # Registry metadata
quick-actions/
  _index.json                  # Quick action definitions (array)
  _defaults.json               # Default enabled quick action IDs
```

## Quick Actions

Quick actions are pre-built prompts that appear in the Drift workstream composer. Each action has multiple options users can choose from.

### Schema

Each entry in `quick-actions/_index.json`:

```json
{
  "id": "unique-id",
  "label": "Display label",
  "icon": "emoji",
  "description": "Short description",
  "author": { "name": "Author Name" },
  "tags": ["tag1", "tag2"],
  "options": [
    {
      "id": "option-id",
      "label": "Option display text",
      "prompt": "The actual prompt sent to the agent"
    }
  ]
}
```

## Adding this registry

This is the default official registry — it's automatically added when you first use Drift. To manually add it:

**URL:** `https://github.com/hellodrift/registry.git`
