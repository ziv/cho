---
outline: [ 2, 4 ]
---

# Specifications: Decorator-based Dependency Injection

<table class="properties">
    <tbody>
        <tr>
            <th>Status</th>
            <td>testing</td>
        </tr>
        <tr>
            <th>Created</th>
            <td>2025-08-10</td>
        </tr>
        <tr>
            <th>Target</th>
            <td>TypeScript (ECMAScript decorators)</td>
        </tr>
    </tbody>
</table>

[[toc]]

## Problem Statement

While DI provides the mechanism to wire up dependencies, we still need a way create entire object graphs and execute the
application.

This RFC proposes the application lifecycle and composition model for building applications with CHO.

## Summary

- Introduce an application lifecycle with bootstrap and shutdown phases.
- Define an application root module as the entry point for configuring the DI context.
- Support module imports to compose larger applications from smaller modules.
- Provide lifecycle hooks for initialization and cleanup.
- Enable configuration and environment-specific overrides via modules.
- Ensure cross-runtime compatibility by avoiding runtime-specific features.

## Terminology

- **Endpoint** : The entry point of the application, e.g., an HTTP server, a CLI command, etc.
- **Controller** : A class that handles incoming requests or commands. A container for endpoints.
- **Module**: A class that provide a DI context. A container for providers and controllers (feature).
- **Middleware**: A function that intercepts process before reaching the endpoint handler.
- **Error Handler**: A function that handles errors thrown during endpoint processing.

## Stages

### Compilation

The first stage takes the root module and build the module graph, resolving all dependencies.
Instantiating all controllers and create unique handlers for each endpoint.

Using the metadata emitted by the decorators, a compile step generates a tree of resolved modules with their providers
and dependencies. 