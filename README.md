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
| create_entities | Create new entities in the graph. Always use sentence case for entity names, unless they are proper nouns. | entity_names: string[] |
| delete_entities | Delete entities from the graph along with their relationships. | entity_names: string[] |
| add_observations | Add observations to an existing entity in the graph. | entity_name: string; observations: string[] |
| create_relationships | Create new relationships between entities in the graph. Always use active voice for the type. | relationships: { from: string; type: string; to: string }[] |
| delete_relationships | Delete specific relationships from the graph. | relationships: { from: string; type: string; to: string }[] |
| search_graph | Search the graph for nodes that match the keywords provided. | keywords: string (Keywords separated by spaces. Multi-word keywords should be put within quote pairs.) |
