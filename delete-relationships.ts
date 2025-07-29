import type { Graph, Relationship } from './index'

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
