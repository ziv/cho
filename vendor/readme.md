# @chojs/vendor

Links to third-party modules used by the `cho` framework.

| Component                     | Linker                          |
| ----------------------------- | ------------------------------- |
| [Hono](https://hono.dev/)     | [Hono Linker](./hono/readme.md) |
| [Oak](https://oakserver.org/) | [Oak Linker](./oak/readme.md)   |

## Installation

```
deno add jsr:@chojs/vendor
```

## Usage

See the readme files of each module for usage instructions.

#### Hono Web Application

```ts
import { HonoLinker } from "@chojs/vendor/hono";
import { createApplication } from "@chojs/web";

const app = await createApplication(AppModule, {
  linker: new HonoLinker(),
});
```

#### Oak Web Application

`OakLinker` is the default linker of `@chojs/web`, so you can omit the `linker` option.

```ts
import { OakLinker } from "@chojs/vendor/oak";
import { createApplication } from "@chojs/web";

const app = await createApplication(AppModule, {
  linker: new OakLinker(),
});
```

## Implementation Matrix

| Feature                   | Hono | Oak |
| ------------------------- | ---- | --- |
| HTTP Endpoints            | ✅   | ✅  |
| Middleware                | ✅   | ✅  |
| Guards Middleware pattern | ❌   | ❌  |
| WebSockets endpoints      | ❌   | ❌  |
| SSE endpoints             | ❌   | ❌  |
| Static files serving      | ❌   | ❌  |
| Streaming endpoint        | ❌   | ❌  |
| Static file serving       | ❌   | ❌  |
