import { Target } from "@chojs/core/meta";
import { Endpoint, Middleware } from "./adapter.ts";

export type SseAdapter = {
  /**
   * Takes cho SSE endpoint handler and converts it to the framework's streaming endpoint
   * The endpoint handler should be an async generator function
   *
   * @param mw
   */
  createSseEndpoint(mw: Target): Endpoint;
};

/**
 * API for writing to a streaming response.
 * Copied from: node_modules/.deno/hono@4.9.2/node_modules/hono/dist/types/utils/stream.d.ts
 * @see node_modules/.deno/hono@4.9.2/node_modules/hono/dist/types/utils/stream.d.ts
 */
export type StreamingApi = {
  responseReadable: ReadableStream;
  /**
   * Whether the stream has been aborted.
   */
  aborted: boolean;
  /**
   * Whether the stream has been closed normally.
   */
  closed: boolean;

  /**
   * Write a chunk to the stream.
   * @param input
   */
  write(input: Uint8Array | string): Promise<StreamingApi>;

  /**
   * Write a line to the stream, appending a newline character.
   * @param input
   */
  writeln(input: string): Promise<StreamingApi>;

  /**
   * Sleep for the given number of milliseconds.
   * @param ms
   */
  sleep(ms: number): Promise<unknown>;

  /**
   * Close the stream.
   */
  close(): Promise<void>;

  /**
   * Pipe a ReadableStream into the stream.
   * @param body
   */
  pipe(body: ReadableStream): Promise<void>;

  /**
   * Register a listener that is called when the stream is aborted.
   * @param listener
   */
  onAbort(listener: () => void | Promise<void>): void;
  /**
   * Abort the stream.
   * You can call this method when stream is aborted by external event.
   */
  abort(): void;
};

export interface SSEMessage {
  data: string | Promise<string>;
  event?: string;
  id?: string;
  retry?: number;
}

export type SSEStreamingApi = StreamingApi & {
  /**
   * Write an SSE message to the stream.
   * @param message
   */
  writeSSE(message: SSEMessage): Endpoint;
};

export type StreamAdapter = {
  /**
   * Takes cho streaming endpoint handler and converts it to the framework's streaming endpoint
   * @param mw
   */
  createStreamEndpoint(mw: Target): Endpoint;
};

export type TextStreamAdapter = {
  /**
   * Takes cho text streaming endpoint handler and converts it to the framework's text streaming endpoint
   * @param mw
   */
  createTextStreamEndpoint(mw: Target): Endpoint;
};
