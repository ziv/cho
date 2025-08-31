#!/usr/bin/env -S deno run --allow-env --allow-net
import { Injectable, Injector, Module } from "@chojs/core";

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

const injector = await Injector.create(MyModule);
const bar = await injector.resolve(Bar);
console.log(bar);
