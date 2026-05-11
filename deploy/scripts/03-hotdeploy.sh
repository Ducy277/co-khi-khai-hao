#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  03-hotdeploy.sh — Deploy nhanh khi chỉ thay đổi code Next.js
#
#  Khác với 02-deploy.sh (full rebuild):
#    - KHÔNG xóa Docker cache  → tận dụng layer cache, tiết kiệm 5-8 phút
#    - KHÔNG tắt toàn bộ stack → DB và Nginx vẫn chạy, zero downtime
#    - Chỉ rebuild & restart container "web"
#
#  Dùng khi: fix lỗi UI, cập nhật component, thay đổi API route, sửa config nhỏ
#  Dùng 02-deploy.sh khi: thay đổi docker-compose, schema DB, Dockerfile, Nginx
# ─────────────────────────────────────────────────────────────────────────────
set -e

DEPLOY_DIR="/opt/ckkh"
COMPOSE_FILE="deploy/docker-compose.prod.yml"
ENV_FILE="deploy/.env.production"

echo "======================================"
echo "  CKKH - Hot Deploy (Fast Mode)"
echo "======================================"

cd "$DEPLOY_DIR"

echo ""
echo ">>> [1/4] Lấy code mới nhất từ GitHub..."
git pull

# Kiểm tra có thay đổi schema DB không → cảnh báo dùng full deploy
if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q "prisma/migrations"; then
  echo ""
  echo "⚠️  CẢNH BÁO: Phát hiện thay đổi trong prisma/migrations!"
  echo "   Bạn nên chạy 02-deploy.sh thay vì hotdeploy để migrate DB."
  echo ""
  read -p "   Vẫn tiếp tục hotdeploy? [y/N]: " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 0
fi

echo ""
echo ">>> [2/4] Rebuild image 'web' (tận dụng Docker layer cache)..."
# --no-deps: chỉ build service web, không đụng vào db hay nginx
# Nhờ Docker cache, chỉ các layer thay đổi mới được build lại (~1-2 phút)
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache=false web

echo ""
echo ">>> [3/4] Khởi động lại container web (zero-downtime)..."
# up -d --no-deps: chỉ recreate container web, db và nginx không bị ảnh hưởng
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-deps web

echo ""
echo ">>> [4/4] Trạng thái services:"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo ""
echo "======================================"
echo "  Hot Deploy hoàn tất!"
echo "  Website: http://$(curl -s --max-time 3 ifconfig.me 2>/dev/null || echo 'check-your-ip')"
echo "======================================"
