#!/bin/bash
# Script deploy/update CKKH - chạy mỗi lần cần update code
set -e

# ── CẤU HÌNH: Thay YOUR_GITHUB_USERNAME và YOUR_REPO_NAME ─────────────────────
REPO_URL="https://github.com/Ducy277/co-khi-khai-hao.git"
DEPLOY_DIR="/opt/ckkh"
COMPOSE_FILE="deploy/docker-compose.prod.yml"
ENV_FILE="deploy/.env.production"
# ──────────────────────────────────────────────────────────────────────────────

echo "======================================"
echo "  CKKH - Deploy Script"
echo "======================================"

# Lần đầu: clone repository
if [ ! -d "$DEPLOY_DIR/.git" ]; then
    echo ">>> Lần đầu deploy: Clone repository..."
    sudo git clone "$REPO_URL" "$DEPLOY_DIR"
    sudo chown -R ubuntu:ubuntu "$DEPLOY_DIR"
    echo ""
    echo ">>> Tiếp theo: Tạo file .env.production"
    echo "    cd $DEPLOY_DIR"
    echo "    cp deploy/.env.production.example $ENV_FILE"
    echo "    nano $ENV_FILE"
    echo "    Điền thông tin và chạy lại script deploy này."
    exit 0
fi

# Kiểm tra file .env.production
if [ ! -f "$DEPLOY_DIR/$ENV_FILE" ]; then
    echo "LỖI: File .env.production chưa tồn tại!"
    echo "Chạy:"
    echo "  cp $DEPLOY_DIR/deploy/.env.production.example $DEPLOY_DIR/$ENV_FILE"
    echo "  nano $DEPLOY_DIR/$ENV_FILE"
    exit 1
fi

cd "$DEPLOY_DIR"

echo ""
echo ">>> Lấy code mới nhất từ GitHub..."
git pull

echo ""
echo ">>> Dừng services cũ..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans || true

echo ""
echo ">>> Dọn dẹp container đã tắt (chỉ dangling, KHÔNG xóa cache build)..."
docker container prune -f || true


echo ""
echo ">>> Build image mới và khởi động (có thể mất 5-10 phút lần đầu)..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

echo ""
echo ">>> Trạng thái services:"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo ""
echo "======================================"
echo "  Deploy hoàn tất!"
echo "  Website: http://$(curl -s ifconfig.me)"
echo "======================================"
