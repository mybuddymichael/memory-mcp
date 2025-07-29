import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Graph } from './index'
import { loadGraph, saveGraph } from './graph'

export function addObservations(graph: Graph, entityName: string, observations: string[]): Graph {
	const entityIndex = graph.entities.findIndex((entity) => entity.name === entityName)

	if (entityIndex === -1) {
		throw new Error(`Entity "${entityName}" not found`)
	}

	const currentTime = new Date()
		.toLocaleString('sv-SE', {
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		})
		.replace('T', ' ')

	const formattedObservations = observations.map((text) => ({
		created: currentTime,
		text,
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

export async function addObservationsHandler({
	entity_name,
	observations,
}: {
	entity_name: string
	observations: string[]
}): Promise<CallToolResult> {
	const graph = await loadGraph()
	const updatedGraph = addObservations(graph, entity_name, observations)
	await saveGraph(updatedGraph)

	return {
		content: [
			{
				type: 'text' as const,
				text: `Added ${observations.length} observations to entity: ${entity_name}`,
			},
		],
	}
}
