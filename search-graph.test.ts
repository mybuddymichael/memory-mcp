import { test, expect } from 'bun:test'
import { parseSearchTerms, searchGraph } from './search-graph.ts'
import type { Graph } from './index.ts'

test('parseSearchTerms splits by spaces', () => {
	expect(parseSearchTerms('hello world')).toEqual(['hello', 'world'])
})

test('parseSearchTerms preserves quoted strings', () => {
	expect(parseSearchTerms('hello "world test" foo')).toEqual(['hello', 'world test', 'foo'])
})

test('parseSearchTerms handles single quotes', () => {
	expect(parseSearchTerms("hello 'world test' foo")).toEqual(['hello', 'world test', 'foo'])
})

test('parseSearchTerms handles mixed quotes', () => {
	expect(parseSearchTerms('hello "world test" \'another phrase\' single')).toEqual([
		'hello',
		'world test',
		'another phrase',
		'single',
	])
})

test('parseSearchTerms handles empty string', () => {
	expect(parseSearchTerms('')).toEqual([])
})

test('parseSearchTerms handles only spaces', () => {
	expect(parseSearchTerms('   ')).toEqual([])
})

const mockGraph: Graph = {
	entities: [
		{
			name: 'John Smith',
			observations: [{ created: '2025-07-28 14:30:45', text: 'John Smith is a carpenter.' }],
		},
		{
			name: 'Tim Smith',
			observations: [{ created: '2025-07-28 15:00:00', text: 'Tim is studying engineering.' }],
		},
		{
			name: 'Alice Johnson',
			observations: [],
		},
	],
	relationships: [
		{ from: 'John Smith', type: 'father of', to: 'Tim Smith', created: '2025-07-28 12:00:00' },
		{ from: 'Alice Johnson', type: 'friend of', to: 'Tim Smith', created: '2025-07-28 12:00:00' },
	],
}

test('searchGraph finds entities by name', () => {
	const result = searchGraph(mockGraph, 'John')
	expect(result.entities).toHaveLength(2)
	expect(result.entities.map((e) => e.name)).toContain('John Smith')
	expect(result.entities.map((e) => e.name)).toContain('Alice Johnson')
})

test('searchGraph finds entities by observation text', () => {
	const result = searchGraph(mockGraph, 'carpenter')
	expect(result.entities).toHaveLength(1)
	expect(result.entities[0]?.name).toBe('John Smith')
})

test('searchGraph finds relationships by participant names', () => {
	const result = searchGraph(mockGraph, 'Tim')
	expect(result.entities).toHaveLength(1)
	expect(result.relationships).toHaveLength(2)
})

test('searchGraph finds relationships by type', () => {
	const result = searchGraph(mockGraph, 'father')
	expect(result.relationships).toHaveLength(1)
	expect(result.relationships[0]?.type).toBe('father of')
})

test('searchGraph is case insensitive', () => {
	const result = searchGraph(mockGraph, 'JOHN')
	expect(result.entities).toHaveLength(2)
	expect(result.entities.map((e) => e.name)).toContain('John Smith')
	expect(result.entities.map((e) => e.name)).toContain('Alice Johnson')
})

test('searchGraph handles multiple search terms', () => {
	const result = searchGraph(mockGraph, 'John Tim')
	expect(result.entities).toHaveLength(3)
	expect(result.relationships).toHaveLength(2)
})

test('searchGraph handles quoted search terms', () => {
	const result = searchGraph(mockGraph, '"father of"')
	expect(result.relationships).toHaveLength(1)
	expect(result.relationships[0]?.type).toBe('father of')
})

test('searchGraph returns empty results for no matches', () => {
	const result = searchGraph(mockGraph, 'nonexistent')
	expect(result.entities).toHaveLength(0)
	expect(result.relationships).toHaveLength(0)
})
