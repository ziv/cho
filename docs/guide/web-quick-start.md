# Web Server Quick Start

This guide will help you set up a basic web server using **CHO**'s web framework. This is useful for building modern web
applications with dependency injection and decorator-based routing.

## Installation

First, ensure you have **CHO** installed. You can add it to your project using npm or yarn:

::: code-group

```shell [deno]
deno add jsr:@chojs/web jsr:@chojs/vendor-hono
```

```shell [npm]
npx jsr add @chojs/web @chojs/vendor-hono
```

```shell [yarn]
yarn add jsr:@chojs/web @chojs/vendor-hono
```

```shell [pnpm]
pnpm i jsr:@chojs/web @chojs/vendor-hono
```

```shell [bun]
bunx jsr add @chojs/web @chojs/vendor-hono
```

:::

## First Endpoint

Now, let's create a simple controller with an endpoint that responds to HTTP GET requests.

```ts
import {Controller, Get} from "@chojs/web";

@Controller("")
class MyController {
    @Get("hello")
    hello() {
        return {message: "Hello, World!"};
    }
}
```

Controller needs to be registered in a feature to be used by the application. Let's create our root feature.

```ts
import {Feature} from "@chojs/web";
import {MyController} from "./my-controller";

@Feature({
    controllers: [MyController],
})
class RootFeature {
}
```

That's it! You have created your first controller and feature. Next, you need to set up the application to use this
feature.

```ts
import {Application} from "@chojs/web";
import {RootFeature} from "./root-feature";

const app = await Application.create(RootFeature);
```

The last part is runtime dependent.

::: code-group

```ts [Deno]
Deno.serve(app.appRef.fetch);
```

```ts [Node.js]
// todo complete me
```

```ts [Bun]
// todo complete me
```

```ts [Cloudflare Workers]
// todo complete me
```
:::

## Controller & Endpoints

Controllers and endpoints are the basic building blocks of a web server. They define how the server responds to
different HTTP requests. The controller groups related endpoints together, while endpoints define the specific routes
and HTTP methods.

In CHO, a controller is a class decorated with `@Controller` that contains methods with `@Get`, `@Post`, etc.
Controllers have to contain at least one endpoint.

A Controller is a _routable entity_, meaning it can have a route prefix that applies to all its endpoints and can have
middleware attached to it.

Controller is also _injectable entity_, meaning you can inject dependencies into it via `@Dependencies` decorator.

By default, the return value from an endpoint is transformed to a JSON response. If you want to return a different type
of response, you can return a response object.

```ts 
import {Controller} from "@chojs/web";

@Controller("")
class MyController {
    @Get("hello")
    hello() {
        return {message: "Hello, World!"};
    }
}

```

Explanation:

<sup>3</sup> Define a controller with the `@Controller` decorator without a prefix.

<sup>5</sup> Define a GET endpoint with the `@Get` decorator.

<sup>7</sup> Any plain object returned from the endpoint will be transformed to a JSON response.

---

## Feature

A feature is a routable module, meaning it can have a route prefix that applies to all its controllers and can have
middleware attached to it. A feature can contain multiple controllers and sub-features.

```ts
import {Feature} from "@chojs/web";
import {MyController} from "./my-controller";

@Feature({
    controllers: [MyController],
    prefix: "api",
})
class MyFeature {
}
```
