# memory-mcp

This will be an [MCP](https://modelcontextprotocol.io/docs/getting-started/intro) server to interact with a knowledge graph.

There should be 7 tools:

1. create_entities
2. delete_entities
3. add_observations
4. create_relationships
5. delete_relationships
6. search_graph
7. read_entities

The graph will be store in a JSON file. The JSON object will have the following structure:

```json
{
  "entities": {
    "John Smith": {
      "observations": [
        {"datetime": "2025-07-28 14:30:45", text: "John Smith is a carpenter." }
      ],
    },
    "Tim Smith": {}
  },
  "relationships": [
    {
      "from": "John Smith",
      "type": "father of",
      "to": "Tim Smith",
    }
  ]
}

## Implementation strategy

- We should create as small of changes as possible.
- Always use existing code whenever possible.
- Add test first, confirm they fail, and then add implementation that causes the test to pass.

## Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
