# Must-Order Deployment Script for Windows
# This script helps deploy the must-order application

Write-Host "🚀 Starting Must-Order deployment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is available: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is available: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path "env.local.example") {
        Copy-Item "env.local.example" ".env.local"
        Write-Host "📝 Please edit .env.local with your actual values:" -ForegroundColor Cyan
        Write-Host "   - OPENAI_API_KEY" -ForegroundColor White
        Write-Host "   - DATABASE_URL" -ForegroundColor White
        Write-Host "   - CRON_SECRET" -ForegroundColor White
        Write-Host ""
        Write-Host "Press Enter when you've updated .env.local..." -ForegroundColor Cyan
        Read-Host
    } else {
        Write-Host "❌ env.local.example not found. Please create .env.local manually." -ForegroundColor Red
        exit 1
    }
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Push database schema
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
npx prisma db push

# Build the application
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Deployment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "To start the production server:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "To view the database:" -ForegroundColor Cyan
Write-Host "   npx prisma studio" -ForegroundColor White
Write-Host ""
Write-Host "🌐 The application will be available at http://localhost:3000" -ForegroundColor Green

