mcp-dev: ## Run all MCP servers in development mode (watch)
	@$(call log_step,Starting MCP servers in development mode...)
	@$(TURBO) run dev --filter="@aiready/mcp-server" --filter="@aiready/ast-mcp-server"

mcp-test: ## Run tests for all MCP servers
	@$(call log_step,Running tests for MCP servers...)
	@$(TURBO) run test --filter="@aiready/mcp-server" --filter="@aiready/ast-mcp-server"

mcp-inspect-readiness: ## Run MCP inspector for the readiness server
	@$(call log_step,Starting MCP Inspector for @aiready/mcp-server...)
	@npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js

mcp-inspect-ast: ## Run MCP inspector for the AST explorer server
	@$(call log_step,Starting MCP Inspector for @aiready/ast-mcp-server...)
	@npx @modelcontextprotocol/inspector node packages/ast-mcp-server/dist/index.js
