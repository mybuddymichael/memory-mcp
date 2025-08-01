import { test, expect } from 'bun:test'
import type { Graph, Entity } from './index'
import { renameEntity } from './rename-entity'

test('renameEntity - simple rename', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [{ created: '2025-07-28 14:30:45', text: 'John Smith is a carpenter.' }],
			},
		],
		relationships: [
			{
				from: 'John Smith',
				type: 'works as',
				to: 'Carpenter',
				created: '2025-07-28 14:30:45',
			},
		],
	}

	const result = renameEntity(graph, 'John Smith', 'Jonathan Smith')

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]!.name).toBe('Jonathan Smith')
	expect(result.entities[0]!.observations).toHaveLength(1)
	expect(result.relationships[0]!.from).toBe('Jonathan Smith')
})

test('renameEntity - merge with existing entity', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [{ created: '2025-07-28 14:30:45', text: 'John Smith is a carpenter.' }],
			},
			{
				name: 'Jonathan Smith',
				observations: [{ created: '2025-07-28 15:00:00', text: 'Jonathan Smith lives in NYC.' }],
			},
		],
		relationships: [
			{
				from: 'John Smith',
				type: 'works as',
				to: 'Carpenter',
				created: '2025-07-28 14:30:45',
			},
		],
	}

	const result = renameEntity(graph, 'John Smith', 'Jonathan Smith')

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]!.name).toBe('Jonathan Smith')
	expect(result.entities[0]!.observations).toHaveLength(2)
	expect(result.relationships[0]!.from).toBe('Jonathan Smith')
})

test('renameEntity - update relationships as "to" field', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [],
			},
			{
				name: 'Mary Smith',
				observations: [],
			},
		],
		relationships: [
			{
				from: 'Mary Smith',
				type: 'married to',
				to: 'John Smith',
				created: '2025-07-28 14:30:45',
			},
		],
	}

	const result = renameEntity(graph, 'John Smith', 'Jonathan Smith')

	expect(result.entities).toHaveLength(2)
	expect(result.entities.find((e: Entity) => e.name === 'Jonathan Smith')).toBeDefined()
	expect(result.entities.find((e: Entity) => e.name === 'John Smith')).toBeUndefined()
	expect(result.relationships[0]!.to).toBe('Jonathan Smith')
})

test('renameEntity - entity does not exist', () => {
	const graph: Graph = {
		entities: [],
		relationships: [],
	}

	const result = renameEntity(graph, 'NonExistent', 'NewName')

	expect(result).toEqual(graph)
})
