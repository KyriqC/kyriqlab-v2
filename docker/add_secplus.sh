#!/bin/bash

# Configuration
API_URL="http://localhost/api"
API_KEY="REALNIGGASKILL"

# Reuse the image we manually fixed in the previous step
COVER_IMAGE="/uploads/image_1e4cc7.jpg"

echo "--------------------------------------"
echo "Adding Security+ Blog Post"
echo "--------------------------------------"

curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $API_KEY" \
  -d '{
    "title": "How I Passed CompTIA Security+ (SY0-701) in One Month",
    "slug": "security-plus-guide",
    "status": "published",
    "summary": "My strategy using free library resources, ExamCompass, and AI tools like NotebookLLM to crush the SY0-701 exam.",
    "content": "<h2>The Mission</h2><p>I set a strict timeline: <strong>one month</strong> to pass the CompTIA Security+ (SY0-701). I avoided expensive bootcamps by leveraging free resources and AI-driven study tools.</p><h3>Resource Stack</h3><ul><li><strong>Udemy (Free):</strong> I used my public library account to access Gale Apps, which unlocks Udemy Business courses for free.</li><li><strong>ExamCompass:</strong> Critical for drilling the massive list of acronyms  and taking practice exams.</li><li><strong>NotebookLLM:</strong> I loaded my raw notes into this AI tool to auto-generate flashcards, quizzes, and study podcasts.</li></ul><h3>The Challenge: PBQs</h3><p>While the multiple-choice questions covered the 5 Domains , the <strong>Performance-Based Questions (PBQs)</strong>  were the toughest. They require you to interpret network diagrams and configure security controls, not just memorize definitions.</p><h3>Advice</h3><p>Focus heavily on diagram interpretation and non-multiple choice questions. Study hard, use the free tools around you, and do not underestimate the acronyms!</p>",
    "tags": ["Security+", "Certification", "Cybersecurity", "Study Guide"],
    "isPublished": true,
    "publishedAt": "2025-12-27T12:00:00.000Z",
    "coverImage": "'"$COVER_IMAGE"'"
}'

echo ""
echo "--------------------------------------"
echo "Blog Post Created! Refresh your browser."
echo "--------------------------------------"
