import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { searchGraph } from './search-graph'
import { createEntities } from './create-entities'
import { deleteEntities } from './delete-entities'
import { addObservations } from './add-observations'
import { deleteRelationships } from './delete-relationships'
import { createRelationships } from './create-relationships'

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

// Get the memory file path from the environment variable or use default
const memoryFilePath = process.env.MEMORY_FILE_PATH || './memory.json'

async function loadGraph(): Promise<Graph> {
	try {
		const file = Bun.file(memoryFilePath)
		const exists = await file.exists()

		if (!exists) {
			return {
				entities: [],
				relationships: [],
			}
		}

		const content = await file.text()
		return JSON.parse(content)
	} catch (error) {
		console.error('Error loading graph:', error)
		return {
			entities: [],
			relationships: [],
		}
	}
}

async function saveGraph(graph: Graph): Promise<void> {
	try {
		const file = Bun.file(memoryFilePath)
		await Bun.write(file, JSON.stringify(graph))
	} catch (error) {
		console.error('Error saving graph:', error)
		throw error
	}
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
			'Create new entities in the graph. Always use sentence case for entity names, unless they are proper nouns.',
		inputSchema: {
			entity_names: z.array(z.string()),
		},
	},
	async ({ entity_names }) => {
		const graph = await loadGraph()
		const updatedGraph = createEntities(graph, entity_names)
		await saveGraph(updatedGraph)

		return {
			content: [
				{
					type: 'text' as const,
					text: `Created ${entity_names.length} entities: ${entity_names.join(', ')}`,
				},
			],
		}
	},
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
	async ({ entity_names }) => {
		const graph = await loadGraph()
		const updatedGraph = deleteEntities(graph, entity_names)
		await saveGraph(updatedGraph)

		return {
			content: [
				{
					type: 'text' as const,
					text: `Deleted ${entity_names.length} entities: ${entity_names.join(', ')}`,
				},
			],
		}
	},
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
	async ({ entity_name, observations }) => {
		const graph = await loadGraph()
		const updatedGraph = addObservations(graph, entity_name, observations)
		await saveGraph(updatedGraph)

		return {
			content: [
				{
					type: 'text' as const,
					text: `Added ${observations.length} observations to entity: ${entity_name}`,
				},
			],
		}
	},
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
	async ({ relationships }) => {
		const graph = await loadGraph()
		const updatedGraph = createRelationships(graph, relationships)
		await saveGraph(updatedGraph)

		return {
			content: [
				{
					type: 'text' as const,
					text: `Created ${relationships.length} relationships`,
				},
			],
		}
	},
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
	async ({ relationships }) => {
		const graph = await loadGraph()
		const updatedGraph = deleteRelationships(graph, relationships)
		await saveGraph(updatedGraph)

		return {
			content: [
				{
					type: 'text' as const,
					text: `Deleted ${relationships.length} relationships`,
				},
			],
		}
	},
)

server.registerTool(
	'search_graph',
	{
		title: 'Search the graph',
		description:
			'Search the graph for nodes that match the keywords provided. Keywords should be separated by spaces. Group multiple words into a single keyword by wrapping them in a pair of quotes.',
		inputSchema: {
			keywords: z.string(),
		},
	},
	async ({ keywords }) => {
		const graph = await loadGraph()
		const result = searchGraph(graph, keywords)

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(result, null, 2),
				},
			],
		}
	},
)

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
