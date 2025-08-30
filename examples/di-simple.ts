import { DependsOn, Injectable, Injector, Module, Provide } from "@chojs/core";

@Injectable(DependsOn("test"))
class Foo {
  constructor(readonly test: string) {
  }
}

@Injectable(DependsOn(Foo, "bar"))
class Bar {
  constructor(readonly foo: Foo, readonly bar: string) {
  }
}

@Module(
  Provide("test", () => Promise.resolve("This is a test string")),
  Provide("bar", () => Promise.resolve("This is a bar string")),
  Provide(Foo),
  Provide(Bar),
)
class MyModule {
}

const injector = new Injector(MyModule);
const bar = await injector.resolve(Bar);
console.log(bar);
