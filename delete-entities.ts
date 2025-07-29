import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Graph } from './index'
import { loadGraph, saveGraph } from './graph'

export function deleteEntities(graph: Graph, entityNames: string[]): Graph {
	const entityNamesSet = new Set(entityNames)

	const filteredEntities = graph.entities.filter((entity) => !entityNamesSet.has(entity.name))

	const filteredRelationships = graph.relationships.filter(
		(relationship) =>
			!entityNamesSet.has(relationship.from) && !entityNamesSet.has(relationship.to),
	)

	return {
		entities: filteredEntities,
		relationships: filteredRelationships,
	}
}

export async function deleteEntitiesHandler({
	entity_names,
}: {
	entity_names: string[]
}): Promise<CallToolResult> {
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
}
