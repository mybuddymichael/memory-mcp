import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { createEntitiesHandler } from './create-entities'
import { deleteEntitiesHandler } from './delete-entities'
import { addObservationsHandler } from './add-observations'
import { createRelationshipsHandler } from './create-relationships'
import { deleteRelationshipsHandler } from './delete-relationships'
import { searchGraphHandler } from './search-graph'
import { renameEntityHandler } from './rename-entity'

export type Entity = {
	name: string
	observations: Array<{
		created: string
		text: string
	}>
}

export type Relationship = {
	from: string
	type: string
	to: string
	created: string
}

export type Graph = {
	entities: Array<Entity>
	relationships: Array<Relationship>
}

const server = new McpServer({
	name: 'memory',
	version: '0.0.1',
})

server.registerTool(
	'create_entities',
	{
		title: 'Create entities',
		description:
			'Create new entities in the graph. Always use sentence case (first letter should be capitalized) for entity names, unless they are proper nouns.',
		inputSchema: {
			entity_names: z.array(z.string()),
		},
	},
	createEntitiesHandler,
)

server.registerTool(
	'delete_entities',
	{
		title: 'Delete entities',
		description: 'Delete entities from the graph along with their relationships.',
		inputSchema: {
			entity_names: z.array(z.string()),
		},
	},
	deleteEntitiesHandler,
)

server.registerTool(
	'rename_entity',
	{
		title: 'Rename entity',
		description:
			'Rename an entity in the graph. If the new name already exists, merge observations from both entities.',
		inputSchema: {
			current: z.string().describe('The current name of the entity to rename'),
			new: z.string().describe('The new name for the entity'),
		},
	},
	renameEntityHandler,
)

server.registerTool(
	'add_observations',
	{
		title: 'Add observations',
		description: 'Add observations to an existing entity in the graph.',
		inputSchema: {
			entity_name: z.string(),
			observations: z.array(z.string()),
		},
	},
	addObservationsHandler,
)

server.registerTool(
	'create_relationships',
	{
		title: 'Create relationships',
		description:
			'Create new relationships between entities in the graph. Always use active voice for the type.',
		inputSchema: {
			relationships: z.array(
				z.object({
					from: z.string(),
					type: z.string(),
					to: z.string(),
				}),
			),
		},
	},
	createRelationshipsHandler,
)

server.registerTool(
	'delete_relationships',
	{
		title: 'Delete relationships',
		description: 'Delete specific relationships from the graph.',
		inputSchema: {
			relationships: z.array(
				z.object({
					from: z.string(),
					type: z.string(),
					to: z.string(),
				}),
			),
		},
	},
	deleteRelationshipsHandler,
)

server.registerTool(
	'search_graph',
	{
		title: 'Search the graph',
		description: 'Search the graph for nodes that match the keywords provided.',
		inputSchema: {
			keywords: z
				.array(z.string())
				.describe(
					'Array of search keywords to match against entities and relationships. Each keyword will be searched individually (union, not intersection).',
				),
		},
	},
	searchGraphHandler,
)

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
