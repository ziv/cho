import {blue, cyan, green} from "@std/fmt/colors";
import {type Ctr, readMetadataObject} from "@chojs/core";
import type {
    ControllerDescriptor,
    FeatureDescriptor,
    MethodDescriptor,
    NotControllerError,
    NotFeatureError,
} from "@chojs/web";

const isMethod = (ctr: Ctr) => (name) => typeof ctr.prototype[name] === "function";
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
    const type = green(meta.type);

    console.log(padding, `    ${type} ${route}`);
  }

  function describeController(ctr: Ctr, depth: number, prefix: string) {
    const meta = readMetadataObject<ControllerDescriptor>(ctr);
    if (!meta) {
      throw new NotControllerError(ctr);
    }

    const route = `${prefix}${meta.route}`;
    const padding = "  ".repeat(depth * 2);

    console.log(padding, `  ${route} (${C})`);

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

    console.log(padding, `${route} (${F})`);

    for (const c of meta.controllers ?? []) describeController(c, depth, route);

    for (const f of meta.features ?? []) describeFeature(f, depth + 1, route);
  }

  describeFeature(input, 0);
}
