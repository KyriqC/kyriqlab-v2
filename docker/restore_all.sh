#!/bin/bash

# FIXED: Use port 80 (Nginx) instead of 3100
API_URL="http://localhost/api"
API_KEY="REALNIGGASKILL"
IMAGE_FILE="image_1e4cc7.jpg"

echo "--------------------------------------"
echo "KyriqLab Master Restore (V2)"
echo "--------------------------------------"

# 1. Upload Cover Image
COVER_IMAGE_URL=""
if [ -f "$IMAGE_FILE" ]; then
  echo "[+] Uploading Cover Image..."
  UPLOAD_RESPONSE=$(curl -s -X POST -H "x-admin-key: $API_KEY" -F "image=@$IMAGE_FILE" "$API_URL/uploads")
  COVER_IMAGE_URL=$(echo $UPLOAD_RESPONSE | grep -oP '(?<="url":")[^"]*')
  
  if [ -n "$COVER_IMAGE_URL" ]; then
      echo "    Success! URL: $COVER_IMAGE_URL"
  else
      echo "    [-] Upload failed. Using placeholder."
      COVER_IMAGE_URL="/uploads/placeholder.jpg"
  fi
else
  echo "[-] Image not found. Using placeholder."
  COVER_IMAGE_URL="/uploads/placeholder.jpg"
fi
echo ""

# --- BLOG POSTS ---

echo "[+] Restoring Blog: Home Lab Setup..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "My Home Lab: T440 Server Setup",
    "slug": "home-lab-2025",
    "status": "published",
    "summary": "Converting an old Lenovo ThinkPad T440 into a home lab server running Ubuntu Server and Docker.",
    "content": "<h2>The Goal</h2><p>I wanted to start a home lab without spending money. I utilized a Lenovo T440, wiped Windows, and installed <strong>Ubuntu Server</strong>. It runs headless (no GUI) to save resources.</p><h3>Zero Trust Security</h3><p>Instead of opening dangerous ports on my router, I used <strong>Cloudflare Tunnel</strong>. This connects the server to the internet securely without exposing my home IP.</p>",
    "tags": ["Home Lab", "Docker", "Cloudflare"],
    "isPublished": true,
    "publishedAt": "2025-12-08T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""

echo "[+] Restoring Blog: PC Build..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "Building My PC: A Lesson in Patience",
    "slug": "pc-build-2025",
    "status": "published",
    "summary": "A journey through the GPU shortage, bricked motherboards, and bent CPU pins.",
    "content": "<h2>The Disaster</h2><p>This build was a disaster before it was a success. I bought a cheap RX 580 that crashed constantly. Trying to fix it, I flashed the BIOS and <strong>bricked the motherboard</strong>.</p><h3>The Fix</h3><p>After replacing the board and accidentally bending CPU pins, I finally secured an RX 6600 XT. The system now runs stable and handles my development workload perfectly.</p>",
    "tags": ["Hardware", "PC Build", "Troubleshooting"],
    "isPublished": true,
    "publishedAt": "2025-08-08T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""

# --- PROJECTS (From your PDF) ---

echo "[+] Restoring Project: Cloud Order System..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "Cloud Order Management System",
    "slug": "cloud-order-system",
    "status": "published",
    "summary": "Led a team of 8 to build a Vue.js/Node.js dashboard for a bakery, reducing order errors by 80%.",
    "content": "<h2>Project Overview</h2><p>Designed data flow diagrams and managed the SDLC for a high-volume bakery dashboard.</p><h3>Key Achievements</h3><ul><li><strong>Leadership:</strong> Led a team of 8 developers.</li><li><strong>Impact:</strong> Reduced order processing errors by 80%.</li><li><strong>Tech Stack:</strong> Vue.js, Node.js, Systems Analysis.</li></ul>",
    "tags": ["Vue.js", "Systems Analysis", "Team Lead", "Project"],
    "isPublished": true,
    "publishedAt": "2025-12-25T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""

echo "[+] Restoring Project: Empathy Survey App..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "Empathy Survey App",
    "slug": "empathy-survey-app",
    "status": "published",
    "summary": "Full-stack application measuring empathy traits with complex scoring logic.",
    "content": "<h2>Technical Details</h2><p>A full-stack solution designed to assess empathy levels through interactive surveys.</p><ul><li><strong>Scoring Logic:</strong> Implemented complex algorithms to calculate empathy quotients (EQ).</li><li><strong>Stack:</strong> Node.js, EJS, MongoDB.</li></ul>",
    "tags": ["Node.js", "EJS", "MongoDB", "Project"],
    "isPublished": true,
    "publishedAt": "2025-11-20T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""

echo "--------------------------------------"
echo "Restore Complete! Check https://kyriqlab.com"
echo "--------------------------------------"
