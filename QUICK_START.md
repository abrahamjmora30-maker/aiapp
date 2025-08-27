# Quick Start Guide

## 🚀 Get Must-Order Running in 5 Minutes

### Prerequisites
- Node.js 18+ and npm installed
- OpenAI API key (optional for full features)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
```bash
# Copy environment file
cp env.local.example .env.local

# Edit with your values (at minimum, set DATABASE_URL)
# For development, you can use the default SQLite:
# DATABASE_URL="file:./dev.db"
```

### Step 3: Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open Your Browser
Navigate to `http://localhost:3000`

## 🎯 What You'll See

- **Home Page**: Trending dishes, city collections, and TV hitlists
- **Nearby Page**: Find must-order dishes near your location
- **Import Page**: Upload DDD CSV files (admin feature)
- **Search**: Semantic search for dishes across restaurants

## 🔧 Key Features to Test

1. **Browse Dishes**: View trending and destination-worthy dishes
2. **Search**: Try searching for "burger" or "pizza" 
3. **Import Data**: Use the sample CSV file to import restaurant data
4. **Database**: Open `npx prisma studio` to view your data

## 📁 Sample Data

Use the included `sample-ddd-import.csv` file to import some test data:

1. Go to `/import` page
2. Upload the CSV file
3. Watch the data populate your database

## 🐛 Troubleshooting

### Common Issues:

**"npm not found"**
- Install Node.js from https://nodejs.org/

**"Database connection failed"**
- Check your `.env.local` file
- Ensure `DATABASE_URL` is set correctly

**"OpenAI API errors"**
- Set your `OPENAI_API_KEY` in `.env.local`
- Or remove OpenAI features for basic testing

**"Port 3000 already in use"**
- Change port: `npm run dev -- -p 3001`
- Or kill the process using port 3000

## 🚀 Next Steps

Once running locally:

1. **Deploy to Production**: See `DEPLOYMENT.md`
2. **Add Real Data**: Import your restaurant CSV files
3. **Customize**: Modify styling and features
4. **Scale**: Add PostgreSQL, Redis, and monitoring

## 📞 Need Help?

- Check the main `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for production deployment
- Open an issue on GitHub with error details

