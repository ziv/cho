# Web Server Quick Start

This guide will help you set up a basic web server using CHO's web framework. This is useful for building modern web applications with dependency injection and decorator-based routing.

## Controller & Endpoints

Controllers and endpoints are the basic building blocks of a web server. They define how the server responds to
different HTTP requests. The controller groups related endpoints together, while endpoints define the specific routes
and HTTP methods.

In CHO, a controller is a class decorated with `@Controller` that contains methods with `@Get`, `@Post`, etc. Controllers
have to contain at least one endpoint

Controller is a routable entity, meaning it can have a route prefix that applies to all its endpoints and can have
middleware attached to it.

By default, the return value from an endpoint is transformed to a JSON response. If you want to return a different type
of response, you can return a response object.

```ts
import { Controller } from "@chojs/web";

@Controller("")
class MyController {
  @Get("hello")
  hello() {
    return { message: "Hello, World!" };
  }
}
```

Explanation:

<sup>3</sup> define a controller with the `@Controller` decorator without a prefix.

<sup>5</sup> define a GET endpoint with the `@Get` decorator.

<sup>7</sup> any plain object returned from the endpoint will be transformed to a JSON response.

---

## Feature

A feature is a routable module, meaning it can have a route prefix that applies to all its controllers, it can have
middleware attached to it. A feature can contain multiple controllers and sub-features.

```ts
import { Feature } from "@chojs/web";
import { MyController } from "./my-controller";

@Feature({
  controllers: [MyController],
  prefix: "api",
})
class MyFeature {
}
```
