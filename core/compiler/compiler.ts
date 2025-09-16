import type { ModuleDescriptor } from "../di/types.ts";
import type { Any, Ctr, Target } from "../meta/mod.ts";
import { readMetadataObject } from "../meta/mod.ts";
import { Injector } from "../di/injector.ts";
import { debuglog } from "../utils/debuglog.ts";

const log = debuglog("core:compiler");

export type CompiledMethod = {
  /**
   * Metadata associated with the method (e.g., HTTP method, route info).
   */
  meta: unknown;

  /**
   * The actual method handler function, bound to the instance context.
   */
  handler: Target;

  /**
   * The name of the method.
   */
  name: string;
};

export type CompiledGateway = {
  /**
   * Metadata associated with the gateway (e.g., controller info).
   */
  meta: unknown;

  /**
   * The instance of the gateway class.
   */
  instance: unknown;

  /**
   * List of compiled methods within the gateway.
   */
  methods: CompiledMethod[];
};

export type CompiledModule = {
  /**
   * Metadata associated with the module (e.g., imports, providers, gateways).
   */
  meta: ModuleDescriptor;

  /**
   * The instance of the module class.
   */
  instance: unknown;

  /**
   * List of compiled gateways (controllers) within the module.
   */
  controllers: CompiledGateway[];

  /**
   * List of compiled imported modules.
   */
  imports: CompiledModule[];
};

/**
 * Compiler class that compiles module classes into compiled modules.
 * It resolves all gateways, imported modules, and their dependencies.
 */
export class Compiler {
  protected readonly resolved: WeakMap<Ctr, CompiledModule | CompiledGateway> = new WeakMap();

  /**
   * Compile the given class constructor
   * @param ctr
   */
  async compile(ctr: Ctr) {
    const end = log.start();
    const compiled = await this.module(ctr);
    end("module compiled");
    return compiled;
  }

  protected async gateway(ctr: Ctr, injector: Injector): Promise<CompiledGateway | null> {
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
      // takes only methods
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
      throw new Error(`Gateway "${ctr.name}" has no methods. Did you forget to add decorate endpoints?`);
    }

    const instance = await injector.register(ctr).resolve(ctr);

    // add handler with context to each method
    const methods = props.map((obj) => {
      const name = obj.name as keyof typeof instance;
      const handler = (instance as Any)[name].bind(instance);
      return {
        ...obj,
        handler,
      };
    });

    return { meta, instance, methods };
  }

  protected async module(ctr: Ctr): Promise<CompiledModule> {
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

    const mod: CompiledModule = { meta, instance, controllers, imports };
    this.resolved.set(ctr, mod);
    return mod;
  }
}
