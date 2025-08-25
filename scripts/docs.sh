#!/bin/bash

# generate the docs
rm -rf docs
mkdir -p docs
deno doc --html --name="@chojs/core/di" --output="./docs/core-di" core/di/mod.ts
deno doc --html --name="@chojs/core/utils" --output="./docs/core-utils" core/utils/mod.ts
deno doc --html --name="@chojs/web" --output="./docs/web" web/mod.ts
deno doc --html --name="@chojs/vendor" --output="./docs/vendor" vendor/mod.ts
cp assets/index.html docs/index.html


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