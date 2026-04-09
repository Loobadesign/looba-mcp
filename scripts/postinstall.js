#!/usr/bin/env node

const lines = [
  "",
  "Looba MCP has been installed successfully.",
  "",
  "You are all set. Here are the available commands:",
  "",
  "Tool                Description",
  "list_posts          Search and browse snippet posts with filters (tag, type, sort)",
  "get_post            Get full HTML/CSS/JS code of a post with author attribution",
  "integrate_post      Fetch a snippet with integration instructions adapted to your project's CSS, framework, and conventions",
  "search_by_author    List all posts by a specific author",
  "get_popular_tags    Discover trending tags across the platform",
  "",
  "Run now: npx -y looba-mcp",
  "Global install: npm install -g looba-mcp",
  "",
];

process.stdout.write(lines.join("\n"));
