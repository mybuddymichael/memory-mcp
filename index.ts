import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

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

const server = new McpServer({
	name: 'memory',
	version: '0.0.1',
})

export function parseSearchTerms(keywords: string): string[] {
	const terms: string[] = []
	let current = ''
	let inQuotes = false
	let quoteChar = ''

	for (const char of keywords) {
		if ((char === '"' || char === "'") && !inQuotes) {
			inQuotes = true
			quoteChar = char
		} else if (char === quoteChar && inQuotes) {
			inQuotes = false
			quoteChar = ''
		} else if (char === ' ' && !inQuotes) {
			if (current) terms.push(current)
			current = ''
		} else {
			current += char
		}
	}
	if (current) terms.push(current)
	return terms
}

export function searchGraph(
	graph: Graph,
	keywords: string,
): { entities: Entity[]; relationships: Relationship[] } {
	const searchTerms = parseSearchTerms(keywords).map((term) => term.toLowerCase())

	const entities = graph.entities.filter((entity) =>
		searchTerms.some(
			(term) =>
				entity.name.toLowerCase().includes(term) ||
				entity.observations.some((obs) => obs.text.toLowerCase().includes(term)),
		),
	)

	const relationships = graph.relationships.filter((rel) =>
		searchTerms.some(
			(term) =>
				rel.from.toLowerCase().includes(term) ||
				rel.to.toLowerCase().includes(term) ||
				rel.type.toLowerCase().includes(term),
		),
	)

	return { entities, relationships }
}

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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
