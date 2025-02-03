# Template REST API

This is a template REST API built with Fastify and TypeScript. It includes various plugins and configurations to help you get started quickly.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Plugins](#plugins)
- [Scripts](#scripts)
- [License](#license)

## Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

## Configuration

Copy the [`.env.example`](.env.example) file to [`.env`](.env) and update the environment variables as needed:

```sh
cp .env.example .env
```

## Usage

### Development

To start the server in development mode:

```sh
pnpm start:dev
```

### Production

To build and start the server in production mode:

```sh
pnpm build
pnpm start:prod
```

## Plugins

This template includes several plugins to extend Fastify's functionality:

- **ACL Plugin**: Handles access control logic. See [`src/plugins/acl.ts`](src/plugins/acl.ts).
- **Reply Plugin**: Adds custom response methods. See [`src/plugins/reply.ts`](src/plugins/reply.ts).
- **Route Plugin**: Adds public and private route decorators. See [`src/plugins/route.ts`](src/plugins/route.ts).
- **Database Plugin**: Manages database connections. See [`src/plugins/db.ts`](src/plugins/db.ts).

## Scripts

- `pnpm build`: Compiles the TypeScript code.
- `pnpm format`: Formats the code using Prettier.
- `pnpm start`: Starts the server.
- `pnpm start:dev`: Starts the server in development mode.
- `pnpm start:debug`: Starts the server in debug mode.
- `pnpm start:prod`: Starts the server in production mode.
- `pnpm lint`: Lints the code using ESLint.
- `pnpm test`: Runs the tests using Jest.
- `pnpm test:watch`: Runs the tests in watch mode.
- `pnpm test:cov`: Runs the tests and generates a coverage report.
- `pnpm test:debug`: Runs the tests in debug mode.

## License

This project is licensed under the MIT License.
