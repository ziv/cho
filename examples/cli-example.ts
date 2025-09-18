#!/usr/bin/env deno run --allow-all
import {Application} from "../command/application.ts";
import {Command, Help} from "../command/decorators.ts";
import {Catch, Controller, Module} from "../core/mod.ts";
import {ChoCliContext} from "../command/context.ts";

const helpText = `
A simple CLI application example.

USAGE:
    cli-example [OPTIONS] [name]
    
ARGS:
    <name>    Name to greet (default: World)
    
OPTIONS:
    -h, --help       Print help information
`;

// @Controller()
// class MyController {
//   @Help(helpText)
//   @Main()
//   main(ctx: ChoCommandContext) {
//     if (ctx.args._.length) {
//       console.log("Hello", ctx.args._[0]);
//     } else {
//       console.log("Hello World!");
//     }
//   }
// }

@Controller()
class MyController {
  @Help("bla bla bla")
  @Command("foo")
  main(ctx: ChoCliContext) {
    if (ctx.args._.length) {
      console.log("Hello", ctx.args._[0]);
    } else {
      console.log("Hello World!");
    }
  }
}

function help() {
    console.log(helpText);
}

@Catch(help)
@Module({
  controllers: [MyController],
})
class MyApp {
}

const app = await Application.create(MyApp);
await app.run(Deno.args);

