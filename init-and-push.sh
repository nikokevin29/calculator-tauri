#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# init-and-push.sh
# Jalankan dari dalam folder calculator-tauri:
#   chmod +x init-and-push.sh
#   ./init-and-push.sh
# ─────────────────────────────────────────────────────────

set -e

# ── Warna output ─────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${BLUE}[→]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Calculator Tauri — Git Init & Push              ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Cek berada di folder yang benar ──────────────────────
if [ ! -f "package.json" ] || [ ! -d "src-tauri" ]; then
  err "Jalankan script ini dari dalam folder calculator-tauri!"
fi

# ── Ambil remote URL dari git config yang sudah ada ──────
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  warn "Belum ada remote origin."
  echo -n "  Masukkan GitHub repo URL (contoh: https://github.com/username/calculator): "
  read -r REMOTE_URL
  [ -z "$REMOTE_URL" ] && err "URL tidak boleh kosong!"
fi

log "Remote: $REMOTE_URL"

# ── Buat .gitignore ───────────────────────────────────────
log "Membuat .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
bun.lockb

# Build output
dist/
src-tauri/target/

# Tauri
src-tauri/gen/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo

# Env
.env
.env.local
EOF
ok ".gitignore dibuat"

# ── Git init ─────────────────────────────────────────────
if [ ! -d ".git" ]; then
  log "Inisialisasi git repo..."
  git init
  git branch -M main
  ok "Git repo diinit"
else
  ok "Git repo sudah ada, skip init"
fi

# ── Set remote ───────────────────────────────────────────
if git remote get-url origin &>/dev/null; then
  log "Remote origin sudah ada: $(git remote get-url origin)"
else
  log "Menambahkan remote origin..."
  git remote add origin "$REMOTE_URL"
  ok "Remote origin ditambahkan"
fi

# ── Stage semua file ─────────────────────────────────────
log "Staging semua file..."
git add .
ok "Files staged: $(git diff --cached --name-only | wc -l | tr -d ' ') files"

# ── Commit ───────────────────────────────────────────────
COMMIT_MSG="feat: initial boilerplate — Tauri v2 + Vanilla JS + Web Components + Open Props"
log "Commit: \"$COMMIT_MSG\""
git commit -m "$COMMIT_MSG" || warn "Tidak ada perubahan untuk di-commit"

# ── Push ─────────────────────────────────────────────────
log "Push ke origin main..."
git push -u origin main

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Berhasil push ke GitHub!                      ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Repo    : ${BLUE}$REMOTE_URL${NC}"
echo -e "  Branch  : ${BLUE}main${NC}"
echo ""
echo -e "  ${YELLOW}Langkah berikutnya:${NC}"
echo -e "  1. bun install"
echo -e "  2. bun tauri dev"
echo -e "  3. Untuk release: git tag v1.0.0 && git push --tags"
echo ""
