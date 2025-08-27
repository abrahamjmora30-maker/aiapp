# Must-Order Deployment Guide

## Prerequisites

Before deploying, ensure you have the following installed on your server:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd must-order

# Install dependencies
npm install
# OR
yarn install
# OR
pnpm install
```

### 2. Environment Configuration

```bash
# Copy the environment example file
cp env.local.example .env.local

# Edit .env.local with your actual values
nano .env.local
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key for embeddings and AI features
- `DATABASE_URL`: Database connection string (SQLite for development, PostgreSQL for production)
- `NEXT_PUBLIC_APP_NAME`: App name (default: "Must-Order")
- `NEXT_PUBLIC_MAP_TILE_URL`: Map tile URL (default: OpenStreetMap)
- `CRON_SECRET`: Secret for cron job security

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 4. Development Server

```bash
# Start development server
npm run dev
# OR
yarn dev
# OR
pnpm dev
```

The application will be available at `http://localhost:3000`

### 5. Production Build

```bash
# Build the application
npm run build
# OR
yarn build
# OR
pnpm build

# Start production server
npm start
# OR
yarn start
# OR
pnpm start
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Option 2: Railway

1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Option 3: DigitalOcean App Platform

1. Connect your repository
2. Configure build settings
3. Set environment variables
4. Deploy

### Option 4: Self-Hosted (Docker)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t must-order .
docker run -p 3000:3000 must-order
```

### Option 5: Traditional VPS

1. SSH into your server
2. Install Node.js and npm
3. Clone the repository
4. Follow the Quick Start steps above
5. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start npm --name "must-order" -- start
pm2 startup
pm2 save
```

## Database Setup

### SQLite (Development)
- No additional setup required
- Database file will be created automatically

### PostgreSQL (Production)
1. Install PostgreSQL
2. Create a database
3. Update `DATABASE_URL` in `.env.local`
4. Run `npx prisma db push`

## Cron Jobs

Set up a cron job to recompute scores nightly:

```bash
# Add to crontab
0 2 * * * curl -X POST https://your-domain.com/api/cron/recompute \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

- Use Vercel Analytics or similar for performance monitoring
- Set up error tracking with Sentry
- Monitor database performance
- Set up uptime monitoring

## Security Considerations

- Keep environment variables secure
- Use HTTPS in production
- Set up rate limiting
- Regularly update dependencies
- Monitor for security vulnerabilities

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check `DATABASE_URL` format
   - Ensure database is running
   - Verify network connectivity

2. **OpenAI API errors**
   - Verify API key is correct
   - Check API quota and billing
   - Ensure proper rate limiting

3. **Build errors**
   - Clear `.next` directory
   - Reinstall dependencies
   - Check Node.js version compatibility

4. **Environment variables not loading**
   - Restart the development server
   - Check file naming (`.env.local`)
   - Verify variable names match code

### Getting Help

- Check the logs for error messages
- Review the README.md for detailed documentation
- Open an issue on GitHub with error details

