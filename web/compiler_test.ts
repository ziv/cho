import {expect} from "@std/expect";
import {Controller, Feature} from "./decorators.ts";
import compiler from "./compiler.ts";

Deno.test("should throw for controller without endpoints", async () => {
  @Controller("test")
  class TestController {}

  @Feature({ route: "feature", controllers: [TestController] })
  class TestFeature {}

  await expect(compiler(TestFeature)).rejects.toThrow();
});
