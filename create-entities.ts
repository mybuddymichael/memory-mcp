import type { Graph, Entity } from './index'

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
