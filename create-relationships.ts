import type { Graph, Relationship } from './index'

export function createRelationships(graph: Graph, relationships: Omit<Relationship, 'datetime'>[]): Graph {
	const existingRelationships = new Set(
		graph.relationships.map((rel) => `${rel.from}|${rel.type}|${rel.to}`),
	)

	const currentTime = new Date()
		.toLocaleString('sv-SE', {
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		})
		.replace('T', ' ')

	const newRelationships: Relationship[] = relationships
		.filter((rel) => {
			const key = `${rel.from}|${rel.type}|${rel.to}`
			return !existingRelationships.has(key)
		})
		.map((rel) => ({
			...rel,
			datetime: currentTime,
		}))

	return {
		...graph,
		relationships: [...graph.relationships, ...newRelationships],
	}
}
