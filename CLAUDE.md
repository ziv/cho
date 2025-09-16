# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Testing:**

- `deno test --allow-env` - Run all tests

**Development:**

- There is no development server.

**Documentation:**

- `cd docs && npm run docs:build` - Build the documentation site

## Architecture Overview

CHO is a decorator-based framework for building modular applications using JavaScript stage 3 decorators (not TypeScript
decorators). The framework is designed to be engine-agnostic and minimal.

### Core Structure

**Core Module (`core/`):**

- `di/` - Dependency Injection system with `@Injectable` and `@Module` decorators
- `utils/` - Utility functions (debuglog, environment helpers)
- `meta/` - Metadata system for decorators

**Web Module (`web/`):**

- Building block decorators for web applications: `@Controller`, `@Feature`
- HTTP endpoint decorators: `@Controller`, `@Feature`, `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`
- Parameter functions: `@Params()`, `@Body()`, `@Query()`, `@Header()`, `@Cookie()`
- Advanced HTTP decorators: `@Sse`, `@WebSocket`, `@Stream`, `@Middlewares`

**Vendor Module (`vendor/`):**

- Integrations with third-party libraries (e.g., Oak framework for Deno)

### Key Concepts

1. **Dependency Injection**: Uses `@Injectable` classes and `@Module` containers with provider-based dependency
   resolution
2. **Web Controllers**: Use `@Controller(route)` with method decorators like `@Get(path)`
3. **Features**: Use `@Feature` for modular application composition with imports, providers, and controllers

### Import Structure

The codebase uses internal imports with `@chojs/` prefix:

- `@chojs/core` - Core functionality
- `@chojs/core/di` - Dependency injection
- `@chojs/core/utils` - Utilities
- `@chojs/core/meta` - Metadata handling
- `@chojs/web` - Web framework features
- `@chojs/vendor` - External integrations

### Development Notes

- Main language: TypeScript
- Uses JavaScript stage 3 decorators (different from TypeScript experimental decorators)
- Framework is environment-agnostic (works with Node.js, Deno, Bun, Cloudflare Workers)
- Test files use `_test.ts` suffix
- Code formatting uses 120 character line width
