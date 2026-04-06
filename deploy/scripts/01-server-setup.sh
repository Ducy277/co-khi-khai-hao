#!/bin/bash
# Script cài đặt môi trường EC2 Ubuntu 24.04 - chỉ chạy 1 lần đầu
set -e

echo "======================================"
echo "  CKKH - Server Setup (Ubuntu 24.04)"
echo "======================================"

echo ""
echo ">>> [1/5] Update hệ thống..."
sudo apt-get update -y && sudo apt-get upgrade -y

echo ""
echo ">>> [2/5] Tạo Swap 2GB (bắt buộc cho t3.micro)..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "    Swap 2GB đã được tạo."
else
    echo "    Swap đã tồn tại, bỏ qua."
fi

echo ""
echo ">>> [3/5] Cài Docker Engine..."
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo ""
echo ">>> [4/5] Thêm user 'ubuntu' vào group docker..."
sudo usermod -aG docker ubuntu

echo ""
echo ">>> [5/5] Enable Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

echo ""
echo "======================================"
echo "  Setup hoàn tất!"
echo "  QUAN TRỌNG: Đăng xuất và SSH lại"
echo "  để group docker có hiệu lực."
echo "======================================"
echo ""
echo "Kiểm tra: docker --version && docker compose version"
