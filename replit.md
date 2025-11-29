# VocabMaster - English Vocabulary Learning Platform

## Project Overview
VocabMaster is a comprehensive English vocabulary learning platform with user authentication, vocabulary management, and three interactive learning modes. The platform helps users build their English vocabulary through organized collections and proven learning techniques.

## Tech Stack
- **Frontend**: React 18 with TypeScript, TailwindCSS, Shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OIDC-based) + Mock Auth for local dev
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state

## Project Structure
```
├── client/src/
│   ├── components/
│   │   ├── ui/           # Shadcn UI components
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── useAuth.ts    # Authentication hook
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── queryClient.ts
│   │   ├── authUtils.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Landing.tsx         # Public landing page
│   │   ├── Dashboard.tsx       # Main dashboard with stats
│   │   ├── Collections.tsx     # Collection list
│   │   ├── CollectionDetail.tsx
│   │   ├── CollectionForm.tsx
│   │   ├── VocabularyList.tsx
│   │   ├── VocabularyForm.tsx
│   │   ├── VocabularyImport.tsx # CSV/JSON bulk import
│   │   ├── QuizMode.tsx        # Multiple choice quiz
│   │   ├── FlashcardMode.tsx   # Flip card learning
│   │   ├── SpellingMode.tsx    # Type-the-word test
│   │   └── Profile.tsx
│   ├── App.tsx
│   └── index.css
├── server/
│   ├── index.ts          # Express server entry
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── replitAuth.ts     # Authentication setup
│   ├── db.ts             # Database connection
│   └── seed.ts           # Sample data seeding
├── dev-windows.js        # Windows Node.js dev launcher
├── dev-windows.bat       # Windows batch dev launcher
├── dev-windows.sh        # Git Bash dev launcher
└── shared/
    └── schema.ts         # Database schema & types
```

## Database Schema
- **users**: User profiles (managed by Replit Auth)
- **sessions**: Authentication sessions
- **collections**: Vocabulary groupings with color coding
- **vocabulary**: Individual words with meanings and examples
- **progress**: Learning progress per collection
- **quizResults**: Quiz/study session results

## Key Features
1. **User Authentication**: Replit Auth on Replit, Mock Auth for local development
2. **Vocabulary Management**: Full CRUD operations, bulk import (CSV/JSON)
3. **Collections**: Organize words into themed groups
4. **Learning Modes**:
   - Multiple Choice Quiz (3 options per question)
   - Flashcards with flip animation
   - Spelling Test with hints
5. **Progress Tracking**: Track mastered words, quiz accuracy, study history
6. **Text-to-Speech**: OpenAI pronunciation support in all learning modes
7. **Responsive Design**: Mobile-friendly with sidebar navigation

## API Endpoints
- `GET/POST /api/collections` - Collection management
- `GET/POST /api/vocabulary` - Vocabulary management
- `POST /api/vocabulary/import` - Bulk import
- `POST /api/quiz-results` - Save study session results
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/seed` - Seed sample data (one-time)
- `POST /api/tts` - Text-to-speech pronunciation (requires OPENAI_API_KEY)

## Running the Project on Replit
The project uses `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

## Database Commands
- `npm run db:push` - Push schema changes to database

## Running Locally (Windows, Mac, Linux)

To run VocabMaster on your local machine:

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (local or cloud-based like Neon)

### Setup Steps

1. **Clone/Download the repository**
   ```bash
   git clone <your-repo-url>
   cd vocab-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file (or `.env.local`) in the **root directory** (same level as package.json):
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/vocab_master
   OPENAI_API_KEY=sk-xxx...your_openai_api_key
   SESSION_SECRET=dev-secret-123
   ```
   
   **Important:** The file must be in the root directory for the app to find it.

   **Where to get these values:**
   - `DATABASE_URL`: From your local PostgreSQL or Neon console
   - `OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
   - `SESSION_SECRET`: Any random string (e.g., `dev-secret-123`)

4. **Set up the database** (if using local PostgreSQL)
   ```bash
   createdb vocab_master
   npm run db:push
   ```

5. **Start the development server**

   **Windows (recommended):**
   ```bash
   dev-windows.bat
   ```
   
   **Windows (Git Bash alternative):**
   ```bash
   bash dev-windows.sh
   ```
   
   **Mac/Linux:**
   ```bash
   npm run dev
   ```

   Access the app at **http://localhost:5000**

### Database Options
- **Local PostgreSQL**: Install PostgreSQL locally and use `postgresql://localhost:5432/vocab_master`
- **Neon (recommended)**: Sign up at https://neon.tech and get a connection string with one click

### Local Development Authentication
When running locally (not on Replit), the app automatically uses mock authentication:
- You'll be logged in as "Dev User" with email `dev@localhost.local`
- All API endpoints will work without Replit Auth
- Perfect for testing the full feature set locally
- No need to provide REPLIT_AUTH_TOKEN for local development

### Troubleshooting

**"Cannot find module" or "command not found" errors:**
- Run `npm install` again to ensure all dependencies are installed
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` fresh

**"DATABASE_URL must be set" error:**
- Make sure `.env` or `.env.local` file exists in the root directory
- Verify the file contains: `DATABASE_URL=postgresql://...`
- Windows users: Use `dev-windows.bat` instead of `npm run dev`

**"Database connection failed" error:**
- Check your `DATABASE_URL` in `.env` file
- Make sure PostgreSQL is running
- Test connection: `psql -U postgres -h localhost -p 5432 -d vocab_master`

**"clientId must be a non-empty string" error:**
- This means environment variables aren't loading properly
- Windows users: Use `dev-windows.bat` which handles this automatically
- Make sure `.env` file exists in the root directory

**TTS (pronunciation) doesn't work:**
- Ensure `OPENAI_API_KEY` is set correctly in `.env`
- Try clicking the speaker button again - it may take a few seconds on first use
- Check that the API key is valid at https://platform.openai.com/api-keys

**Still having issues:**
1. Delete `node_modules` folder
2. Run `npm install`
3. Create fresh `.env` file with your credentials
4. Use `dev-windows.bat` on Windows
5. Check that PostgreSQL is running on the correct port

## User Preferences
- Dark mode support with theme toggle
- Responsive sidebar navigation
- Color-coded collections for organization

## Recent Changes
- Initial project setup with complete feature set
- Added Replit Auth integration with local mock auth fallback
- Implemented all three learning modes
- Created bulk import functionality for CSV/JSON
- Added progress tracking and dashboard stats
- Integrated OpenAI text-to-speech for pronunciation support in all learning modes
- Fixed TTS endpoint with proper ES6 imports
- Added speaker icons to Flashcards, Quiz, and Spelling modes
- Created Windows-friendly dev launchers (dev-windows.bat, dev-windows.sh, dev-windows.js)
- Added comprehensive local development setup documentation
