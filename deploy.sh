#!/bin/bash

# Must-Order Deployment Script
# This script helps deploy the must-order application

set -e

echo "🚀 Starting Must-Order deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    if [ -f env.local.example ]; then
        cp env.local.example .env.local
        echo "📝 Please edit .env.local with your actual values:"
        echo "   - OPENAI_API_KEY"
        echo "   - DATABASE_URL"
        echo "   - CRON_SECRET"
        echo ""
        echo "Press Enter when you've updated .env.local..."
        read
    else
        echo "❌ env.local.example not found. Please create .env.local manually."
        exit 1
    fi
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Setting up database..."
npx prisma db push

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Deployment setup complete!"
echo ""
echo "To start the development server:"
echo "   npm run dev"
echo ""
echo "To start the production server:"
echo "   npm start"
echo ""
echo "To view the database:"
echo "   npx prisma studio"
echo ""
echo "🌐 The application will be available at http://localhost:3000"

