import { DependsOn, Imports, Provide } from "../core/di/fn.ts";
import { Injectable, Module } from "../core/di/decorators.ts";
import { GetInjector } from "../core/di/meta.ts";

// foo

@Injectable(DependsOn("bar", "foo"))
class ServiceFoo {
  constructor(private foo: string, private bar: string) {
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

const injector = GetInjector(ModuleBar);
const value = await injector.resolve(ServiceBar);
console.log(value);
