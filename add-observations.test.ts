import { test, expect } from 'bun:test'
import { addObservations } from './add-observations'
import type { Graph } from './index'

test('addObservations - adds observations to existing entity', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [
					{
						datetime: '2025-07-28 10:00:00',
						text: 'Existing observation',
					},
				],
			},
		],
		relationships: [],
	}

	const result = addObservations(graph, 'John Smith', [
		'John Smith is a carpenter.',
		'John Smith lives in Seattle.',
	])

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]!.observations).toHaveLength(3)
	expect(result.entities[0]!.observations[0]).toEqual({
		datetime: '2025-07-28 10:00:00',
		text: 'Existing observation',
	})
	expect(result.entities[0]!.observations[1]!.text).toBe('John Smith is a carpenter.')
	expect(result.entities[0]!.observations[2]!.text).toBe('John Smith lives in Seattle.')
	expect(result.entities[0]!.observations[1]!.datetime).toMatch(
		/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
	)
	expect(result.entities[0]!.observations[2]!.datetime).toMatch(
		/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
	)
})

test('addObservations - adds observations to entity with no existing observations', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'Jane Doe',
				observations: [],
			},
		],
		relationships: [],
	}

	const result = addObservations(graph, 'Jane Doe', ['Jane Doe is a teacher.'])

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]!.observations).toHaveLength(1)
	expect(result.entities[0]!.observations[0]!.text).toBe('Jane Doe is a teacher.')
	expect(result.entities[0]!.observations[0]!.datetime).toMatch(
		/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
	)
})

test('addObservations - throws error when entity does not exist', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [],
			},
		],
		relationships: [],
	}

	expect(() => {
		addObservations(graph, 'Non-existent Entity', ['Some observation'])
	}).toThrow('Entity "Non-existent Entity" not found')
})

test('addObservations - handles empty observations array', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [
					{
						datetime: '2025-07-28 10:00:00',
						text: 'Existing observation',
					},
				],
			},
		],
		relationships: [],
	}

	const result = addObservations(graph, 'John Smith', [])

	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]!.observations).toHaveLength(1)
	expect(result.entities[0]!.observations[0]).toEqual({
		datetime: '2025-07-28 10:00:00',
		text: 'Existing observation',
	})
})

test('addObservations - preserves other entities unchanged', () => {
	const graph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [],
			},
			{
				name: 'Jane Doe',
				observations: [
					{
						datetime: '2025-07-28 12:00:00',
						text: 'Jane observation',
					},
				],
			},
		],
		relationships: [
			{
				from: 'John Smith',
				type: 'knows',
				to: 'Jane Doe',
			},
		],
	}

	const result = addObservations(graph, 'John Smith', ['John Smith is a carpenter.'])

	expect(result.entities).toHaveLength(2)
	expect(result.entities[0]!.observations).toHaveLength(1)
	expect(result.entities[1]!.observations).toHaveLength(1)
	expect(result.entities[1]!.observations[0]).toEqual({
		datetime: '2025-07-28 12:00:00',
		text: 'Jane observation',
	})
	expect(result.relationships).toEqual([
		{
			from: 'John Smith',
			type: 'knows',
			to: 'Jane Doe',
		},
	])
})

test('addObservations - preserves original graph immutably', () => {
	const originalGraph: Graph = {
		entities: [
			{
				name: 'John Smith',
				observations: [
					{
						datetime: '2025-07-28 10:00:00',
						text: 'Original observation',
					},
				],
			},
		],
		relationships: [],
	}

	const result = addObservations(originalGraph, 'John Smith', ['New observation'])

	expect(originalGraph.entities[0]!.observations).toHaveLength(1)
	expect(result.entities[0]!.observations).toHaveLength(2)
	expect(result).not.toBe(originalGraph)
	expect(result.entities).not.toBe(originalGraph.entities)
	expect(result.entities[0]).not.toBe(originalGraph.entities[0])
	expect(result.entities[0]!.observations).not.toBe(originalGraph.entities[0]!.observations)
})
