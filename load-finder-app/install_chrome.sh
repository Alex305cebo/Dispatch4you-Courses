#!/bin/bash
# Install Chromium (lighter than Chrome) for Render.com

echo "Installing Chromium and dependencies..."

# Update package list
apt-get update

# Install Chromium (lighter alternative to Chrome)
apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libappindicator3-1 \
    libasound2

# Clean up to save space
apt-get clean
rm -rf /var/lib/apt/lists/*

echo "Chromium installed successfully!"
chromium --version
