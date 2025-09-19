#!/usr/bin/env deno run --allow-all
import { Application } from "../command/application.ts";
import { Help, Main } from "../command/decorators.ts";
import { Catch, Controller, Module } from "../core/mod.ts";
import { ChoCommandContext } from "../command/context.ts";

@Controller()
class MyController {
  @Help("specific help for main command")
  @Main()
  async main(ctx: ChoCommandContext) {
    if (0 === ctx.args._.length) {
      console.log("Hello World!");
      return 0;
    }
    const filePath = ctx.args._[0];
    console.log(Deno.readTextFileSync(filePath));
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
