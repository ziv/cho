/**
 * # Chojs Core Module
 *
 * ## Dependency Injection (DI) System
 *
 * The core module provides a robust and flexible Dependency Injection (DI) system. Using minimal set of decorators
 * and various functions, you can define and manage dependencies in your application with ease.
 *
 * @example Dependency Injection Configuration using Decorators
 *
 * ```ts
 * import { DependsOn, Imports, Provide, Injectable, Injector, Module } from "@cho/core/di";
 *
 * 〇Injectable(DependsOn("bar", "foo"))
 * class ServiceFoo {
 *  constructor(readonly foo: string, readonly bar: string) {
 *  }
 *
 * 〇Module(
 *      Provide("foo", () => Promise.resolve("Bar Value")),
 *      Provide("bar", () => Promise.resolve("Bar Value")),
 *      Provide(ServiceFoo),
 * )
 * class ModuleFoo {}
 *
 * const injector = new Injector(ModuleFoo);
 * const value = await injector.resolve(ServiceFoo);
 * ```
 *
 *
 * ## Utilities
 *
 * Environment variable utilities to seamlessly work across Deno, Bun, and Node.js runtimes.
 *
 * @example Environment Variable Utilities
 *
 * ```ts
 * import { env, envnum, envbool } from "@cho/core/utils";
 *
 * // `env` returns the value of the environment variable as a string or `undefined` if not set.
 * const dbHost = env("DB_HOST") ?? "localhost";
 *
 * // `envnum` returns the value of the environment variable as a number or `NaN` if not set or not a valid number.
 * const port = envnum("PORT") ?? 3000;
 *
 * // `envbool` returns the value of the environment variable as a boolean interpreting "1", "true", "yes", "on" (case-insensitive) as true.
 * const isProduction = envbool("PRODUCTION");
 * ```
 *
 * @module
 */
export * from "./di/mod.ts";
export * from "./di/utils.ts";
