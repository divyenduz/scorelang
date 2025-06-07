# ScoreLang Agent Guidelines

## Development

The development instance of the website is always running at http://localhost:5173/ (don't try to run it, if you can't reach the sever stop). Prefer to use this and the browser screenshot tool to test your work at most of the times.

Occasionally `bun test` and `bun run tsc` to test your work.

Run `bun run build` only when you can't test it with above mentioned ways.

## Commands

- Run tests: `bun test`
- Run specific test: `bun test src/lexer.test.ts`
- Build project: `bun build ./src/index.ts --compile --outfile scorelang`

## Code Style Guidelines

- **Imports**: Use named imports for specific components, default exports for main classes
- **Types**: Use TypeScript with explicit type annotations, const assertions when appropriate
- **Error handling**: Use console.log for errors, return null/ILLEGAL tokens for invalid inputs
- **Naming conventions**:
  - Classes: PascalCase (e.g., Lexer)
  - Methods/variables: camelCase
  - Constants: UPPER_SNAKE_CASE for token types
- **Formatting**: 2-space indentation, semicolons at end of statements
- **Class structure**: Private methods prefixed with 'private', constructor parameters prefixed with 'private' when appropriate
