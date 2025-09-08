#!/usr/bin/env -S deno run --allow-env --allow-net
import { Injectable, Injector, Module } from "@chojs/core";
import { assert } from "@std/assert";

// service

@Injectable({ deps: ["config"] })
class Service {
  constructor(readonly config: string) {
  }
}

// modules

@Module({
  providers: [Service],
})
class Foo {}

@Module({
  imports: [Foo],
  providers: [
    {
      provide: "config",
      factory: () => "This is a config string",
    },
  ],
})
class Bar {}

const inj = await Injector.get(Bar);
const service = await inj.resolve(Service);
console.log(service);

assert(service instanceof Service);
assert(service.config === "This is a config string");
