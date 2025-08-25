import { build } from "../builder.ts";
import { Feat1 } from "./testing-blocks.ts";

Deno.test("builder_test", () => {
  const data = build(Feat1);
  console.log(data);
});
