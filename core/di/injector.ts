import { Ctr, Token } from "./types.ts";

export default class Injector {
  constructor(readonly ctr: Ctr) {
  }

  async resolve(token: Token) {
    return token;
  }

  // search
  search(token: Token) {
  }
}
