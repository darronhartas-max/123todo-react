#!/bin/bash

# 123 ToDo Deployment Checklist
# Manual deployment steps for https://123todo.com

echo "🚀 123 ToDo Deployment Checklist"
echo "================================"
echo ""

# Step 1: Build
echo "Step 1: Build production bundle"
echo "--------------------------------"
echo "Running: npm run build"
npm run build
echo "✅ Build complete!"
echo ""

# Step 2: Transfer
echo "Step 2: Transfer files via FileZilla"
echo "------------------------------------"
echo "FileZilla Settings:"
echo "  Host: 51.195.136.55"
echo "  Port: 9947"
echo "  Protocol: SFTP"
echo "  Username: debian"
echo ""
echo "Actions:"
echo "  1. Connect to VPS"
echo "  2. Navigate to: /home/debian/wordpress-docker/todo-app/"
echo "  3. Delete all old files in todo-app/"
echo "  4. Upload ALL files from: $(pwd)/build/"
echo "     (including static/ folder and all files)"
echo ""
read -p "Press ENTER when FileZilla upload is complete..."
echo "✅ Files transferred!"
echo ""

# Step 3: Rebuild
echo "Step 3: Rebuild Docker container"
echo "---------------------------------"
echo "Run these commands in your VPS SSH terminal:"
echo ""
echo "  cd /home/debian/wordpress-docker"
echo "  docker compose build todo-app"
echo "  docker compose up -d todo-app"
echo "  docker network connect traefik_proxy todo-app"
echo ""
read -p "Press ENTER when container rebuild is complete..."
echo "✅ Container rebuilt!"
echo ""

# Step 4: Verify
echo "Step 4: Verify deployment"
echo "-------------------------"
echo "1. Open: https://123todo.com in Incognito mode"
echo "2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "3. Check footer for version number"
echo "4. Test app functionality"
echo ""
echo "✅ Deployment complete!"
echo "🌐 Visit: https://123todo.com"
