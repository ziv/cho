import { Injectable, Module } from "../di/decorators.ts";
import { DependsOn, Imports, Provide } from "../di/fn.ts";
import { GetInjector } from "../di/meta.ts";
import { expect } from "@std/expect";

@Injectable(DependsOn("bar", "foo"))
class ServiceFoo {
  constructor(readonly foo: string, readonly bar: string) {
  }
}

@Module(
  Provide("foo", () => "Foo Value"),
  Provide("bar", () => "Bar Value"),
  Provide(ServiceFoo),
)
class ModuleFoo {
}

@Injectable(DependsOn(ServiceFoo))
class ServiceBar {
  constructor(readonly foo: ServiceFoo) {
  }
}
@Module(
  Imports(ModuleFoo),
  Provide(ServiceBar),
)
class ModuleBar {
}

Deno.test("DI should resolve ModuleFoo(foo) dependency", async (t) => {
  expect(await GetInjector(ModuleFoo).resolve("foo")).toBe("Foo Value");
});

Deno.test("DI should resolve ModuleFoo(bar) dependency", async (t) => {
  expect(await GetInjector(ModuleFoo).resolve("bar")).toBe("Bar Value");
});

Deno.test("DI should resolve ModuleFoo(ServiceFoo) dependency", async (t) => {
  const resolved = await GetInjector(ModuleFoo).resolve(ServiceFoo);
  expect(resolved).toBeInstanceOf(ServiceFoo);
  expect(resolved).toHaveProperty("foo");
  expect(resolved).toHaveProperty("bar");
});

Deno.test("DI should resolve ModuleBar(ServiceBar) dependency", async (t) => {
  const resolved = await GetInjector(ModuleBar).resolve<ServiceBar>(ServiceBar);
  expect(resolved).toBeInstanceOf(ServiceBar);
  expect(resolved).toHaveProperty("foo");
  expect(resolved.foo).toBeInstanceOf(ServiceFoo);
});
