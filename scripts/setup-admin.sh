#!/bin/bash

# Supabase Admin Account Setup Script
# This script creates the admin account: INFO@METRICFLUXSOLUTIONS.COM with role ADMIN

SUPABASE_URL="https://kxldcrwpommsckpxjhhb.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRjcndwb21tc2NrcHhqaGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUyNDM1MSwiZXhwIjoyMDk2MTAwMzUxfQ.xVMf0zcXDZFH9eHOm3R5pz7qW-0qYb8KxL6uyZ9Hp3A"
ADMIN_EMAIL="info@metricfluxsolutions.com"
ADMIN_PASSWORD="Akhi@5656"
ADMIN_NAME="JOSNA JOSE"
DB_PASSWORD="Akhi@Aishu@5656"

echo "=========================================="
echo "Supabase Admin Account Setup"
echo "=========================================="
echo ""
echo "Creating admin account:"
echo "Email: $ADMIN_EMAIL"
echo "Name: $ADMIN_NAME"
echo ""

# Create auth user via Supabase Admin API
echo "Step 1: Creating Supabase Auth user..."

AUTH_RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"role\": \"ADMIN\"
    }
  }")

echo "Response: $AUTH_RESPONSE"

# Extract user ID from response
USER_ID=$(echo $AUTH_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ Failed to create auth user. Please check your credentials."
  exit 1
fi

echo "✅ Auth user created with ID: $USER_ID"
echo ""

# Create profile entry
echo "Step 2: Creating profile entry in database..."

# For this step, we need to use the service role key to insert into the database
# We'll use SQL directly via the Supabase CLI or via curl to the REST API

PROFILE_RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/profiles" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$USER_ID\",
    \"email\": \"$ADMIN_EMAIL\",
    \"name\": \"$ADMIN_NAME\",
    \"phone\": null,
    \"role\": \"ADMIN\",
    \"email_verified\": true
  }")

echo "Response: $PROFILE_RESPONSE"

if echo "$PROFILE_RESPONSE" | grep -q "error"; then
  echo "❌ Failed to create profile. Error in database insertion."
  echo "You may need to manually insert the profile via Supabase Dashboard."
else
  echo "✅ Profile created successfully!"
fi

echo ""
echo "=========================================="
echo "Admin Setup Complete!"
echo "=========================================="
echo ""
echo "Login credentials:"
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo ""
echo "Account Role: ADMIN"
echo "Will redirect to: /admin dashboard"
echo ""
