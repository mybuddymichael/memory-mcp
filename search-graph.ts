import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Entity, Graph, Relationship } from './index'
import { loadGraph } from './graph'

export function parseSearchTerms(keywords: string): string[] {
	const terms: string[] = []
	let current = ''
	let inQuotes = false
	let quoteChar = ''

	for (const char of keywords) {
		if ((char === '"' || char === "'") && !inQuotes) {
			inQuotes = true
			quoteChar = char
		} else if (char === quoteChar && inQuotes) {
			inQuotes = false
			quoteChar = ''
		} else if (char === ' ' && !inQuotes) {
			if (current) terms.push(current)
			current = ''
		} else {
			current += char
		}
	}
	if (current) terms.push(current)
	return terms
}

export function searchGraph(
	graph: Graph,
	keywords: string,
): { entities: Entity[]; relationships: Relationship[] } {
	const searchTerms = parseSearchTerms(keywords).map((term) => term.toLowerCase())

	const entities = graph.entities.filter((entity) =>
		searchTerms.some(
			(term) =>
				entity.name.toLowerCase().includes(term) ||
				entity.observations.some((obs) => obs.text.toLowerCase().includes(term)),
		),
	)

	const relationships = graph.relationships.filter((rel) =>
		searchTerms.some(
			(term) =>
				rel.from.toLowerCase().includes(term) ||
				rel.to.toLowerCase().includes(term) ||
				rel.type.toLowerCase().includes(term),
		),
	)

	return { entities, relationships }
}

export async function searchGraphHandler({
	keywords,
}: {
	keywords: string
}): Promise<CallToolResult> {
	const graph = await loadGraph()
	const result = searchGraph(graph, keywords)

	return {
		content: [
			{
				type: 'text' as const,
				text: JSON.stringify(result, null, 2),
			},
		],
	}
}
