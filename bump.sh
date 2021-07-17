#!/usr/bin/env bash
set -euo pipefail

readonly VERSION=$1
if [ -z "$VERSION" ]; then
  >&2 echo "bump-up.sh <version>"
fi

readonly UPDATED=$(jq ".version = \"$VERSION\"" static/manifest.json)
echo "$UPDATED" > static/manifest.json
make fix
git add static/manifest.json
git commit -m "Bump the version to v$VERSION"
git tag "v$VERSION"