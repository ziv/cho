#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

const USAGE =
  `Usage: ./scripts/next-version.ts <path-to-jsr.json> <new-version>`;

function bail(message: string, code: number) {
  console.error(message);
  Deno.exit(code);
}

const path = Deno.args[0];
if (!path) {
  bail(USAGE, 1);
}

const version = Deno.args[1];
if (!version) {
  bail(USAGE, 2);
}

const raw = await Deno.readTextFile(path).catch(() => "");
if (!raw) {
  bail(`Cannot read file: ${path}`, 3);
}

const data = JSON.parse(raw);
if (!data.version) {
  bail("No version field in jsr.json", 4);
}

data.version = version;
await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
