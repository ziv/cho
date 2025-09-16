// import type { Compiled, CompiledGateway, CompiledMethod, CompiledModule } from "@chojs/core/compiler";
import type {Any} from "@chojs/core/meta";
import {debuglog} from "@chojs/core/utils";
import type {Adapter} from "./adapter.ts";
import {CompiledMethod, CompiledModule} from "../core/compiler/compiler.ts";
import {SSEStreamingApi, StreamingApi} from "./stream-api.ts";
import {ChoWebContext} from "./context.ts";

const log = debuglog("web:linker");

export class Linker {
  constructor(readonly adapter: Adapter) {
  }

  /**
   * Link a compiled module to an application instance using the provided adapter.
   * @param cm
   */
  link(cm: CompiledModule) {
    const end = log.start();
    const app = this.feature(cm);
    if (!app) {
      throw new Error("Cannot link an empty module");
    }
    end("module linked");
    return app;
  }

  protected feature(
    cm: CompiledModule,
  ) {
    let mounted = false;

    const feat = this.adapter.createFeature(
      this.middlewares(cm),
      cm.errorHandler,
    );

    for (const cf of cm.imports) {
      const sub = this.feature(cf);
      if (!sub) {
        continue;
      }
      mounted = true;
      log(`mounting sub-feature: /${cf.meta.route ?? ""}`);
      this.adapter.mountFeature(
        feat,
        sub,
        cf.meta.route ?? "",
      );
    }

    for (const cc of cm.controllers) {
      const ctrl = this.controller(cc);
      if (!ctrl) {
        continue;
      }
      mounted = true;
      log(`mounting controller: /${cc.meta.route ?? ""}`);
      this.adapter.mountController(
        feat,
        ctrl,
        cc.meta.route ?? "",
      );
    }

    if (!mounted) {
      return null;
    }
    return feat;
  }

  protected controller(
    cg: CompiledGateway,
  ) {
    if (0 === cg.methods.length) {
      // no methods, no controller
      return null;
    }
    let mounted = false;
    const controller = this.adapter.createController(
      this.middlewares(cg.meta),
      cg.errorHandler,
    );

    for (const cm of cg.methods) {
      const endpoint = this.method(cm);
      if (!endpoint) {
        continue;
      }
      mounted = true;
      log(`mounting endpoint: [${cm.meta.type}] ${cg.meta.route ?? ""}${cm.meta.route ?? ""}`);
      this.adapter.mountEndpoint(
        controller,
        this.middlewares(cm),
        endpoint,
        cm.meta.route ?? "",
        cm.meta.type,
      );
    }
    if (!mounted) {
      return null;
    }
    return controller;
  }

  /**
   * Return an endpoint for the given compiled method, or null if the method is not an endpoint.
   * todo add extended endpoint support (e.g. websockets, graphql, etc.)
   * @param cm
   */
  protected method(cm: CompiledMethod) {
    const type = cm.meta.type.toLocaleLowerCase();
    switch (type) {
      case "get":
      case "post":
      case "put":
      case "delete":
      case "patch":
        return this.adapter.createEndpoint(this.linkHttp(cm), cm.errorHandler);

        // extended endpoints types
      case "stream":
        if (!this.adapter.createStreamEndpoint) return null;
        return this.adapter.createStreamEndpoint(this.linkStream(cm));

      case "sse":
        if (!this.adapter.createSseEndpoint) return null;
        return this.adapter.createSseEndpoint(this.linkStream(cm));

      case "steam_text":
        if (!this.adapter.createTextStreamEndpoint) return null;
        return this.adapter.createTextStreamEndpoint(this.linkStream(cm));

      case "stream_async":
        if (!this.adapter.createStreamEndpoint) return null;
        return this.adapter.createStreamEndpoint(this.linkAsyncStream(cm, "write"));

      case "sse_async":
        if (!this.adapter.createSseEndpoint) return null;
        return this.adapter.createSseEndpoint(this.linkAsyncStream(cm, "writeSSE"));

      case "steam_text_async":
        if (!this.adapter.createTextStreamEndpoint) return null;
        return this.adapter.createTextStreamEndpoint(this.linkAsyncStream(cm, "writeln"));
      default:
        return null;
    }
  }

  protected linkHttp(cm: CompiledMethod) {
    const context = this.adapter.createContext.bind(this.adapter);
    const getArgs = this.createMethodArgFactory(cm.meta.args);

    return async function (raw: Any) {
      const ctx = context(raw);
      const args = await getArgs(ctx);
      const res = await cm.handle(...args, ctx);
      if (res instanceof Response) {
        return res;
      }
      return ctx.json(res);
    };
  }

  protected linkStream(cm: CompiledMethod): Target {
    const handle = this.adapter.createEndpoint(cm.handle, cm.errorHandler);
    const context = this.adapter.createContext.bind(this.adapter);
    const getArgs = this.createMethodArgFactory(cm.meta.args);

    return async function (raw: Any, stream: StreamingApi) {
      const ctx = context(raw);
      const args = await getArgs(ctx);
      await handle(...args, stream, ctx);
    };
  }

  protected linkAsyncStream(cm: CompiledMethod, method: keyof SSEStreamingApi): Target {
    const handle = this.adapter.createEndpoint(cm.handle, cm.errorHandler);
    const context = this.adapter.createContext.bind(this.adapter);
    const getArgs = this.createMethodArgFactory(cm.meta.args);

    return async function (raw: Any, stream: StreamingApi) {
      if (typeof stream[method] !== "function") {
        throw new Error(`Streaming method ${method} is not a function`);
      }

      const ctx = context(raw);
      const args = await getArgs(ctx);
      const generator = handle(...args, ctx);

      if (generator[Symbol.asyncIterator] == null) {
        // todo add test to this check...
        throw new Error(`Method "${cm.meta.name}" not return an async generator`);
      }

      for await (const next of generator) {
        stream[method](next as never);
      }

      await stream.close();
    };
  }

  /**
   * Return an array of middlewares for the given metadata.
   * @param meta
   * @protected
   */
  protected middlewares(meta: Compiled<unknown, Any>) {
    return (meta.middlewares ?? []).map(this.adapter.createMiddleware);
  }

  protected createMethodArgFactory(
    args: InputFactory[],
  ): MethodArgFactory {
    return async function (ctx: ChoWebContext): Promise<unknown[]> {
      const ret: unknown[] = [];
      for (const argFactory of args) {
        const value = await argFactory(ctx);
        ret.push(value);
      }
      return ret;
    };
  }
}
