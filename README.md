# ScoreLang: Football Tournament DSL

ScoreLang is a domain-specific language (DSL) for tracking and calculating football (soccer) tournament scores and standings.

## Project Structure

This repository is organized as a monorepo with the following packages:

- [`packages/lang`](./packages/lang): Core language implementation, parser, and CLI tool
- [`packages/web`](./packages/web): Web interface for ScoreLang

## Getting Started

This project uses [Bun](https://bun.sh/) as its package manager and runtime.

```bash
# Install dependencies
bun install

# Build all packages
bun run build
```

See the individual package READMEs for more detailed usage instructions:

- [Language Package README](./packages/lang/README.md)
- [Web Interface README](./packages/web/README.md)
