#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SITE_DIR="$ROOT_DIR/generated/site"

echo "Generating site content..."
cd "$ROOT_DIR"
pnpm generate

echo "Building Jekyll site..."
cd "$SITE_DIR"
bundle install --quiet
bundle exec jekyll build --destination _site

echo ""
echo "Site built at: $SITE_DIR/_site"
echo ""
echo "To preview locally, run:"
echo "  cd $SITE_DIR && bundle exec jekyll serve"
