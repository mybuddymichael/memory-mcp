import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Graph, Relationship } from './index'
import { loadGraph, saveGraph } from './graph'

export function createRelationships(
	graph: Graph,
	relationships: Omit<Relationship, 'created'>[],
): Graph {
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
			created: currentTime,
		}))

	return {
		...graph,
		relationships: [...graph.relationships, ...newRelationships],
	}
}

export async function createRelationshipsHandler({
	relationships,
}: {
	relationships: Omit<Relationship, 'created'>[]
}): Promise<CallToolResult> {
	const graph = await loadGraph()
	const updatedGraph = createRelationships(graph, relationships)
	await saveGraph(updatedGraph)

	return {
		content: [
			{
				type: 'text' as const,
				text: `Created ${relationships.length} relationships`,
			},
		],
	}
}
