# memory-mcp

This is a reimplementation of the [knowledge graph memory server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory). It has several improvements over the original:

- Removes redundant tools.
- Redesigns the search tool to be useful.
- Uses a much faster Set-based lookup logic for relationships.
- Includes the date and time in all observations.
- Contains thorough unit tests.

## Tools

| Tool | Description |
|------|-------------|
| create_entities | Create new entities in the knowledge graph |
| delete_entities | Remove entities and their associated relationships |
| rename_entity | Rename an entity, merging with existing entity if name already exists |
| add_observations | Add contextual information to existing entities |
| create_relationships | Establish connections between entities |
| delete_relationships | Remove specific connections between entities |
| search_graph | Find entities and relationships using keywords |
