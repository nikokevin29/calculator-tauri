#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# build.sh — local build helper
# Usage:
#   ./build.sh             → build untuk platform saat ini
#   ./build.sh --windows   → build Windows (dari Linux/Mac via cross)
#   ./build.sh --all       → semua platform (butuh GitHub Actions)
# ─────────────────────────────────────────────────────────

set -e

PLATFORM=$(uname -s)

echo "🔧 Installing JS deps..."
bun install

echo "⚙️  Building frontend..."
bun run build

case "$1" in
  --windows)
    echo "🪟 Building Windows (requires cross-compilation setup)..."
    rustup target add x86_64-pc-windows-msvc
    bun tauri build --target x86_64-pc-windows-msvc
    ;;

  --linux)
    echo "🐧 Building Linux AppImage + deb..."
    bun tauri build --target x86_64-unknown-linux-gnu
    ;;

  --mac-intel)
    echo "🍎 Building macOS Intel..."
    rustup target add x86_64-apple-darwin
    bun tauri build --target x86_64-apple-darwin
    ;;

  --mac-arm)
    echo "🍎 Building macOS Apple Silicon..."
    rustup target add aarch64-apple-darwin
    bun tauri build --target aarch64-apple-darwin
    ;;

  --all)
    echo "⚠️  Multi-platform build requires GitHub Actions."
    echo "   Push a tag to trigger: git tag v1.0.0 && git push --tags"
    exit 1
    ;;

  *)
    echo "🖥️  Building for current platform: $PLATFORM..."
    bun tauri build
    ;;
esac

echo ""
echo "✅ Build complete! Output di: src-tauri/target/release/bundle/"
echo ""

# Show output files
find src-tauri/target/release/bundle -type f \( \
  -name "*.exe" -o \
  -name "*.msi" -o \
  -name "*.dmg" -o \
  -name "*.AppImage" -o \
  -name "*.deb" -o \
  -name "*.rpm" \
\) 2>/dev/null | while read f; do
  size=$(du -sh "$f" | cut -f1)
  echo "  📦 $size  $f"
done
