import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Graph, Relationship } from './index'
import { loadGraph, saveGraph } from './graph'

export function deleteRelationships(
	graph: Graph,
	relationshipsToDelete: Omit<Relationship, 'created'>[],
): Graph {
	if (relationshipsToDelete.length === 0) {
		return graph
	}

	const relationshipsToDeleteSet = new Set(
		relationshipsToDelete.map((rel) => `${rel.from}|${rel.type}|${rel.to}`),
	)

	const filteredRelationships = graph.relationships.filter(
		(relationship) =>
			!relationshipsToDeleteSet.has(`${relationship.from}|${relationship.type}|${relationship.to}`),
	)

	return {
		entities: graph.entities,
		relationships: filteredRelationships,
	}
}

export async function deleteRelationshipsHandler({
	relationships,
}: {
	relationships: Omit<Relationship, 'created'>[]
}): Promise<CallToolResult> {
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
}
