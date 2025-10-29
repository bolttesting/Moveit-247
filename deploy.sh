#!/bin/bash

# MoveIt 247 Deployment Script
# This script helps deploy the application to a Linux server

echo "========================================="
echo "  MoveIt 247 Deployment Script"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
    chmod 755 uploads
    echo "✅ Uploads directory created"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 process manager..."
    npm install -g pm2
    echo "✅ PM2 installed"
fi

# Stop existing instance
echo "🛑 Stopping existing instance..."
pm2 stop moveit247 2>/dev/null || true
pm2 delete moveit247 2>/dev/null || true

# Start the application
echo "🚀 Starting MoveIt 247..."
pm2 start server.js --name moveit247

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo ""
echo "========================================="
echo "  ✅ Deployment Successful!"
echo "========================================="
echo ""
echo "🌐 Access your application at:"
echo "   http://localhost:4000"
echo "   or"
echo "   http://$(hostname -I | awk '{print $1}'):4000"
echo ""
echo "📊 Useful commands:"
echo "   pm2 logs moveit247    - View logs"
echo "   pm2 restart moveit247 - Restart app"
echo "   pm2 stop moveit247    - Stop app"
echo "   pm2 monit             - Monitor resources"
echo ""
echo "🔐 Default login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the default password!"
echo "========================================="

