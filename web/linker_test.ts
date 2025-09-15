import { Controller, Feature, Get, Post } from "./decorators.ts";
import { Compiler } from "./compiler.ts";
import { Adapter } from "./interfaces/mod.ts";
import { Linker } from "./linker.ts";
import { Any } from "@chojs/core/meta";

Deno.test("Linker", async () => {
  class TestAdapter implements Adapter {
    createContext(raw: any) {
      return { raw, test: true };
    }
    createMiddleware(mw: (ctx: any, next: any) => void) {
      return { mw, test: true };
    }

    createController(mds: any[]) {
      return { mds, test: true };
    }

    createFeature(mds: any[]) {
      return { mds, test: true };
    }

    mountEndpoint(ctr: any, mws: any[], endpoint: any, route: string, httpMethod: string) {
      return;
    }

    mountController(feat: any, controller: any, route: string, errorHandler?: any) {
      return;
    }

    mountFeature(feat: any, controller: any, route: string, errorHandler?: any) {
      return;
    }

    mountApp(root: any, route: string) {
      return { counter: this.counter } as Any;
    }
  }

  @Controller("test")
  class TestController {
    @Get("a")
    a() {
      return "a";
    }

    @Post("b")
    b() {
      return "b";
    }
  }

  @Feature({
    controllers: [TestController],
  })
  class TestFeature {
  }

  const compiled = await new Compiler().compile(TestFeature);
  const linked = new Linker(new TestAdapter()).link(compiled);

  // todo complete tests...(assertions)
});
