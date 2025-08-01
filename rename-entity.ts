import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Graph, Entity } from './index'
import { loadGraph, saveGraph } from './graph'

export function renameEntity(graph: Graph, current: string, newName: string): Graph {
	const entityIndex = graph.entities.findIndex((e) => e.name === current)
	if (entityIndex === -1) {
		return graph
	}

	const currentEntity = graph.entities[entityIndex]!
	const existingEntityIndex = graph.entities.findIndex((e) => e.name === newName)

	let updatedEntities: Entity[]

	if (existingEntityIndex !== -1) {
		// Merge observations
		const existingEntity = graph.entities[existingEntityIndex]!
		const mergedEntity: Entity = {
			name: newName,
			observations: [...existingEntity.observations, ...currentEntity.observations],
		}

		updatedEntities = graph.entities
			.filter((_, i) => i !== entityIndex && i !== existingEntityIndex)
			.concat(mergedEntity)
	} else {
		// Simple rename
		const renamedEntity: Entity = {
			...currentEntity,
			name: newName,
		}

		updatedEntities = graph.entities.map((entity, i) =>
			i === entityIndex ? renamedEntity : entity,
		)
	}

	// Update relationships
	const updatedRelationships = graph.relationships.map((rel) => ({
		...rel,
		from: rel.from === current ? newName : rel.from,
		to: rel.to === current ? newName : rel.to,
	}))

	return {
		entities: updatedEntities,
		relationships: updatedRelationships,
	}
}

export async function renameEntityHandler({
	current,
	new: newName,
}: {
	current: string
	new: string
}): Promise<CallToolResult> {
	const graph = await loadGraph()
	const updatedGraph = renameEntity(graph, current, newName)
	await saveGraph(updatedGraph)

	const entityExists = graph.entities.some((e) => e.name === current)
	if (!entityExists) {
		return {
			content: [
				{
					type: 'text' as const,
					text: `Entity "${current}" not found in graph`,
				},
			],
		}
	}

	const existingEntity = graph.entities.find((e) => e.name === newName)
	const message = existingEntity
		? `Renamed entity "${current}" to "${newName}" and merged with existing entity`
		: `Renamed entity "${current}" to "${newName}"`

	return {
		content: [
			{
				type: 'text' as const,
				text: message,
			},
		],
	}
}
