import type { Any, Target } from "@chojs/core/meta";
import { debuglog } from "@chojs/core/utils";
import type { CompiledFeature, CompiledMethod } from "./compiler.ts";
import type {
  Adapter,
  ErrorHandlerFn,
  SseAdapter,
  StreamAdapter,
  StreamingApi,
  TextStreamAdapter,
} from "./interfaces/mod.ts";

const log = debuglog("web:linker");

export type ErrorHandling = { onError: ErrorHandlerFn };

/**
 * Linker class to connect compiled features with a specific web framework using an adapter.
 *
 * @template Application The type of the application instance (e.g., Express app, Koa app).
 * @template Feature The type of the feature instance (e.g., Express router, Koa router).
 */
export class Linker<
  Application extends ErrorHandling = Any,
  Feature extends ErrorHandling = Any,
> {
  readonly stack: string[] = [];
  constructor(readonly adapter: Adapter) {
  }

  /**
   * Link a compiled feature to an application instance using the provided adapter.
   * @param root
   */
  link(root: CompiledFeature): Application {
    return this.adapter.mountApp<Application>(this.apply(root), root.route);
  }

  protected apply(ref: CompiledFeature): Feature {
    const feature = this.adapter.createFeature(ref.middlewares.map(this.adapter.createMiddleware));
    this.stack.push(ref.route);

    if (ref.errorHandler && typeof feature.onError === "function") {
      feature.onError(ref.errorHandler);
    }

    for (const cc of ref.controllers) {
      const controller = this.adapter.createController(cc.middlewares.map(this.adapter.createMiddleware));

      if (cc.errorHandler && typeof controller.onError === "function") {
        controller.onError(cc.errorHandler);
      }

      for (const cm of cc.methods) {
        const type = cm.type.toLocaleLowerCase();
        let endpoint;
        switch (type) {
          case "get":
          case "post":
          case "put":
          case "delete":
          case "patch":
            endpoint = this.linkHttp(cm);
            break;
          case "sse":
            if ("createSseEndpoint" in this.adapter) {
              endpoint = (this.adapter as SseAdapter).createSseEndpoint(
                this.linkStream(cm),
              );
            }
            break;
          case "sse_async":
            if ("createSseEndpoint" in this.adapter) {
              endpoint = (this.adapter as SseAdapter).createSseEndpoint(
                this.linkAsyncStream(cm, "writeSSE" as keyof StreamingApi),
              );
            }
            break;
          case "stream":
            if ("createStreamEndpoint" in this.adapter) {
              endpoint = (this.adapter as StreamAdapter).createStreamEndpoint(
                this.linkStream(cm),
              );
            }
            break;
          case "stream_async":
            if ("createStreamEndpoint" in this.adapter) {
              endpoint = (this.adapter as StreamAdapter).createStreamEndpoint(
                this.linkAsyncStream(cm, "write"),
              );
            }
            break;
          case "stream_text":
            if ("createTextStreamEndpoint" in this.adapter) {
              endpoint = (this.adapter as TextStreamAdapter).createTextStreamEndpoint(
                this.linkStream(cm),
              );
            }
            break;
          case "stream_text_async":
            if ("createTextStreamEndpoint" in this.adapter) {
              endpoint = (this.adapter as TextStreamAdapter).createTextStreamEndpoint(
                this.linkAsyncStream(cm, "writeln"),
              );
            }
            break;

          default: {
            // probably a custom method type
            log.error(`unsupported method type: ${type}`);
            // throw new Error(`Unsupported method type: ${cm.type}`);
            continue;
          }
        }
        // what if no endpoint could be created?!
        // an error suppose to be thrown above already
        if (!endpoint) {
          continue;
        }
        const route = [ref.route, cc.route, cm.route].filter(Boolean).join("/");
        log(`Mounting ${cm.type} /${route}`);
        this.adapter.mountEndpoint(
          controller,
          cm.middlewares.map(this.adapter.createMiddleware),
          endpoint,
          cm.route,
          cm.type,
        );
      }
      this.adapter.mountController(feature, controller, cc.route, cc.errorHandler);
    }

    for (const f of ref.features) {
      this.adapter.mountFeature(feature, this.apply(f), f.route, f.errorHandler);
    }
    return feature;
  }

  protected linkHttp(cm: CompiledMethod): Target {
    const createContext = this.adapter.createContext.bind(this.adapter);
    return async function (raw: Any) {
      const ctx = createContext(raw);
      const args = await cm.args(ctx);
      const res = await cm.handler(...args, ctx);
      if (res instanceof Response) {
        return res;
      }
      return ctx.json(res);
    };
  }

  protected linkStream(cm: CompiledMethod): Target {
    const createContext = this.adapter.createContext.bind(this.adapter);
    return async function (raw: Any, stream: StreamingApi) {
      const ctx = createContext(raw);
      const args = await cm.args(ctx);
      await cm.handler(...args, stream, ctx);
    };
  }

  protected linkAsyncStream(cm: CompiledMethod, method: keyof StreamingApi): Target {
    const createContext = this.adapter.createContext.bind(this.adapter);
    return async function (raw: Any, stream: StreamingApi) {
      const ctx = createContext(raw);
      const args = await cm.args(ctx);
      const generator = cm.handler(...args, ctx);
      if (generator[Symbol.asyncIterator] == null) {
        // todo add test to this check...
        throw new Error("Method not return an async generator");
      }
      if (stream[method] == null) {
        throw new Error(`Streaming method ${method} not implemented by the adapter`);
      }
      if (typeof stream[method] !== "function") {
        throw new Error(`Streaming method ${method} is not a function`);
      }
      for await (const next of generator) {
        stream[method](next as never);
      }
      await stream.close();
    };
  }
}
