import ChoWebApplication from "../web/application.ts";
import {SomeFeature} from "./some-feature.ts";


const app = await ChoWebApplication.create(SomeFeature);
Deno.serve(app.linker.handler());
