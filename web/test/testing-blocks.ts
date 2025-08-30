import { Controller, Controllers, Feature, Get, Post, Route } from "@chojs/web";

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
