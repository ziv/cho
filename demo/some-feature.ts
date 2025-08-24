import { Feature } from "../web/decorators.ts";
import { Controllers } from "../web/fn.ts";
import { SomeController } from "./some-controller.ts";

@Feature(
  Controllers(SomeController),
)
export class SomeService {
}
