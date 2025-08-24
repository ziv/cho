// declare var Deno: any;
// declare var Bun: any;
// declare var process: any;

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
  if ("Deno" in globalThis && Deno?.env?.get) {
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

/**
 * Get environment variable as number.
 *
 * @example
 * ```ts
 * const port = envnum("PORT") ?? 3000;
 * ```
 *
 * @param key
 */
export function envnum(key: string) {
  return Number(env(key));
}

/**
 * Get environment variable as boolean.
 * Recognizes "1", "true", "yes", "on" (case-insensitive) as true.
 *
 * @param key
 */
export function envbool(key: string) {
  const val = env(key);
  if (!val) return false;
  return ["1", "true", "yes", "on"].includes(val.toLowerCase());
}
