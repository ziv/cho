#!/usr/bin/env deno run --allow-all
import { Application } from "../command/application.ts";
import { Help, Main } from "../command/decorators.ts";
import { Catch, Controller, Module } from "../core/mod.ts";
import { ChoCliContext } from "../command/context.ts";

@Controller()
class MyController {
  @Help("specific help for main command")
  @Main()
  async main(ctx: ChoCliContext) {
    console.log(Deno.readTextFileSync("./deno.json"));
  }
}

@Catch(() => console.log("app level help when error occurs"))
@Module({
  controllers: [MyController],
})
class MyApp {
}

const app = await Application.create(MyApp);
await app.run(Deno.args);
