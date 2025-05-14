# ScoreLang Agent Guidelines

## Development

The development instance of the website is running at http://localhost:5173/

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
