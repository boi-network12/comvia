#!/bin/bash

echo "=== Testing Comvia Server API ==="
echo

# Base URL
BASE_URL="http://localhost:8080/api"

# 1. Health Check
echo "1️⃣ Testing Health Check..."
curl -s $BASE_URL/../health | jq '.'
echo

# 2. Register User
echo "2️⃣ Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@comvia.com","password":"Test123!@#"}')
echo $REGISTER_RESPONSE | jq '.'
echo

# 3. Login
echo "3️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@comvia.com","password":"Test123!@#"}' \
  -c cookies.txt)
echo $LOGIN_RESPONSE | jq '.'
echo

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
echo "Token: $TOKEN"
echo

# 4. Get Current User
echo "4️⃣ Getting Current User..."
curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo

# 5. Setup Product
echo "5️⃣ Setting up Product..."
curl -s -X POST $BASE_URL/auth/setup/product \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"live-chat"}' | jq '.'
echo

# 6. Setup Widget
echo "6️⃣ Setting up Widget..."
curl -s -X POST $BASE_URL/auth/setup/widget \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position":"bottom-right","color":"#F97316","icon":"chat"}' | jq '.'
echo

# 7. Setup Branding
echo "7️⃣ Setting up Branding..."
curl -s -X POST $BASE_URL/auth/setup/branding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Company","brandColor":"#F97316","font":"inter","welcomeMessage":"Hello!","quickReplies":["Pricing","Support"]}' | jq '.'
echo

# 8. Setup Team
echo "8️⃣ Setting up Team..."
curl -s -X POST $BASE_URL/auth/setup/team \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"members":[{"name":"Admin","email":"admin@test.com","role":"admin"}]}' | jq '.'
echo

# 9. Complete Setup
echo "9️⃣ Completing Setup..."
curl -s -X POST $BASE_URL/auth/setup/complete \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo

echo "✅ All tests complete!"