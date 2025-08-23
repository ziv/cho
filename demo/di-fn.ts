import { dependsOn, imports, provide } from "../core/di/fn.ts";
import { Injectable, Module } from "../core/di/decorators.ts";
import { GetInjector } from "../core/di/meta.ts";

// foo

@Injectable(dependsOn("bar", "foo"))
class ServiceFoo {
  constructor(private foo: string, private bar: string) {
  }
}

@Module(
  provide("foo", () => "Foo Value"),
  provide("bar", () => "Bar Value"),
  provide(ServiceFoo),
)
class ModuleFoo {
}

@Injectable(dependsOn(ServiceFoo))
class ServiceBar {
  constructor(readonly foo: ServiceFoo) {
  }
}
@Module(
  imports(ModuleFoo),
  provide(ServiceBar),
)
class ModuleBar {
}

const injector = GetInjector(ModuleBar);
const value = await injector.resolve(ServiceBar);
console.log(value);
