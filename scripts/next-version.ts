#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import { format, increment, parse } from "@std/semver";

const path = Deno.args[0];
if (!path) {
  console.error(
    "Usage: ./scripts/next-version.ts <path-to-jsr.json>",
  );
  Deno.exit(1);
}

const raw = await Deno.readTextFile(path).catch(() => "");
if (!raw) {
  console.error(`Cannot read file: ${path}`);
  Deno.exit(2);
}

const data = JSON.parse(raw);
if (!data.version) {
  console.error("No version field in jsr.json");
  Deno.exit(3);
}

data.version = format(increment(parse(data.version), "patch"));
await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
