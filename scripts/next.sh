#!/bin/bash

echo "$1"
echo "$2"

sed -i '' "s/0-0-0/$2/g" "$1"