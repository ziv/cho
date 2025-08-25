#!/bin/bash

# generate the docs
deno doc --html  core/di/mod.ts core/utils/mod.ts web/mod.ts

# fix the generated docs (replace 〇 with @)
# shellcheck disable=SC2164
cd ./docs

OS_NAME=$(uname -s)

if [[ "$OS_NAME" == "Linux" ]]; then
    find . -type f -name "*.html" -exec sed -i 's/〇/@/g' {} +
elif [[ "$OS_NAME" == "Darwin" ]]; then
    find . -type f -name "*.html" -exec sed -i '' 's/〇/@/g' {} +
else
    echo "This machine is running an unknown OS: $OS_NAME"
fi