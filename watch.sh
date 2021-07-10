#!/usr/bin/env bash

set -euo pipefail

readonly NPM_BIN=$(npm bin)

"$NPM_BIN/webpack" --watch &
readonly WEBPACK=$!
kill-webpack() {
  kill "$WEBPACK"
}
trap kill-webpack EXIT

"$NPM_BIN/web-ext" run "$@"