import { test, expect } from 'bun:test'
import { createRelationships } from './create-relationships'
import type { Graph, Relationship } from './index'

test('createRelationships - adds new relationships to empty graph', () => {
	const graph: Graph = {
		entities: [],
		relationships: [],
	}

	const relationships: Relationship[] = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
		{ from: 'Jane Doe', type: 'works with', to: 'John Smith' },
	]

	const result = createRelationships(graph, relationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]).toEqual({
		from: 'John Smith',
		type: 'father of',
		to: 'Tim Smith',
	})
	expect(result.relationships[1]).toEqual({
		from: 'Jane Doe',
		type: 'works with',
		to: 'John Smith',
	})
	expect(result.entities).toEqual([])
})

test('createRelationships - adds new relationships to existing graph', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'Existing Entity',
				observations: [
					{
						datetime: '2025-07-28 14:30:45',
						text: 'Some observation',
					},
				],
			},
		],
		relationships: [
			{
				from: 'Entity A',
				type: 'related to',
				to: 'Entity B',
			},
		],
	}

	const newRelationships: Relationship[] = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
	]

	const result = createRelationships(graph, newRelationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]).toEqual({
		from: 'Entity A',
		type: 'related to',
		to: 'Entity B',
	})
	expect(result.relationships[1]).toEqual({
		from: 'John Smith',
		type: 'father of',
		to: 'Tim Smith',
	})
	expect(result.entities).toEqual([
		{
			name: 'Existing Entity',
			observations: [
				{
					datetime: '2025-07-28 14:30:45',
					text: 'Some observation',
				},
			],
		},
	])
})

test('createRelationships - skips duplicate relationships', () => {
	const graph: Graph = {
		entities: [],
		relationships: [
			{
				from: 'John Smith',
				type: 'father of',
				to: 'Tim Smith',
			},
		],
	}

	const relationships: Relationship[] = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
		{ from: 'Jane Doe', type: 'works with', to: 'John Smith' },
	]

	const result = createRelationships(graph, relationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]).toEqual({
		from: 'John Smith',
		type: 'father of',
		to: 'Tim Smith',
	})
	expect(result.relationships[1]).toEqual({
		from: 'Jane Doe',
		type: 'works with',
		to: 'John Smith',
	})
})

test('createRelationships - handles empty relationships array', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'Existing Entity',
				observations: [],
			},
		],
		relationships: [
			{
				from: 'Entity A',
				type: 'related to',
				to: 'Entity B',
			},
		],
	}

	const result = createRelationships(graph, [])

	expect(result.relationships).toHaveLength(1)
	expect(result.relationships[0]).toEqual({
		from: 'Entity A',
		type: 'related to',
		to: 'Entity B',
	})
	expect(result.entities).toEqual([
		{
			name: 'Existing Entity',
			observations: [],
		},
	])
})

test('createRelationships - handles all duplicate relationships', () => {
	const graph: Graph = {
		entities: [],
		relationships: [
			{
				from: 'John Smith',
				type: 'father of',
				to: 'Tim Smith',
			},
			{
				from: 'Jane Doe',
				type: 'works with',
				to: 'John Smith',
			},
		],
	}

	const relationships: Relationship[] = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
		{ from: 'Jane Doe', type: 'works with', to: 'John Smith' },
	]

	const result = createRelationships(graph, relationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships).toEqual(graph.relationships)
})

test('createRelationships - preserves original graph immutably', () => {
	const originalGraph: Graph = {
		entities: [
			{
				name: 'Original Entity',
				observations: [],
			},
		],
		relationships: [
			{
				from: 'Entity A',
				type: 'related to',
				to: 'Entity B',
			},
		],
	}

	const newRelationships: Relationship[] = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
	]

	const result = createRelationships(originalGraph, newRelationships)

	expect(originalGraph.relationships).toHaveLength(1)
	expect(result.relationships).toHaveLength(2)
	expect(result).not.toBe(originalGraph)
	expect(result.relationships).not.toBe(originalGraph.relationships)
})

test('createRelationships - handles mixed case and special characters', () => {
	const graph: Graph = {
		entities: [],
		relationships: [],
	}

	const relationships: Relationship[] = [
		{ from: "John O'Connor", type: 'married to', to: 'María García' },
		{ from: '李小明', type: 'friend of', to: "John O'Connor" },
	]

	const result = createRelationships(graph, relationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]!.from).toBe("John O'Connor")
	expect(result.relationships[0]!.type).toBe('married to')
	expect(result.relationships[0]!.to).toBe('María García')
	expect(result.relationships[1]!.from).toBe('李小明')
	expect(result.relationships[1]!.type).toBe('friend of')
	expect(result.relationships[1]!.to).toBe("John O'Connor")
})