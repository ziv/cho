#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env
import { HonoLinker } from "@chojs/vendor";
import { build, buildRef } from "@chojs/web";
import { showRoutes } from "hono/dev";
import { ExampleFeature } from "./entities.ts";

// build the application
const ref = await buildRef(build(ExampleFeature));

const linker = new HonoLinker();

// linking
linker.link(ref);

// show routes (hono dev tool)
showRoutes(linker.ref());

// serve
Deno.serve(linker.handler());
