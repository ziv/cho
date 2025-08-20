import {
  createModule,
  imports,
  provide,
  setInjectable,
  setModule,
} from "../core/di/fn.ts";
import Injector from "../core/di/injector.ts";

class SomeModule {}
class ModuleFoo {}
class ModuleBar {}

class SomeService {
  constructor(private foo: string, private bar: string) {}
}
setInjectable(SomeService, {
  dependencies: ["foo", "bar"],
});

setModule(
  SomeModule,
  createModule(
    imports(ModuleFoo, ModuleBar),
    provide("foo", () => "Foo Value"),
    provide("bar", () => "Bar Value"),
    provide(SomeService),
  ),
);

const inj = new Injector(
  SomeModule,
);

console.log(await inj.resolve("foo"));
