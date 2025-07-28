import { test, expect } from 'bun:test'
import { deleteRelationships } from './delete-relationships'
import type { Graph } from './index'

test('deleteRelationships removes specified relationships', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
			{ name: 'Bob Wilson', observations: [] },
		],
		relationships: [
			{ from: 'John Smith', type: 'knows', to: 'Jane Doe' },
			{ from: 'Jane Doe', type: 'works with', to: 'Bob Wilson' },
			{ from: 'Bob Wilson', type: 'reports to', to: 'John Smith' },
		],
	}

	const relationshipsToDelete = [
		{ from: 'John Smith', type: 'knows', to: 'Jane Doe' },
		{ from: 'Bob Wilson', type: 'reports to', to: 'John Smith' },
	]

	const result = deleteRelationships(graph, relationshipsToDelete)

	expect(result.relationships).toHaveLength(1)
	expect(result.relationships[0]).toEqual({
		from: 'Jane Doe',
		type: 'works with',
		to: 'Bob Wilson',
	})
	expect(result.entities).toEqual(graph.entities)
})

test('deleteRelationships handles non-existent relationships gracefully', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
		],
		relationships: [{ from: 'John Smith', type: 'knows', to: 'Jane Doe' }],
	}

	const relationshipsToDelete = [
		{ from: 'John Smith', type: 'knows', to: 'Jane Doe' },
		{ from: 'Jane Doe', type: 'dislikes', to: 'John Smith' },
	]

	const result = deleteRelationships(graph, relationshipsToDelete)

	expect(result.relationships).toHaveLength(0)
	expect(result.entities).toEqual(graph.entities)
})

test('deleteRelationships returns unchanged graph when no relationships to delete', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
		],
		relationships: [{ from: 'John Smith', type: 'knows', to: 'Jane Doe' }],
	}

	const result = deleteRelationships(graph, [])

	expect(result).toEqual(graph)
})

test('deleteRelationships handles empty relationships array', () => {
	const graph: Graph = {
		entities: [
			{ name: 'John Smith', observations: [] },
			{ name: 'Jane Doe', observations: [] },
		],
		relationships: [],
	}

	const relationshipsToDelete = [{ from: 'John Smith', type: 'knows', to: 'Jane Doe' }]

	const result = deleteRelationships(graph, relationshipsToDelete)

	expect(result).toEqual(graph)
})
