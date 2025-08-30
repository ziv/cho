import { DependsOn, Imports, Injectable, Injector, Module, Provide } from "@chojs/core";

// service

@Injectable(
  DependsOn("config"),
)
class Service {
  constructor(readonly config: string) {
  }
}

// modules

@Module(
  Provide(Service),
)
class Foo {}

@Module(
  Imports(Foo),
  Provide("config", () => Promise.resolve("This is a config string")),
)
class Bar {}

const inj = new Injector(Bar);
const service = await inj.resolve(Service);
console.log(service);
