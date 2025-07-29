import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Graph, Entity } from './index'
import { loadGraph, saveGraph } from './graph'

export function createEntities(graph: Graph, entityNames: string[]): Graph {
	const existingNames = new Set(graph.entities.map((entity) => entity.name))

	const newEntities: Entity[] = entityNames
		.filter((name) => !existingNames.has(name))
		.map((name) => ({
			name,
			observations: [],
		}))

	return {
		...graph,
		entities: [...graph.entities, ...newEntities],
	}
}

export async function createEntitiesHandler({
	entity_names,
}: {
	entity_names: string[]
}): Promise<CallToolResult> {
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
}
