# Looba MCP Server

An [MCP](https://modelcontextprotocol.io) server that gives AI assistants read-only access to [Looba](https://looba.dev) — a community platform for UI snippets and design inspiration.

No API key required. No database credentials. The server calls the public Looba API over HTTPS.

## Install

### npx (no install needed)

```bash
npx looba-mcp
```

### npm

```bash
npm install -g looba-mcp
```

### pip

```bash
pip install looba-mcp
```

### git

```bash
git clone https://github.com/Loobadev/looba-mcp.git
cd looba-mcp
npm install
```

> All methods require [Node.js](https://nodejs.org) 18+ installed on your machine.

## Tools

| Tool | Description |
|------|-------------|
| `list_posts` | Search and browse snippet posts with filters (tag, type, sort) |
| `get_post` | Get full HTML/CSS/JS/JSX/TSX code of a post with author attribution |
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

### Using pip or git install

If you installed via pip or git clone, use `looba-mcp` or `node` directly:

```json
{
  "mcpServers": {
    "looba": {
      "command": "looba-mcp"
    }
  }
}
```

Or with git clone:

```json
{
  "mcpServers": {
    "looba": {
      "command": "node",
      "args": ["/path/to/looba-mcp/index.js"]
    }
  }
}
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
