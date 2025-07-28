import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { searchGraph } from './search-graph'
import { createEntities } from './create-entities'
import { deleteEntities } from './delete-entities'

export type Entity = {
	name: string
	observations: Array<{
		datetime: string
		text: string
	}>
}

export type Relationship = {
	from: string
	type: string
	to: string
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
		await Bun.write(file, JSON.stringify(graph, null, 2))
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
	'search_graph',
	{
		title: 'Search the graph',
		description: 'Search the graph for nodes that match the keywords provided.',
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

server.registerTool(
	'create_entities',
	{
		title: 'Create entities',
		description: 'Create new entities in the graph.',
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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
