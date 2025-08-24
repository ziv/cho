export function env(key: string) {
  // if deno
  if ("Deno" in globalThis && Deno?.env?.get) {
    return Deno.env.get(key);
  }
  // if bun
  if ("Bun" in globalThis && Bun?.env) {
    return Bun.env[key];
  }
  // if node
  if ("process" in globalThis && process?.env) {
    return process.env[key];
  }
  return undefined;
}
