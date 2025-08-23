import { DependsOn, Imports, Provide } from "../core/di/fn.ts";
import { Injectable, Injector, Module } from "@cho/core/di";
import { MongoClient } from "mongodb";

// foo

@Injectable(DependsOn("bar", "foo"))
class ServiceFoo {
  constructor(readonly foo: string, readonly bar: string) {
  }
}

@Module(
  Provide("foo", () => "Foo Value"),
  Provide("bar", async () => {
    const mongodb = Deno.env.get("MONGO");
    const client = new MongoClient(mongodb);
    await client.connect();
    return client;
  }),
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

const injector = new Injector(ModuleBar);
const value = await injector.resolve(ServiceFoo);
console.log(typeof value);

Deno.exit(0);
