// import { expect } from "@std/expect";
// import { Controller, Feature, Get } from "./decorators.ts";
// import compiler from "./compiler.ts";
//
// Deno.test("should throw for controller without endpoints", async () => {
//   @Controller("test")
//   class TestController {}
//
//   @Feature({ route: "feature", controllers: [TestController] })
//   class TestFeature {}
//
//   await expect(compiler(TestFeature)).rejects.toThrow();
// });
//
// Deno.test("should compile empty feature", async () => {
//   @Feature({ route: "feature", controllers: [] })
//   class TestFeature {}
//
//   const linked = await compiler(TestFeature);
//   expect(linked).toBeDefined();
//   expect(linked.route).toBe("feature");
//   expect(linked.controllers.length).toBe(0);
//   expect(linked.features.length).toBe(0);
//   expect(linked.middlewares.length).toBe(0);
// });
//
// Deno.test("should compile feature with controller with endpoints", async () => {
//   @Controller("test")
//   class TestController {
//     @Get("endpoint")
//     testMethod() {
//       return "test";
//     }
//   }
//
//   @Feature({ route: "feature", controllers: [TestController] })
//   class TestFeature {}
//
//   const linked = await compiler(TestFeature);
//   // console.log(linked);
//   expect(linked).toBeDefined();
//   expect(linked.route).toBe("feature");
//   expect(linked.controllers.length).toBe(1);
//   expect(linked.features.length).toBe(0);
//   expect(linked.middlewares.length).toBe(0);
//
//   const linkedController = linked.controllers[0];
//   expect(linkedController.route).toBe("test");
//   expect(linkedController.methods.length).toBe(1);
//   expect(linkedController.middlewares.length).toBe(0);
//
//   const linkedMethod = linkedController.methods[0];
//   expect(linkedMethod.route).toBe("endpoint");
//   expect(linkedMethod.type).toBe("GET");
//   expect(linkedMethod.middlewares.length).toBe(0);
//
//   expect(linkedMethod.handler()).toBe("test");
// });
