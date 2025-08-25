import { Controller, Controllers, Feature, Get, Middlewares, Post, Route } from "@chojs/web";

function mw() {
}

@Controller(Route("test0"))
export class Ctr0 {
  @Get("test1")
  test1() {}

  @Post(
    Route("test2"),
    // Middlewares(mw),
  )
  test2() {}
}

@Feature(
  Controllers(Ctr0),
  // Middlewares(mw, mw),
)
export class Feat1 {
}
