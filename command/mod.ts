/**
 * CLI Application Module
 *
 * Parsing args using minimist api
 * The controller can have the "@Main" decorator to indicate the main entry point
 * Or use multiple "@Command('name')" to define sub-commands
 *
 * "@Main" and "@SubCommand" are not allowed in the same controller.
 * If a controller contain a "@Main", the linker will not continue to search for other sub-commands.
 * If a controller contain multiple "@Command", it will throw an error if it will find "@Main" in the same controller.
 *
 * @Controller()
 * class CliController {
 *
 *  @Main()
 *  main() {
 *
 *  }
 * }
 */
export * from "./decorators.ts";
export * from "./linker.ts";
