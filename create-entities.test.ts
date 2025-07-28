import { test, expect } from 'bun:test'
import { createEntities } from './create-entities'
import type { Graph } from './index'

test('createEntities - adds new entities to empty graph', () => {
	const graph: Graph = {
		entities: [],
		relationships: [],
	}

	const result = createEntities(graph, ['John Smith', 'Jane Doe'])

	expect(result.entities).toHaveLength(2)
	expect(result.entities[0]).toEqual({
		name: 'John Smith',
		observations: [],
	})
	expect(result.entities[1]).toEqual({
		name: 'Jane Doe',
		observations: [],
	})
	expect(result.relationships).toEqual([])
})

test('createEntities - adds new entities to existing graph', () => {
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

	const result = createEntities(graph, ['New Entity'])

	expect(result.entities).toHaveLength(2)
	expect(result.entities[0]).toEqual({
		name: 'Existing Entity',
		observations: [
			{
				datetime: '2025-07-28 14:30:45',
				text: 'Some observation',
			},
		],
	})
	expect(result.entities[1]).toEqual({
		name: 'New Entity',
		observations: [],
	})
	expect(result.relationships).toEqual([
		{
			from: 'Entity A',
			type: 'related to',
			to: 'Entity B',
		},
	])
})

test('createEntities - skips duplicate entities', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [],
			},
		],
		relationships: [],
	}

	const result = createEntities(graph, ['John Smith', 'Jane Doe'])

	expect(result.entities).toHaveLength(2)
	expect(result.entities[0]).toEqual({
		name: 'John Smith',
		observations: [],
	})
	expect(result.entities[1]).toEqual({
		name: 'Jane Doe',
		observations: [],
	})
})

test('createEntities - handles empty entity names array', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'Existing Entity',
				observations: [],
			},
		],
		relationships: [],
	}

	const result = createEntities(graph, [])

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]).toEqual({
		name: 'Existing Entity',
		observations: [],
	})
})

test('createEntities - handles all duplicate entities', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [],
			},
			{
				name: 'Jane Doe',
				observations: [],
			},
		],
		relationships: [],
	}

	const result = createEntities(graph, ['John Smith', 'Jane Doe'])

	expect(result.entities).toHaveLength(2)
	expect(result.entities).toEqual(graph.entities)
})

test('createEntities - preserves original graph immutably', () => {
	const originalGraph: Graph = {
		entities: [
			{
				name: 'Original Entity',
				observations: [],
			},
		],
		relationships: [],
	}

	const result = createEntities(originalGraph, ['New Entity'])

	expect(originalGraph.entities).toHaveLength(1)
	expect(result.entities).toHaveLength(2)
	expect(result).not.toBe(originalGraph)
	expect(result.entities).not.toBe(originalGraph.entities)
})

test('createEntities - handles mixed case and special characters', () => {
	const graph: Graph = {
		entities: [],
		relationships: [],
	}

	const result = createEntities(graph, ["John O'Connor", 'María García', '李小明'])

	expect(result.entities).toHaveLength(3)
	expect(result.entities[0]!.name).toBe("John O'Connor")
	expect(result.entities[1]!.name).toBe('María García')
	expect(result.entities[2]!.name).toBe('李小明')
})
