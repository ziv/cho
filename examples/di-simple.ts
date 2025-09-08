#!/usr/bin/env -S deno run --allow-env --allow-net
import { Injectable, Injector, Module } from "@chojs/core";
import { assert } from "@std/assert";

@Injectable({ deps: ["foo"] })
class Foo {
  constructor(readonly test: string) {
  }
}

@Injectable({ deps: [Foo, "bar"] })
class Bar {
  constructor(readonly foo: Foo, readonly bar: string) {
  }
}

@Module({
  providers: [
    {
      provide: "foo",
      factory: () => Promise.resolve("This is a foo string"),
    },
    {
      provide: "bar",
      factory: () => Promise.resolve("This is a bar string"),
    },
    Foo,
    Bar,
  ],
})
class MyModule {
}

const injector = await Injector.get(MyModule);
const bar = await injector.resolve(Bar);

console.log(bar);
assert(bar instanceof Bar);
assert(bar.foo instanceof Foo);
assert(bar.foo.test === "This is a foo string");
assert(bar.bar === "This is a bar string");
