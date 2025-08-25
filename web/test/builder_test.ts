import { expect } from "@std/expect";
import { build } from "../builder.ts";
import { Feat1 } from "./testing-blocks.ts";

Deno.test("builder_test", () => {
  const data = build(Feat1);
  expect(data).toHaveProperty("ctr", Feat1);
  expect(data).toHaveProperty("controllers");
  // todo complete tests
  // console.log(data);
});
