/**
 * # Dependencies Injection
 *
 * The package provides a simple dependencies injection system. You can use the
 * functional API or the simplified decorators API.
 *
 * ### Provider
 *
 * Provider is recipe for creating or accessing a specific value/instance.
 *
 * ### Module
 *
 * Module is used to encapsulate dependencies injection. Module declares providers.
 * Module can access providers declared by other modules by importing them.
 *
 * ### Injector
 *
 * Injector is used to create/access instances/values of providers. Each module has
 * its own injector. The injector caches instances/values of providers.
 *
 * @module
 * @category @chojs/core/di
 */
export * from "./decorators.ts";
export * from "./fn.ts";
export * from "./meta.ts";
export * from "./injector.ts";
export * from "./types.ts";
export * from "./utils.ts";
