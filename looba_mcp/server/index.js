#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const LOOBA_ORIGIN = process.env.LOOBA_ORIGIN || "https://looba.dev";
const MAX_LIST_LIMIT = 30;

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

async function api(path, params = {}) {
  const url = new URL(path, LOOBA_ORIGIN);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(ts) {
  if (!ts) return "unknown";
  const ms = Number(ts) > 1e12 ? Number(ts) : Number(ts) * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

function postUrl(slug) {
  return `${LOOBA_ORIGIN}/post=${slug}`;
}

function userUrl(username) {
  return `${LOOBA_ORIGIN}/user=${username}`;
}

function formatAuthor(row) {
  const name = row.display_name || row.username;
  return `${name} (@${row.username})`;
}

function attributionBlock(post, author) {
  return [
    "---",
    `Source: ${postUrl(post.slug)}`,
    `Author: ${formatAuthor(author)} — ${userUrl(author.username)}`,
    `License: ${post.license_name || "MIT License"}`,
    "Platform: Looba (looba.dev)",
    "---",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "looba",
  version: "1.0.0",
});

// ---- Tool: list_posts ----

server.tool(
  "list_posts",
  "List Looba snippet posts with optional search, tag filter, and sorting. " +
    "Returns titles, authors, tags, and URLs. Use get_post for full code.",
  {
    query: z
      .string()
      .optional()
      .describe("Search term to filter posts by title, description, author, or tags"),
    tag: z.string().optional().describe("Filter by exact tag name"),
    snippet_type: z
      .enum(["classic", "react", "tailwind", "all"])
      .optional()
      .describe("Filter by snippet type (default: all)"),
    sort: z
      .enum(["recent", "popular", "views"])
      .optional()
      .describe("Sort order (default: popular)"),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe("Page number (default: 1)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_LIST_LIMIT)
      .optional()
      .describe(`Results per page, max ${MAX_LIST_LIMIT} (default: 12)`),
  },
  async ({ query: searchQuery, tag, snippet_type, sort, page, limit }) => {
    const effectiveLimit = Math.min(limit || 12, MAX_LIST_LIMIT);
    const effectivePage = page || 1;
    const offset = (effectivePage - 1) * effectiveLimit;

    const data = await api("/api/snippets/list", {
      q: searchQuery,
      tag,
      snippet_type,
      sort: sort || "popular",
      page: effectivePage,
      limit: effectiveLimit,
    });

    const posts = data.posts || [];
    const total = data.total ?? posts.length;

    const lines = posts.map((r, i) => {
      const num = offset + i + 1;
      const author = r.display_name || r.username;
      const authorFull = `${author} (@${r.username})`;
      const tags = (r.tags || []).join(", ");
      const views = Number(r.view_count || 0);
      const downloads = Number(r.download_count || 0);
      return [
        `${num}. **${r.title}** (${r.snippet_type || "classic"})`,
        `   Author: ${authorFull}`,
        `   Tags: ${tags || "none"}`,
        `   Views: ${views} | Downloads: ${downloads} | Published: ${formatDate(r.created_at)}`,
        `   URL: ${postUrl(r.slug)}`,
      ].join("\n");
    });

    const header = `Found ${total} posts (showing ${offset + 1}–${offset + posts.length}):`;
    return { content: [{ type: "text", text: [header, "", ...lines].join("\n") }] };
  }
);

// ---- Tool: get_post ----

server.tool(
  "get_post",
  "Get full details of a Looba snippet post including HTML, CSS, and JS code, " +
    "author info, and license. Always cite the source and author when using this data.",
  {
    slug: z.string().describe("The post slug (from the URL /post=<slug>)"),
  },
  async ({ slug }) => {
    const sanitizedSlug = String(slug || "").trim();
    if (!sanitizedSlug) {
      return { content: [{ type: "text", text: "Error: slug is required." }] };
    }

    const data = await api("/api/snippets/one", { slug: sanitizedSlug });
    const post = data.post;
    const author = data.author;

    if (!post) {
      return { content: [{ type: "text", text: `No post found with slug "${sanitizedSlug}".` }] };
    }

    const html = post.html || "";
    const css = post.css || "";
    const js = post.js || "";
    const snippetType = post.snippet_type || "classic";

    const sections = [attributionBlock(post, author), ""];

    sections.push(`# ${post.title}`);
    if (post.description) sections.push("", post.description);
    sections.push(
      "",
      `Type: ${snippetType}`,
      `Tags: ${(post.tags || []).join(", ") || "none"}`,
      `Views: ${Number(post.view_count || 0)} | Downloads: ${Number(post.download_count || 0)}`,
      `Published: ${formatDate(post.created_at)}`,
      `Updated: ${formatDate(post.updated_at)}`
    );

    if (snippetType === "classic") {
      if (html) sections.push("", "## HTML", "```html", html, "```");
      if (css) sections.push("", "## CSS", "```css", css, "```");
      if (js) sections.push("", "## JavaScript", "```javascript", js, "```");
    } else if (snippetType === "react") {
      const jsx = post.snippet_jsx || "";
      const styles = post.styles_css || "";
      if (jsx) sections.push("", "## JSX", "```jsx", jsx, "```");
      if (styles) sections.push("", "## Styles (CSS)", "```css", styles, "```");
      if (html) sections.push("", "## HTML (host)", "```html", html, "```");
    } else if (snippetType === "tailwind") {
      if (html) sections.push("", "## HTML (Tailwind)", "```html", html, "```");
      if (css) sections.push("", "## CSS", "```css", css, "```");
      if (js) sections.push("", "## JavaScript", "```javascript", js, "```");
    }

    sections.push("", attributionBlock(post, author));

    return { content: [{ type: "text", text: sections.join("\n") }] };
  }
);

// ---- Tool: search_by_author ----

server.tool(
  "search_by_author",
  "List all Looba snippet posts by a specific author (username).",
  {
    username: z.string().describe("The author's username"),
    page: z.number().int().min(1).optional().describe("Page number (default: 1)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_LIST_LIMIT)
      .optional()
      .describe(`Results per page, max ${MAX_LIST_LIMIT} (default: 12)`),
  },
  async ({ username, page, limit }) => {
    const sanitizedUsername = String(username || "").trim();
    if (!sanitizedUsername) {
      return { content: [{ type: "text", text: "Error: username is required." }] };
    }

    const effectiveLimit = Math.min(limit || 12, MAX_LIST_LIMIT);
    const effectivePage = page || 1;
    const offset = (effectivePage - 1) * effectiveLimit;

    const data = await api("/api/snippets/by-user", {
      username: sanitizedUsername,
      page: effectivePage,
      limit: effectiveLimit,
    });

    const posts = data.posts || [];
    const total = data.pagination?.total ?? posts.length;

    if (total === 0) {
      return {
        content: [{ type: "text", text: `No posts found for author "${sanitizedUsername}".` }],
      };
    }

    const lines = posts.map((r, i) => {
      const num = offset + i + 1;
      return [
        `${num}. **${r.title}** (${r.snippet_type || "classic"})`,
        `   Tags: ${(r.tags || []).join(", ") || "none"}`,
        `   Published: ${formatDate(r.created_at)}`,
        `   URL: ${postUrl(r.slug)}`,
      ].join("\n");
    });

    const header = `Posts by @${sanitizedUsername} — ${total} total (showing ${offset + 1}–${offset + posts.length}):`;
    return { content: [{ type: "text", text: [header, "", ...lines].join("\n") }] };
  }
);

// ---- Tool: get_popular_tags ----

server.tool(
  "get_popular_tags",
  "Get the most used tags across all Looba snippet posts.",
  {
    limit: z
      .number()
      .int()
      .min(1)
      .max(30)
      .optional()
      .describe("Number of tags to return (default: 15)"),
  },
  async ({ limit }) => {
    const effectiveLimit = limit || 15;

    const data = await api("/api/tags/popular", { limit: effectiveLimit });
    const tags = data.tags || [];

    const lines = tags.map(
      (r, i) => `${i + 1}. **${r.tag}** (${r.count} posts)`
    );

    return {
      content: [
        { type: "text", text: ["Popular tags on Looba:", "", ...lines].join("\n") },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
