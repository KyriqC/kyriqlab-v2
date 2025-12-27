#!/bin/bash

# ============================================
# KyriqLab Master Restore Script (V2)
# ============================================
# This script populates the MongoDB database with
# rich blog content for the KyriqLab portfolio site.
# ============================================

API_URL="http://localhost/api"
API_KEY="REALNIGGASKILL"
IMAGE_FILE="image_1e4cc7.jpg"

echo "======================================"
echo "KyriqLab Master Restore (V2)"
echo "======================================"
echo ""

# ============================================
# 1. Upload Cover Image
# ============================================
COVER_IMAGE_URL=""
if [ -f "$IMAGE_FILE" ]; then
  echo "[+] Uploading Cover Image..."
  UPLOAD_RESPONSE=$(curl -s -X POST -H "x-admin-key: $API_KEY" -F "image=@$IMAGE_FILE" "$API_URL/uploads")
  COVER_IMAGE_URL=$(echo $UPLOAD_RESPONSE | grep -oP '(?<="url":")[^"]*')
  
  if [ -n "$COVER_IMAGE_URL" ]; then
      echo "    ✓ Success! URL: $COVER_IMAGE_URL"
  else
      echo "    ✗ Upload failed. Using placeholder."
      COVER_IMAGE_URL="/uploads/placeholder.jpg"
  fi
else
  echo "[-] Image not found. Using placeholder."
  COVER_IMAGE_URL="/uploads/placeholder.jpg"
fi
echo ""

# ============================================
# 2. Blog Posts
# ============================================

echo "[+] Restoring Blog: Home Lab Setup..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "My Home Lab: T440 Server Setup",
    "slug": "home-lab-2025",
    "status": "published",
    "summary": "From Old Laptop to Production Server: My T440 Homelab Journey",
    "content": "<p>I wanted to start a home lab, but I did not want to spend a lot of money on new equipment. I had an old Lenovo ThinkPad T440 lying around. It was gathering dust, so I decided to use it. My goal was to host my own webpage and learn how servers work.</p><p>First, I wiped Windows off the laptop. I installed Ubuntu Server instead. It runs well on older hardware because it does not have a lot of extra graphics to slow it down. I did have some issues with the BIOS settings at first. The laptop did not want to boot from the USB drive. I used AI to explain the error messages to me. I also watched videos to see how others set up their BIOS.</p><p>After the operating system was ready, I installed Docker. Docker is really useful. It lets you run programs in their own little boxes called containers. This keeps the computer clean. I set up a container for my website using Nginx.</p><p>The last step was making the site visible on the internet. I did not want to mess with my router settings or open ports. That can be unsafe. I used something called Cloudflare Tunnel. It connects my laptop to the internet securely. Now, I can access my site from my phone or anywhere else.</p><p>I am not an expert at this yet. I relied on AI a lot to write the configuration files. But if you have an old laptop and are willing to learn, you can definitely do this too.</p><hr class=\"my-8 border-gray-700\"><h3 class=\"text-xl font-semibold mb-4\">What You Need & Documents to Review</h3><p>If you want to try this, here is a list of exactly what you need and what to read.</p><h4 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">The Checklist:</h4><ul class=\"list-disc pl-5 space-y-2 mb-6\"><li><strong>An Old Computer:</strong> I used a T440, but any laptop with 4GB of RAM will work.</li><li><strong>USB Drive:</strong> You need this to put the Ubuntu installer on.</li><li><strong>A Domain Name:</strong> You need to own a web address (like .com or .net) to use the tunnel.</li><li><strong>Cloudflare Account:</strong> This is free and manages the connection.</li></ul><h4 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Documents to Look At:</h4><ul class=\"list-disc pl-5 space-y-2 mb-6\"><li><strong>Ubuntu Server Guide:</strong> Look up how to make a bootable USB and install the OS.</li><li><strong>Docker Documentation:</strong> Find the \"Install on Ubuntu\" page. Do not just type <code class=\"bg-white/10 px-1.5 py-0.5 rounded\">apt install docker</code> because that gives you an old version. Follow the official guide.</li><li><strong>Cloudflare Tunnel Docs:</strong> Look for the section on \"Run as a Docker container.\" It gives you the one command you need to copy and paste.</li></ul><h4 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Video Reference:</h4><p>I watched a video similar to this one to understand the Cloudflare part. It shows you how to connect Docker to the web without opening ports.</p><div class=\"mt-4\"><a href=\"https://www.youtube.com/watch?v=SivE_EfUNd8\" target=\"_blank\" class=\"text-[#00A651] font-bold hover:underline\">▶ Cloudflare Tunnels for Docker: A Step-by-Step Guide</a></div>",
    "tags": ["Home Lab", "Docker", "Cloudflare", "Networking"],
    "isPublished": true,
    "publishedAt": "2025-12-08T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""
echo "    ✓ Home Lab post created"
echo ""

echo "[+] Restoring Blog: PC Build..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "Building My PC: A Lesson in Patience",
    "slug": "pc-build-2025",
    "status": "published",
    "summary": "A journey through the GPU shortage, bricked motherboards, and bent CPU pins.",
    "content": "<p>This build was a disaster before it was a success. I started this project back in April, thinking it would be straightforward. It was not. I wanted to save money, so I went on Facebook Marketplace. I met a guy in Chinatown to buy an RX 580. The card was cheap, but it gave me a headache immediately. I could not get the drivers to work. I thought flashing the BIOS might fix it.</p><p>That was a mistake. I tried to flash the BIOS and ended up bricking my motherboard completely. The screen just stayed black. I was lucky because the board was still under warranty, so I managed to get a replacement.</p><p>I thought the worst was over, but then I went to install the CPU. I was not careful enough and bent the pins. That was painful because I could not fix it. I had to go buy another CPU out of my own pocket. This was all happening during the big GPU shortage, so finding parts was hard. I was stuck for months.</p><p>Finally, around September 2021, I got lucky again on Facebook Marketplace. I found an RX 6600 XT for a decent price. Once I put that in, everything finally clicked. It took from April to September, but the PC finally posted and booted up. It was a long road, but it works now.</p><hr class=\"my-8 border-gray-700\"><h3 class=\"text-xl font-semibold mb-4\">What You Need & Documents to Review</h3><p>If you are building a PC, especially with used parts, here is what you really need to look out for.</p><h4 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">The Checklist:</h4><ul class=\"list-disc pl-5 space-y-2 mb-6\"><li><strong>Patience:</strong> Things will go wrong. Do not rush like I did.</li><li><strong>Extra Budget:</strong> Keep some money aside in case you break a CPU or need a different part.</li><li><strong>A Good Screwdriver:</strong> Get a magnetic one so you do not drop screws in the case.</li><li><strong>Thermal Paste:</strong> Even if your cooler comes with it, it is good to have extra if you have to reseat the cooler.</li></ul><h4 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Documents to Look At:</h4><ul class=\"list-disc pl-5 space-y-2\"><li><strong>Motherboard Manual:</strong> Read the section on how to install the CPU carefully. It tells you exactly how to line up the arrows so you do not bend pins.</li><li><strong>GPU Driver Page:</strong> Go to the official AMD or Nvidia site. Do not try to flash the BIOS unless you are 100% sure you have to.</li><li><strong>Warranty Policy:</strong> Check the return policy on your parts before you open them. This saved me when I bricked my board.</li></ul>",
    "tags": ["Hardware", "PC Build", "Troubleshooting"],
    "isPublished": true,
    "publishedAt": "2025-08-08T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""
echo "    ✓ PC Build post created"
echo ""

# ============================================
# 3. Project Posts
# ============================================

echo "[+] Restoring Project: Cloud Order System..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "Cloud Order Management System",
    "slug": "cloud-order-system",
    "status": "published",
    "summary": "Led a team of 8 to build a Vue.js/Node.js dashboard for a bakery, reducing order errors by 80%.",
    "content": "<h2 class=\"text-xl font-semibold mb-4\">Project Overview</h2><p>This was my capstone project at the University of Houston. We partnered with a local bakery that was struggling with order management. They were using paper forms and spreadsheets, which led to constant errors, missed orders, and frustrated customers.</p><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">The Problem</h3><p>The bakery received orders through phone calls, walk-ins, and a basic website form. All of these went to different places. The staff had to manually consolidate everything, and during busy seasons like holidays, they were losing track of up to 20% of orders.</p><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">My Role</h3><p>As the team lead, I was responsible for coordinating 8 developers, creating the system architecture, and managing our SDLC process. I designed the data flow diagrams that mapped out how orders would move through the system.</p><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Technical Implementation</h3><ul class=\"list-disc pl-5 space-y-2 mb-6\"><li><strong>Frontend:</strong> Vue.js with a real-time dashboard showing incoming orders</li><li><strong>Backend:</strong> Node.js/Express API handling order processing</li><li><strong>Database:</strong> MongoDB for flexible order document storage</li><li><strong>Features:</strong> Order status tracking, automated notifications, inventory integration</li></ul><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Results</h3><p>After implementing the system, the bakery saw an <strong>80% reduction</strong> in order processing errors. Staff could see all orders in one place, and customers received automatic confirmations. The owner told us it was like going from the Stone Age to the modern era.</p>",
    "tags": ["Vue.js", "Systems Analysis", "Team Lead", "Project"],
    "isPublished": true,
    "publishedAt": "2025-12-25T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""
echo "    ✓ Cloud Order System post created"
echo ""

echo "[+] Restoring Project: Empathy Survey App..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "Empathy Survey App",
    "slug": "empathy-survey-app",
    "status": "published",
    "summary": "Full-stack application measuring empathy traits with complex scoring logic and accessibility features.",
    "content": "<h2 class=\"text-xl font-semibold mb-4\">Project Overview</h2><p>The Empathy Survey App is a full-stack web application designed to assess empathy levels through interactive surveys. It implements the scientifically-validated Empathy Quotient (EQ) questionnaire developed by Simon Baron-Cohen.</p><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Technical Challenges</h3><p>The scoring logic was the hardest part. The EQ scale has 60 questions, but only 40 of them actually count toward your score. Some questions are reverse-scored, meaning \"Strongly Agree\" gives you 0 points instead of 2. I had to carefully implement this logic to ensure accurate results.</p><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Tech Stack</h3><ul class=\"list-disc pl-5 space-y-2 mb-6\"><li><strong>Backend:</strong> Node.js with Express.js for routing and session management</li><li><strong>Frontend:</strong> EJS templating with custom CSS for a clean, accessible interface</li><li><strong>Database:</strong> MongoDB storing user responses and calculated scores</li><li><strong>Accessibility:</strong> WCAG 2.1 compliant with keyboard navigation and screen reader support</li></ul><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Features</h3><ul class=\"list-disc pl-5 space-y-2\"><li>Progress saving - users can pause and resume the survey</li><li>Detailed results breakdown showing scores across different empathy dimensions</li><li>Comparison to population averages</li><li>Responsive design for mobile completion</li></ul>",
    "tags": ["Node.js", "EJS", "MongoDB", "Project", "Accessibility"],
    "isPublished": true,
    "publishedAt": "2025-11-20T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""
echo "    ✓ Empathy Survey App post created"
echo ""

echo "[+] Restoring Project: Python Automation Bot..."
curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "Python Automation Bot",
    "slug": "python-automation-bot",
    "status": "published",
    "summary": "Automated typing bot using Selenium that interacts with web elements at adjustable human-like speeds.",
    "content": "<h2 class=\"text-xl font-semibold mb-4\">Project Overview</h2><p>This project started as a way to practice Python and ended up being genuinely useful. I built a bot that can automatically fill out web forms, type text, and interact with web pages at speeds that mimic human behavior.</p><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Why Human-Like Speeds?</h3><p>Many websites detect and block bots by looking at typing speed. If someone types 1000 words per minute, they are obviously not human. My bot adds random delays between keystrokes, mimicking natural typing patterns. It even makes occasional \"mistakes\" and corrections to seem more realistic.</p><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Technical Implementation</h3><ul class=\"list-disc pl-5 space-y-2 mb-6\"><li><strong>Core Library:</strong> Selenium WebDriver for browser automation</li><li><strong>Speed Control:</strong> Configurable WPM (words per minute) with variance</li><li><strong>Element Detection:</strong> Multiple selector strategies (ID, class, XPath)</li><li><strong>Error Handling:</strong> Graceful recovery from stale elements and timeouts</li></ul><h3 class=\"text-lg font-medium mt-6 mb-3 text-[#00A651]\">Use Cases</h3><p>I originally built this to help me practice typing tests and fill out repetitive forms. It is also useful for testing web applications - you can simulate real user input to see how your app handles different typing speeds and patterns.</p><p class=\"mt-4 p-4 bg-white/5 rounded-xl border border-white/10\"><strong>Note:</strong> This tool should only be used ethically and on sites where you have permission. I do not condone using automation for cheating or bypassing security measures.</p>",
    "tags": ["Python", "Selenium", "Automation", "Project"],
    "isPublished": true,
    "publishedAt": "2025-10-15T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE_URL"'"
}'
echo ""
echo "    ✓ Python Automation Bot post created"
echo ""

echo "======================================"
echo "✓ Restore Complete!"
echo "======================================"
echo ""
echo "Posts created:"
echo "  • My Home Lab: T440 Server Setup"
echo "  • Building My PC: A Lesson in Patience"
echo "  • Cloud Order Management System"
echo "  • Empathy Survey App"
echo "  • Python Automation Bot"
echo ""
echo "Check https://kyriqlab.com to verify."
echo "======================================"
