import { test, expect } from 'bun:test'
import { createRelationships } from './create-relationships'
import type { Graph } from './index'

test('createRelationships - adds new relationships to empty graph', () => {
	const graph: Graph = {
		entities: [],
		relationships: [],
	}

	const relationships = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
		{ from: 'Jane Doe', type: 'works with', to: 'John Smith' },
	]

	const result = createRelationships(graph, relationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]).toMatchObject({
		from: 'John Smith',
		type: 'father of',
		to: 'Tim Smith',
	})
	expect(result.relationships[0]!.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
	expect(result.relationships[1]).toMatchObject({
		from: 'Jane Doe',
		type: 'works with',
		to: 'John Smith',
	})
	expect(result.relationships[1]!.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
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
				datetime: '2025-07-28 14:30:45',
			},
		],
	}

	const newRelationships = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
	]

	const result = createRelationships(graph, newRelationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]).toEqual({
		from: 'Entity A',
		type: 'related to',
		to: 'Entity B',
		datetime: '2025-07-28 14:30:45',
	})
	expect(result.relationships[1]).toMatchObject({
		from: 'John Smith',
		type: 'father of',
		to: 'Tim Smith',
	})
	expect(result.relationships[1]!.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
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
				datetime: '2025-07-28 14:30:45',
			},
		],
	}

	const relationships = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
		{ from: 'Jane Doe', type: 'works with', to: 'John Smith' },
	]

	const result = createRelationships(graph, relationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]).toEqual({
		from: 'John Smith',
		type: 'father of',
		to: 'Tim Smith',
		datetime: '2025-07-28 14:30:45',
	})
	expect(result.relationships[1]).toMatchObject({
		from: 'Jane Doe',
		type: 'works with',
		to: 'John Smith',
	})
	expect(result.relationships[1]!.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
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
				datetime: '2025-07-28 14:30:45',
			},
		],
	}

	const result = createRelationships(graph, [])

	expect(result.relationships).toHaveLength(1)
	expect(result.relationships[0]).toEqual({
		from: 'Entity A',
		type: 'related to',
		to: 'Entity B',
		datetime: '2025-07-28 14:30:45',
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
				datetime: '2025-07-28 14:30:45',
			},
			{
				from: 'Jane Doe',
				type: 'works with',
				to: 'John Smith',
				datetime: '2025-07-28 14:30:45',
			},
		],
	}

	const relationships = [
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
				datetime: '2025-07-28 14:30:45',
			},
		],
	}

	const newRelationships = [
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

	const relationships = [
		{ from: "John O'Connor", type: 'married to', to: 'María García' },
		{ from: '李小明', type: 'friend of', to: "John O'Connor" },
	]

	const result = createRelationships(graph, relationships)

	expect(result.relationships).toHaveLength(2)
	expect(result.relationships[0]!.from).toBe("John O'Connor")
	expect(result.relationships[0]!.type).toBe('married to')
	expect(result.relationships[0]!.to).toBe('María García')
	expect(result.relationships[0]!.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
	expect(result.relationships[1]!.from).toBe('李小明')
	expect(result.relationships[1]!.type).toBe('friend of')
	expect(result.relationships[1]!.to).toBe("John O'Connor")
	expect(result.relationships[1]!.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
})

test('createRelationships - adds current datetime to all new relationships', () => {
	const graph: Graph = {
		entities: [],
		relationships: [],
	}

	const relationships = [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith' },
		{ from: 'Jane Doe', type: 'works with', to: 'John Smith' },
	]

	const beforeTime = new Date()
	const result = createRelationships(graph, relationships)
	const afterTime = new Date()

	expect(result.relationships).toHaveLength(2)
	
	for (const relationship of result.relationships) {
		expect(relationship.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
		
		const relationshipTime = new Date(relationship.datetime.replace(' ', 'T'))
		expect(relationshipTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000)
		expect(relationshipTime.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000)
	}

	expect(result.relationships[0]!.datetime).toBe(result.relationships[1]!.datetime)
})
