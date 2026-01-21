#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SITE_DIR="$ROOT_DIR/generated/site"

echo "Generating site content..."
cd "$ROOT_DIR"
pnpm generate

echo "Building MkDocs site..."
cd "$SITE_DIR"
mkdocs build --site-dir _site

echo ""
echo "Site built at: $SITE_DIR/_site"
echo ""
echo "To preview locally, run:"
echo "  cd $SITE_DIR && mkdocs serve"
