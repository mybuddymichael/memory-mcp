import type { Graph } from './index'

// Get the memory file path from the environment variable or use default
const memoryFilePath = process.env.MEMORY_FILE_PATH || './memory.json'

export async function loadGraph(): Promise<Graph> {
	try {
		const file = Bun.file(memoryFilePath)
		const exists = await file.exists()

		if (!exists) {
			return {
				entities: [],
				relationships: [],
			}
		}

		const content = await file.text()
		return JSON.parse(content)
	} catch (error) {
		console.error('Error loading graph:', error)
		return {
			entities: [],
			relationships: [],
		}
	}
}

export async function saveGraph(graph: Graph): Promise<void> {
	try {
		const file = Bun.file(memoryFilePath)
		await Bun.write(file, JSON.stringify(graph))
	} catch (error) {
		console.error('Error saving graph:', error)
		throw error
	}
}
