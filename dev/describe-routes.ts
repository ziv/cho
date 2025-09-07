import { blue, cyan, green } from "@std/fmt/colors";
import { type Ctr, readMetadataObject } from "@chojs/core";
import type { ControllerDescriptor, FeatureDescriptor, MethodDescriptor } from "@chojs/web";
import { NotControllerError, NotFeatureError } from "@chojs/web";

const isMethod = (ctr: Ctr) => (name: string) => typeof ctr.prototype[name] === "function";
const notConstructor = () => (name: string) => name !== "constructor";

const F = blue("F");
const C = cyan("C");

export function describeRoutes(input: Ctr) {
  function describeMethod(ctr: Ctr, name: string, depth: number, prefix: string) {
    const meta = readMetadataObject<MethodDescriptor>(ctr.prototype[name]);
    if (!meta) {
      return;
    }

    const route = `${prefix}${meta.route}`;
    const padding = "  ".repeat(depth * 2);
    const m = (meta.middlewares ?? []).length;
    const type = green(meta.type);

    console.log(padding, `    ${type} ${route} (${m} middleware${m === 1 ? "" : "s"})`);
  }

  function describeController(ctr: Ctr, depth: number, prefix: string) {
    const meta = readMetadataObject<ControllerDescriptor>(ctr);
    if (!meta) {
      throw new NotControllerError(ctr);
    }

    const route = `${prefix}${meta.route}`;
    const padding = "  ".repeat(depth * 2);
    const m = (meta.middlewares ?? []).length;

    console.log(padding, `  ${route} (${C}, ${m} middleware${m === 1 ? "" : "s"})`);

    const props = Object.getOwnPropertyNames(
      ctr.prototype,
    ) as (string & keyof typeof ctr.prototype)[];

    // get methods that have metadata
    for (const m of props.filter(notConstructor()).filter(isMethod(ctr))) {
      describeMethod(ctr, m, depth, route);
    }
  }

  function describeFeature(ctr: Ctr, depth: number, prefix = "/") {
    const meta = readMetadataObject<FeatureDescriptor>(ctr);
    if (!meta) {
      throw new NotFeatureError(ctr);
    }
    const route = `${prefix}${meta.route}`;
    const padding = "  ".repeat(depth * 2);
    const m = (meta.middlewares ?? []).length;

    console.log(padding, `${route} (${F}, ${m} middleware${m === 1 ? "" : "s"})`);

    for (const c of meta.controllers ?? []) describeController(c, depth, route);

    for (const f of meta.features ?? []) describeFeature(f, depth + 1, route);
  }

  describeFeature(input, 0);
}
