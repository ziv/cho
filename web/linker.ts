import type { Any, Target } from "@chojs/core";
import type { CompiledFeature, CompiledMethod } from "./compiler.ts";
import type { SseAdapter, StreamAdapter, StreamingApi, TextStreamAdapter } from "./interfaces/adpater-extends.ts";
import type { Adapter } from "./interfaces/adapter.ts";
import { debuglog } from "@chojs/core/utils";

// todo add error handler...

const log = debuglog("web:linker");

export class Linker<
  Application = Any,
  Feature = Any,
> {
  constructor(readonly adapter: Adapter) {
  }

  link(root: CompiledFeature): Application {
    return this.adapter.mountApp<Application>(this.apply(root), root.route);
  }

  protected apply(ref: CompiledFeature): Feature {
    const feature = this.adapter.createFeature(ref.middlewares.map(this.adapter.createMiddleware));

    for (const cc of ref.controllers) {
      const controller = this.adapter.createController(cc.middlewares.map(this.adapter.createMiddleware));

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
                this.linkAsyncStream(cm, "writeSSE"),
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
            throw new Error(`Unsupported method type: ${cm.type}`);
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

  protected linkAsyncStream(cm: CompiledMethod, method: string): Target {
    const createContext = this.adapter.createContext.bind(this.adapter);
    return async function (raw: Any, stream: StreamingApi) {
      const ctx = createContext(raw);
      const args = await cm.args(ctx);
      const generator = cm.handler(...args, ctx);
      if (generator[Symbol.asyncIterator] == null) {
        // todo add test to this check...
        throw new Error("Method not return an async generator");
      }
      const m = method as keyof StreamingApi;
      if (stream[m] == null) {
        throw new Error(`Streaming method ${method} not implemented by the adapter`);
      }
      if (typeof stream[m] !== "function") {
        throw new Error(`Streaming method ${method} is not a function`);
      }
      for await (const next of generator) {
        stream[m](next as never);
      }
      // for await (const next of generator) {
      //   if (stream[method]) {
      //     // stream[method as keyof StreamingApi](next);
      //   }
      // }
      await stream.close();
    };
  }
}
