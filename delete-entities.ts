import type { Graph } from './index'

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
