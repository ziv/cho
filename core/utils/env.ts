/**
 * Get environment variable with support for Deno, Bun, and Node.js.
 *
 * @example
 * ```ts
 * const dbHost = env("DB_HOST") ?? "localhost";
 * ```
 *
 * @param key
 */
export function env(key: string) {
  // @ts-ignore
  if ("Deno" in globalThis && globalThis.Deno?.env?.get) {
    // @ts-ignore
    return globalThis.Deno.env.get(key);
  }
  // @ts-ignore
  if ("Bun" in globalThis && globalThis.Bun?.env) {
    // @ts-ignore
    return globalThis.Bun.env[key];
  }
  // @ts-ignore
  if ("process" in globalThis && globalThis.process?.env) {
    // @ts-ignore
    return globalThis.process.env[key];
  }
  return undefined;
}
