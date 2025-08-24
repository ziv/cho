import { Feature } from "../web/decorators.ts";
import { Controllers, Features } from "../web/fn.ts";
import {
  AnotherController,
  SomeController,
  YetAnotherController,
} from "./some-controllers.ts";

@Feature(
  Controllers(YetAnotherController),
)
export class AnotherFeature {
}

@Feature(
  Controllers(SomeController, AnotherController),
  Features(AnotherFeature),
)
export class SomeFeature {
}
