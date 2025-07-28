import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Get the memory file path from the environment variable
const memoryFilePath = process.env.MEMORY_FILE_PATH;

if (!memoryFilePath) {
	throw new Error("MEMORY_FILE_PATH environment variable is not set.");
}

async function loadGraph() {
	try {
		const file = Bun.file(memoryFilePath);
		const exists = await file.exists();
		
		if (!exists) {
			return {
				entities: {},
				relationships: []
			};
		}
		
		const content = await file.text();
		return JSON.parse(content);
	} catch (error) {
		console.error("Error loading graph:", error);
		return {
			entities: {},
			relationships: []
		};
	}
}

const server = new McpServer({
	name: "memory",
	version: "0.0.1",
	capabilities: {
		resources: {},
		tools: {},
	},
});

server.tool(
	"search_graph",
	"Search the graph for nodes that match the keywords provided.",
	{
		keywords: z
			.string()
			.describe(
				"Keywords to search for. Keywords should be separated by spaces. Wrap a keyword in quotes to use multiple words as a single keyword.",
			),
	},
	async ({ keywords }) => {},
);
