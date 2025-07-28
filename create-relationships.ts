import type { Graph, Relationship } from './index'

export function createRelationships(graph: Graph, relationships: Relationship[]): Graph {
	const existingRelationships = new Set(
		graph.relationships.map((rel) => `${rel.from}|${rel.type}|${rel.to}`),
	)

	const newRelationships: Relationship[] = relationships.filter((rel) => {
		const key = `${rel.from}|${rel.type}|${rel.to}`
		return !existingRelationships.has(key)
	})

	return {
		...graph,
		relationships: [...graph.relationships, ...newRelationships],
	}
}

