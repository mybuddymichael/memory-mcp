# memory-mcp

This is a reimplementation of the [knowledge graph memory server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory). It has several improvements over the original:

- Removes redundant tools.
- Redesigns the search tool to be useful.
- Uses a much faster Set-based lookup logic for relationships.
- Includes the date and time in all observations.
- Contains thorough unit tests.
