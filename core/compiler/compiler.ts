import type { Any, Ctr, Target } from "../meta/mod.ts";
import type {
  ChoErrorHandler,
  ChoErrorHandlerFn,
  ChoMiddleware,
  ChoMiddlewareFn,
  ModuleDescriptor,
} from "../di/types.ts";
import { readMetadataObject } from "../meta/mod.ts";
import { Injector } from "../di/injector.ts";
import { debuglog } from "../utils/debuglog.ts";
import { isClass, isClassImplement } from "../utils/is.ts";

const log = debuglog("core:compiler");

export type Compiled<M, T> = T & {
  /**
   * Middlewares associated with the module, controller or method.
   */
  middlewares: ChoMiddlewareFn[];

  /**
   * Metadata associated with the method (e.g., HTTP method, route info).
   */
  meta: unknown;

  /**
   * The instance of the target class (for modules and gateways) or the handler function (for methods).
   */
  handle: unknown;

  /**
   * Error handler associated with the entity.
   */
  errorHandler?: ChoErrorHandlerFn;
};

export type CompiledMethod = Compiled<unknown, {
  /**
   * The name of the method.
   */
  name: string;
}>;

export type CompiledGateway = Compiled<unknown, {
  /**
   * List of compiled methods within the gateway.
   */
  methods: CompiledMethod[];
}>;

export type CompiledModule = Compiled<ModuleDescriptor, {
  /**
   * List of compiled gateways (controllers) within the module.
   */
  controllers: CompiledGateway[];

  /**
   * List of compiled imported modules.
   */
  imports: CompiledModule[];
}>;

/**
 * Compiler class that compiles module classes into compiled modules.
 * It resolves all gateways, imported modules, and their dependencies.
 */
export class Compiler {
  protected readonly resolved: WeakMap<Ctr, CompiledModule> = new WeakMap();

  /**
   * Compile the given class constructor
   * Return a tree of compiled modules ready for execution
   * @param ctr
   */
  async compile(ctr: Ctr): Promise<CompiledModule> {
    const end = log.start();
    const compiled = await this.module(ctr);
    end(`module "${ctr.name}" compiled`);
    return compiled;
  }

  protected async errorHandler(
    handler: ChoErrorHandlerFn | ChoErrorHandler,
    injector: Injector,
  ): Promise<ChoErrorHandlerFn> {
    if (!isClass(handler)) {
      // function error handler, return as is
      return handler as ChoErrorHandlerFn;
    }
    if (!isClassImplement<ChoErrorHandler>(handler, "catch")) {
      throw new Error(`class ${(handler as Ctr).name} is not an ErrorHandler, it does not implement "catch" method`);
    }
    const instance = await injector
      .register(handler)
      .resolve<ChoErrorHandler>(handler);
    return instance.catch.bind(instance) as ChoErrorHandlerFn;
  }

  protected async middleware(
    mw: Ctr | Target,
    injector: Injector,
  ): Promise<ChoMiddlewareFn> {
    if (typeof mw !== "function") {
      throw new Error(`Middleware is not a class or function: ${mw}`);
    }

    if (!isClass(mw)) {
      // function middleware, return as is
      return mw as ChoMiddlewareFn;
    }

    // is implement ChoMiddlewareFn interface
    if (typeof mw.prototype.handle === "function") {
      const instance = await injector
        .register(mw as Ctr)
        .resolve<ChoMiddleware>(mw as Ctr);
      return instance.handle.bind(instance) as ChoMiddlewareFn;
    }

    // if (typeof mw.prototype.canActivate === "function") {
    //   const instance = await injector
    //     .register(mw as Ctr)
    //     .resolve(mw as Ctr);
    //   // todo add support for guard type middleware
    //   // complete the implementation
    // }

    throw new Error('ChoMiddlewareFn is not middleware class, it does not implement "handle" method');
  }

  protected async endpoint(
    instance: Any,
    name: string,
    meta: unknown,
    injector: Injector,
  ): Promise<CompiledMethod> {
    const handle = (instance as Any)[name as keyof typeof instance].bind(instance);

    const middlewares: ChoMiddlewareFn[] = [];
    for (const mw of ((meta as Any)?.middlewares ?? [])) {
      middlewares.push(await this.middleware(mw, injector));
    }

    const err = (meta as Any)?.errorHandler;
    const errorHandler = err ? await this.errorHandler(err, injector) : undefined;

    return { meta, errorHandler, middlewares, handle, name };
  }

  protected async gateway(
    ctr: Ctr,
    injector: Injector,
  ): Promise<CompiledGateway | null> {
    const meta = readMetadataObject(ctr);
    if (!meta) {
      // not a gateway, next
      return null;
    }

    // props
    const props = (
      Object.getOwnPropertyNames(
        ctr.prototype,
      ) as (string & keyof typeof ctr.prototype)[]
    )
      // takes only methods, but not constructor
      .filter((name) => name !== "constructor")
      .filter((name) => typeof ctr.prototype[name] === "function")
      // add metadata to each method
      .map((name) => ({
        name,
        meta: readMetadataObject(ctr.prototype[name]),
      }))
      // filter out methods without metadata
      .filter(({ meta }) => meta !== undefined);

    if (0 === props.length) {
      throw new Error(`Gateway "${ctr.name}" has no methods. Did you forget to decorate endpoints?`);
    }

    const instance = await injector.register(ctr).resolve(ctr);

    const methods: CompiledMethod[] = [];
    for (const prop of props) {
      methods.push(await this.endpoint(instance, prop.name, prop.meta, injector));
    }

    const middlewares: ChoMiddlewareFn[] = [];
    for (const mw of ((meta as Any).middlewares ?? [])) {
      middlewares.push(await this.middleware(mw, injector));
    }

    const err = (meta as Any)?.errorHandler;
    const errorHandler = err ? await this.errorHandler(err, injector) : undefined;

    return { meta, errorHandler, middlewares, methods, handle: instance };
  }

  protected async module(
    ctr: Ctr,
  ): Promise<CompiledModule> {
    // module is processed only once
    if (this.resolved.has(ctr)) {
      return this.resolved.get(ctr) as CompiledModule;
    }

    const meta = readMetadataObject<ModuleDescriptor>(ctr);
    if (!meta) {
      throw new Error(`Class ${ctr.name} is not a module. Did you forget to add @Module()?`);
    }

    // create injector for the module while resolving its dependencies
    const injector = await Injector.get(ctr);
    const instance = await injector.register(ctr);

    const controllers = [];
    for (const gw of (meta.controllers ?? [])) {
      const gateway = await this.gateway(gw, injector);
      if (gateway) {
        controllers.push(gateway);
      }
    }

    const imports = [];
    for (const im of (meta.imports ?? [])) {
      imports.push(await this.module(im));
    }

    // collect all middlewares and if there are any classes, register them in the injector
    const middlewares: ChoMiddlewareFn[] = [];
    for (const mw of ((meta as Any)?.middlewares ?? [])) {
      middlewares.push(await this.middleware(mw, injector));
    }

    const err = meta?.errorHandler;
    const errorHandler = err ? await this.errorHandler(err, injector) : undefined;

    const mod: CompiledModule = { meta, errorHandler, middlewares, controllers, imports, handle: instance };
    this.resolved.set(ctr, mod);
    return mod;
  }
}
