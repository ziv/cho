import type { InjectableDescriptor, ModuleDescriptor, Token } from "./types.ts";
import type { ClassMethodDecorator, Ctr, MetaDecoratorFactory, Target } from "../meta/mod.ts";
import { addToMetadataObject, createMetaDecorator } from "../meta/mod.ts";

/**
 * Mark a class as injectable and create its provider.
 *
 * @example usage without dependencies:
 * ```ts
 * @Injectable()
 * class MyService {}
 * ```
 *
 * @example usage with dependencies:
 * ```ts
 * @Injectable({
 *  deps: [Dep1, Dep2]
 * })
 * class MyService {
 *   constructor(private dep1: Dep1, private dep2: Dep2) {}
 * }
 * ```
 */
export const Injectable: MetaDecoratorFactory<InjectableDescriptor> = createMetaDecorator<InjectableDescriptor>();

/**
 * Mark a class as a module and create its provider.
 * Modules can import other modules and provide services.
 * Module is an injectable itself and can have its own dependencies.
 *
 * @example usage:
 * ```ts
 * @Module({
 *   deps: [Dep1, Dep2], // optional dependencies for the module itself
 *   imports: [OtherModule],
 *   providers: [MyService, { provide: "API_URL", factory: () => Promise.resolve("https://api.example.com") }],
 * })
 */
export const Module: MetaDecoratorFactory<ModuleDescriptor> = createMetaDecorator<ModuleDescriptor>();

/**
 * Add dependencies to an injectable dependency list.
 * Another way to specify dependencies instead of using the `deps` property in `@Injectable` or `@Module`.
 *
 * @example usage:
 * ```ts
 * @Injectable()
 * @Dependencies(Dep1, Dep2)
 * class MyService {
 *  constructor(private dep1: Dep1, private dep2: Dep2) {}
 * }
 * ```
 *
 * @param deps
 * @constructor
 */
export function Dependencies(
  ...deps: Token[]
): ClassDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { deps });
  };
}

export const Deps = Dependencies; // alias

/**
 * Adds middleware to a class or method.
 * Can be applied to controllers, features, or individual methods.
 *
 * @param middlewares - Array of middleware classes or functions
 * @example
 * ```ts
 * @Controller("/api")
 * @Middlewares(AuthMiddleware, LoggingMiddleware)
 * class ApiController {
 *   @Get("/users")
 *   @Middlewares(CacheMiddleware)
 *   getUsers() { ... }
 * }
 * ```
 */
export function Middlewares(
  ...middlewares: (Ctr | Target)[]
): ClassDecorator & ClassMethodDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { middlewares });
  };
}
