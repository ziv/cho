#!/bin/bash

# generate the docs
deno doc --html  core/di/mod.ts core/utils/mod.ts web/mod.ts

# fix the generated docs (replace 〇 with @)
# shellcheck disable=SC2164
cd ./docs

# this is mac version
#find . -type f -name "*.html" -exec sed -i '' 's/〇/@/g' {} +

# this is linux version
find . -type f -name "*.html" -exec sed -i 's/〇/@/g' {} +
