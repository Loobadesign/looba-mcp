# Looba MCP Server

An [MCP](https://modelcontextprotocol.io) server that gives AI assistants read-only access to [Looba](https://looba.dev) — a community platform for UI snippets and design inspiration.

No API key required. No database credentials. The server calls the public Looba API over HTTPS.

## Install

```bash
npm install -g looba-mcp
```

Or run directly with npx (no install needed):

```bash
npx looba-mcp
```

## Tools

| Tool | Description |
|------|-------------|
| `list_posts` | Search and browse snippet posts with filters (tag, type, sort) |
| `get_post` | Get full HTML/CSS/JS code of a post with author attribution |
| `search_by_author` | List all posts by a specific author |
| `get_popular_tags` | Discover trending tags across the platform |

## Setup

### Claude Code

Add to your project `.mcp.json` or `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "looba": {
      "command": "npx",
      "args": ["-y", "looba-mcp"]
    }
  }
}
```

### Cursor

Go to **Settings > MCP Servers > Add Server**:

- Name: `looba`
- Command: `npx -y looba-mcp`

### Windsurf

Add to `~/.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "looba": {
      "command": "npx",
      "args": ["-y", "looba-mcp"]
    }
  }
}
```

### Other MCP clients

Any MCP-compatible client can use this server via stdio transport:

```bash
npx looba-mcp
```

## Examples

Once connected, ask your AI assistant things like:

- "Show me the most popular CSS snippets on Looba"
- "Find Looba posts tagged with `animation`"
- "Get the code for the post `animated-circle-loaders-html-css-10`"
- "List all posts by @Frontend-snippet-Bot"

Every response includes **source URL**, **author**, and **license** — so AI assistants always cite properly.

## License

MIT
