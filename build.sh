#!/bin/bash
# ============================================================================
# ANTI-GRAVITY CO-CEO — Build & Deployment Configuration
# ============================================================================

set -e

echo "Starting Anti-Gravity Workspace Build Configuration..."

# 1. Frontend Build
echo "Building Nexus Dashboard..."
cd nexus-dashboard
npm install
npm run build
cd ..

# 2. Backend Prep
echo "Verifying Backend Environment..."
cd backend
# (Assuming requirements are already handled by the SSD library injection)
# but for a standard build:
# pip install -r requirements.txt
cd ..

echo "Build Configuration Complete."
echo "You can now run the system using ./start.sh"
