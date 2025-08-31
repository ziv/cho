// import { DependsOn, Imports, Injectable, Module, Provide } from "../mod.ts";
// import { expect } from "@std/expect";
// import { Injector } from "../injector.ts";
//
// @Injectable(DependsOn("bar", "foo"))
// class ServiceFoo {
//   constructor(readonly foo: string, readonly bar: string) {
//   }
// }
//
// @Module(
//   Provide("foo", () => "Foo Value"),
//   Provide("bar", () => "Bar Value"),
//   Provide(ServiceFoo),
// )
// class ModuleFoo {
// }
//
// @Injectable(DependsOn(ServiceFoo))
// class ServiceBar {
//   constructor(readonly foo: ServiceFoo) {
//   }
// }
// @Module(
//   Imports(ModuleFoo),
//   Provide(ServiceBar),
// )
// class ModuleBar {
// }
//
// const foo = new Injector(ModuleFoo);
// const bar = new Injector(ModuleBar);
//
// Deno.test("Should throw for multiple injectors", () => {
//   expect(() => new Injector(ModuleFoo)).toThrow();
// });
//
// Deno.test("DI should resolve ModuleFoo(foo) dependency", async () => {
//   expect(await foo.resolve("foo")).toBe("Foo Value");
// });
//
// Deno.test("DI should resolve ModuleFoo(bar) dependency", async () => {
//   expect(await foo.resolve("bar")).toBe("Bar Value");
// });
//
// Deno.test("DI should resolve ModuleFoo(ServiceFoo) dependency", async () => {
//   const resolved = await foo.resolve(ServiceFoo);
//   expect(resolved).toBeInstanceOf(ServiceFoo);
//   expect(resolved).toHaveProperty("foo");
//   expect(resolved).toHaveProperty("bar");
// });
//
// Deno.test("DI should resolve ModuleBar(ServiceBar) dependency", async () => {
//   const resolved = await bar.resolve<ServiceBar>(ServiceBar);
//   expect(resolved).toBeInstanceOf(ServiceBar);
//   expect(resolved).toHaveProperty("foo");
//   expect(resolved.foo).toBeInstanceOf(ServiceFoo);
// });
