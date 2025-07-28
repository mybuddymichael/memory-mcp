import type { Graph } from './index'

export function addObservations(
	graph: Graph,
	entityName: string,
	observations: string[]
): Graph {
	const entityIndex = graph.entities.findIndex((entity) => entity.name === entityName)

	if (entityIndex === -1) {
		throw new Error(`Entity "${entityName}" not found`)
	}

	const currentTime = new Date().toLocaleString('sv-SE', { 
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
	}).replace('T', ' ')

	const formattedObservations = observations.map(text => ({
		datetime: currentTime,
		text
	}))

	const updatedEntities = graph.entities.map((entity, index) => {
		if (index === entityIndex) {
			return {
				...entity,
				observations: [...entity.observations, ...formattedObservations],
			}
		}
		return entity
	})

	return {
		...graph,
		entities: updatedEntities,
	}
}