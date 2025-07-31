# memory-mcp

This is a reimplementation of the [knowledge graph memory server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory). It has several improvements over the original:

- Removes redundant tools.
- Redesigns the search tool to be useful.
- Uses a much faster Set-based lookup logic for relationships.
- Includes the date and time in all observations.
- Contains thorough unit tests.

## Tools

| Tool | Description | Input schema |
|------|-------------|--------------|
| create_entities | Create new entities in the knowledge graph | entity_names: string[] |
| delete_entities | Remove entities and their associated relationships | entity_names: string[] |
| add_observations | Add contextual information to existing entities | entity_name: string; observations: string[] |
| create_relationships | Establish connections between entities | relationships: { from: string; type: string; to: string }[] |
| delete_relationships | Remove specific connections between entities | relationships: { from: string; type: string; to: string }[] |
| search_graph | Find entities and relationships using keywords | keywords: string[] |
