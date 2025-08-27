# Must-Order

A voice-optional, community-driven platform that helps people order the right dish at any restaurant: signature, trending, or destination-worthy.

## 🍽️ Core Concept

- **Guests land, allow geolocation, and instantly see "Must-Order Near Me"** and destination lists (cities, neighborhoods)
- **Each Restaurant has a curated set of Dishes** with: must-order badge, "how to order / pro tips," popularity heat, photos, quick reviews, and a Destination-Worthy Score
- **Community can upvote a dish**, leave "Server Script" (exact phrasing to order), add photos, check-in, rank flavor/texture/value, and propose new dishes
- **Seed content via an admin/importer** that ingests a user-provided CSV of "Diners, Drive-Ins and Dives (DDD) hitlist" (restaurant + dish names)

## 🛠️ Tech Stack

- **Next.js 14** + TypeScript (App Router)
- **Tailwind CSS** + shadcn/ui + lucide-react
- **Prisma ORM** with SQLite default, switchable to Postgres via DATABASE_URL
- **OpenAI API**:
  - Embeddings: normalize dish names and power semantic search
  - Chat (optional): summarize reviews into a neat "Why this dish" blurb
  - TTS (optional): speak the "how to order" scripts
- **Maps**: Leaflet + OpenStreetMap tiles (no keys required)
- **Zod** for validation; **Vitest** for tests

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd must-order
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` and add your:
   - `OPENAI_API_KEY` (required for semantic search)
   - `CRON_SECRET` (for cache recomputation)
   - `DATABASE_URL` (defaults to SQLite)

3. **Set up the database:**
   ```bash
   npm run db:push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── import/        # CSV import endpoints
│   │   ├── search/        # Semantic search
│   │   ├── vote/          # Voting system
│   │   ├── review/        # Review system
│   │   ├── checkin/       # Check-in system
│   │   └── cron/          # Cache recomputation
│   ├── page.tsx           # Home page
│   ├── import/page.tsx    # CSV import page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── DishCard.tsx      # Dish display component
│   ├── VoteButton.tsx    # Voting component
│   ├── TrendBadge.tsx    # Trending indicator
│   └── SearchBar.tsx     # Search interface
├── lib/                  # Utility libraries
│   ├── db.ts            # Database connection
│   ├── openai.ts        # OpenAI client
│   ├── embeddings.ts    # Embedding utilities
│   ├── search.ts        # Semantic search
│   ├── ranking.ts       # Scoring algorithms
│   ├── geo.ts           # Geolocation utilities
│   ├── csv.ts           # CSV parsing
│   └── utils.ts         # General utilities
└── styles/              # Global styles
    └── globals.css      # Tailwind + custom styles
```

## 🎯 Key Features

### 🔍 Semantic Search
- Search for dishes using natural language ("best birria taco", "smashburger with onions")
- OpenAI embeddings power intelligent dish matching
- Proximity-based filtering when geolocation is available

### 📊 Scoring System
- **Destination-Worthy Score (0-100)**: Weighted blend of community upvotes, recent reviews, check-ins, and diversity bonuses
- **Trending Score**: Exponential time decay over recent activity
- Automatic cache recomputation via cron job

### 📈 Community Features
- Upvote dishes you love
- Write reviews with ratings and tags
- Check in at restaurants
- Add photos (URL-based for now)
- Build and share food lists

### 📥 CSV Import
- Import your DDD hitlist via CSV
- Automatic restaurant and dish creation
- Episode reference tracking
- Embedding generation for new dishes

## 🗄️ Database Schema

The application uses a comprehensive Prisma schema with models for:
- **Users**: Community members with preferences
- **Restaurants**: Venues with location and metadata
- **Dishes**: Menu items with embeddings and scores
- **Reviews**: User feedback and ratings
- **Votes**: Community upvotes
- **Checkins**: Location-based activity
- **Photos**: Visual content
- **Lists**: User-curated collections

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run test` - Run Vitest tests
- `npm run postinstall` - Generate Prisma client

## 🔐 Security & Privacy

- **No scraping**: Only user-provided CSVs or manual entries
- **Rate limiting**: Write endpoints are rate-limited
- **CRON protection**: Cache recomputation locked by CRON_SECRET
- **OpenAI guardrails**: Never fabricate dish details, only summarize existing content

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Key test files:
- `lib/ranking.test.ts` - Destination/trending score math
- `lib/search.test.ts` - Cosine ranking, radius filter
- `app/api/import/ddd-csv/route.test.ts` - CSV happy path + merge logic

## 🚧 TODOs & Future Enhancements

- [ ] **Image uploads**: Replace URL-based photos with file uploads
- [ ] **OAuth integration**: User authentication and profiles
- [ ] **Map providers**: Add Mapbox/Google Maps support
- [ ] **Voice features**: TTS for "how to order" scripts
- [ ] **Mobile app**: React Native companion app
- [ ] **Real-time features**: Live updates and notifications
- [ ] **Advanced analytics**: Restaurant and dish insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by food lovers everywhere who want to order the right thing
- Built with Next.js, Prisma, and the amazing open-source community
- Special thanks to Diners, Drive-Ins and Dives for the inspiration

---

**Never order the wrong thing again! 🍕🍔🍜**
