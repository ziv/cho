#!/bin/bash

# generate the reference docs
deno doc --html \
  --name="@chojs" \
  --output="./docs/public/ref" \
  core/di/mod.ts \
  core/utils/mod.ts \
  core/meta/mod.ts \
  web/mod.ts \
  vendor/hono/mod.ts