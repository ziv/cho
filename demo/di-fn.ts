import {
  createModule,
  getInjector,
  imports,
  provide,
  setInjectable,
  setModule,
} from "../core/di/fn.ts";

// foo

class ServiceFoo {
  constructor(private foo: string, private bar: string) {}
}
setInjectable(ServiceFoo, {
  dependencies: ["foo", "bar"],
});

class ModuleFoo {}

setModule(
  ModuleFoo,
  createModule(
    provide("foo", () => "Foo Value"),
    provide("bar", () => "Bar Value"),
    provide(ServiceFoo),
  ),
);

// bar

class ServiceBar {
  constructor(readonly foo: ServiceFoo) {
  }
}
setInjectable(ServiceBar, {
  dependencies: [ServiceFoo],
});

class ModuleBar {}
setModule(
  ModuleBar,
  createModule(
    imports(ModuleFoo),
    provide(ServiceBar),
  ),
);
class SomeService {
  constructor(private foo: string, private bar: string) {}
}
setInjectable(SomeService, {
  dependencies: ["foo", "bar"],
});

class SomeModule {}
setModule(
  SomeModule,
  createModule(
    imports(ModuleFoo, ModuleBar),
    provide("foo", () => "Foo Value"),
    provide("bar", () => "Bar Value"),
    provide(SomeService),
  ),
);
const foo = await getInjector(ModuleBar).resolve(ServiceBar);
console.log(foo);
