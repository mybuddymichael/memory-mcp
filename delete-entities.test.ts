import { test, expect } from 'bun:test'
import { deleteEntities } from './delete-entities'
import type { Graph } from './index'

test('deleteEntities removes specified entities', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
			{ name: 'Bob Wilson', observations: [] },
		],
		relationships: [],
	}

	const result = deleteEntities(graph, ['John Smith', 'Bob Wilson'])

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]!.name).toBe('Jane Doe')
})

test('deleteEntities removes related relationships', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
			{ name: 'Bob Wilson', observations: [] },
		],
		relationships: [
			{ from: 'John Smith', type: 'knows', to: 'Jane Doe', datetime: '2025-07-28 12:00:00' },
			{ from: 'Jane Doe', type: 'works with', to: 'Bob Wilson', datetime: '2025-07-28 12:00:00' },
			{ from: 'Bob Wilson', type: 'reports to', to: 'John Smith', datetime: '2025-07-28 12:00:00' },
		],
	}

	const result = deleteEntities(graph, ['John Smith'])

	expect(result.entities).toHaveLength(2)
	expect(result.relationships).toHaveLength(1)
	expect(result.relationships[0]).toEqual({
		from: 'Jane Doe',
		type: 'works with',
		to: 'Bob Wilson',
		datetime: '2025-07-28 12:00:00',
	})
})

test('deleteEntities handles non-existent entities gracefully', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
		],
		relationships: [],
	}

	const result = deleteEntities(graph, ['John Smith', 'Non Existent'])

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]!.name).toBe('Jane Doe')
})

test('deleteEntities returns unchanged graph when no entities to delete', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
		],
		relationships: [],
	}

	const result = deleteEntities(graph, [])

	expect(result).toEqual(graph)
})
