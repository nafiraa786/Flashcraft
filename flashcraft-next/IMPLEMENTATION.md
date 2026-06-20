# FlashCraft - Phase 1-3 Implementation Guide

## ✅ What's Been Completed

### Phase 1: Database + Authentication Infrastructure
- ✅ Created Prisma schema with models: User, StudioSession, GeneratedCode, Deployment
- ✅ Set up Supabase integration (PostgreSQL + Auth)
- ✅ Created lib/db.ts - Prisma client singleton
- ✅ Created lib/auth.ts - Authentication utilities
- ✅ Updated lib/studio-store.ts to use Prisma (migrated from JSON)
- ✅ Updated /api/studios to validate auth and store with userId
- ✅ Created /api/auth endpoint for sign up/sign in

### Phase 2: Claude AI Code Generation
- ✅ Integrated Anthropic SDK
- ✅ Created lib/anthropic.ts - Claude wrapper with streaming support
- ✅ Created lib/prompts.ts - System prompts for production-ready code generation
- ✅ Created lib/code-parser.ts - Parsing and validation of Claude's JSON output
- ✅ Created /api/generate endpoint with:
  - Model selection (Sonnet/Opus)
  - File validation
  - Database persistence
  - Error handling with fallback template

### Phase 3: Backend WebContainer & Build Pipeline
- ✅ Created lib/webcontainer-server.ts - Backend WebContainer manager
- ✅ Manages WebContainer instances per session
- ✅ Auto-mounts files to WebContainer
- ✅ Runs npm install + dev server
- ✅ Returns preview URL to frontend
- ✅ Created /api/build endpoint to trigger builds

---

## 🚀 Quick Start Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

**Sign up at https://supabase.com**

Create a new project and copy these from Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Set Up Database

```bash
# Push schema to Supabase
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### 4. Get Anthropic API Key

Sign up at https://console.anthropic.com and create an API key, add to `.env.local`

### 5. Run Dev Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 🔄 Usage Flow

### Current Flow (What Works Now)

1. **User Onboarding**
   - User visits landing page
   - Enters prompt (e.g., "Build a habit tracker")
   - Clicks "Forge" button

2. **Backend Processing**
   - `POST /api/studios` creates session with userId
   - Redirects to `/studio/[id]`

3. **Code Generation** (Manual for now)
   - Backend calls Claude with system prompt
   - Claude generates complete React app code
   - Code is validated and stored in DB

4. **Build & Preview** (Manual for now)
   - Backend mounts files to WebContainer
   - Runs `npm install` + `npm run dev`
   - Returns preview URL

5. **Display Preview**
   - Frontend shows iframe with preview URL
   - User can see running app

---

## 📋 What's Next (Quick Implementation Tasks)

### Immediate Tasks (Day 1):
1. **Update frontend to call /api/generate**
   - Modify `app/page.tsx` to send prompt to API
   - Show loading state while generating

2. **Update studio page to call /api/build**
   - Fetch preview URL from backend
   - Display in iframe
   - Show build logs

3. **Add basic auth UI**
   - Sign up form
   - Sign in form
   - Logout button
   - Store auth token in cookie

### Code Changes Needed:

#### `app/page.tsx` - Add real API call
```typescript
const submitPrompt = async () => {
  setIsSubmitting(true);
  try {
    // Create session
    const sessionRes = await fetch("/api/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: trimmed }),
    });
    const { id } = await sessionRes.json();
    
    // Generate code
    const genRes = await fetch(`/api/generate?sessionId=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: trimmed }),
    });
    
    // Build (mount to WebContainer)
    const buildRes = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    });
    const { previewUrl } = await buildRes.json();
    
    router.push(`/studio/${id}`);
  } catch (error) {
    setToast("Error: " + error.message);
  }
};
```

#### `app/studio/[id]/studio-client.tsx` - Remove WebContainer, add API fetch
```typescript
useEffect(() => {
  // Fetch preview URL from backend
  const fetchPreview = async () => {
    const res = await fetch(`/api/build?sessionId=${sessionId}`);
    const { previewUrl } = await res.json();
    setPreviewUrl(previewUrl);
  };
  fetchPreview();
}, [sessionId]);
```

---

## 🔐 API Endpoints Summary

### Authentication
- `POST /api/auth` - Sign up/in/out with Supabase

### Code Generation  
- `POST /api/generate?sessionId=<id>` - Generate code from prompt
- `GET /api/generate?sessionId=<id>` - Fetch generated code

### Build & Preview
- `POST /api/build` - Mount to WebContainer, start dev server
- `GET /api/build?sessionId=<id>` - Get build status/preview URL

### Session Management
- `POST /api/studios` - Create new session
- `GET /api/studios` - List user's sessions (needs implementing)

---

## 🧪 Testing the Flow

### Test 1: Generate Code
```bash
curl -X POST http://localhost:3000/api/generate?sessionId=test123 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a button component"}'
```

### Test 2: Build & Get Preview
```bash
curl -X POST http://localhost:3000/api/build \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test123"}'
```

### Test 3: Check Build Status
```bash
curl http://localhost:3000/api/build?sessionId=test123
```

---

## 🐛 Known Limitations

1. **WebContainer in serverless** - Works for MVP but doesn't scale past 10-20 concurrent builds
   - Solution: Migrate to separate Node.js service with Docker later

2. **Session cleanup** - No automatic cleanup of old WebContainer instances
   - Solution: Add scheduled job to clean up stale containers after timeout

3. **Error messages** - Limited error context from WebContainer
   - Solution: Add better logging and error boundary components

4. **Streaming** - Code generation doesn't stream to user in real-time
   - Solution: Use next-stream or WebSocket for real-time updates

5. **Authentication** - Basic JWT, no session management UI yet
   - Solution: Add auth pages and middleware

---

## 📦 File Structure

```
flashcraft-next/
├── app/
│   ├── api/
│   │   ├── auth/route.ts (NEW)
│   │   ├── studios/route.ts (UPDATED)
│   │   ├── generate/route.ts (NEW)
│   │   ├── build/route.ts (NEW)
│   │   └── deploy/route.ts (NOT YET)
│   ├── studio/[id]/
│   │   ├── page.tsx (server)
│   │   └── studio-client.tsx (needs update)
│   ├── page.tsx (needs update)
│   └── layout.tsx
├── lib/
│   ├── db.ts (NEW)
│   ├── auth.ts (NEW)
│   ├── anthropic.ts (NEW)
│   ├── prompts.ts (NEW)
│   ├── code-parser.ts (NEW)
│   ├── webcontainer-server.ts (NEW)
│   ├── studio-store.ts (UPDATED)
│   └── utils.ts
├── types/
│   └── index.ts (NEW)
├── prisma/
│   └── schema.prisma (NEW)
├── .env.local (NEW)
└── package.json (UPDATED)
```

---

## 🎯 Success Criteria

After completing next steps, you should be able to:

- ✅ Sign up a new user
- ✅ Submit a prompt on landing page
- ✅ See code generation happen
- ✅ See a preview of the running app
- ✅ Refresh the page and see project persists
- ✅ Create multiple projects
- ✅ Each project has independent preview

---

## 🔗 Dependencies Installed

```json
{
  "@anthropic-ai/sdk": "^0.24.0",
  "@prisma/client": "^5.0.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "@supabase/supabase-js": "^2.40.0",
  "@webcontainer/api": "^1.6.4",
  "vercel": "^37.0.0"
}
```

---

## 🚨 Important Notes

1. **Environment Variables** - Must be set in `.env.local` before dev server starts
2. **Prisma Migrations** - Must run `npm run prisma:migrate` after schema changes
3. **WebContainer** - Only works in modern browsers (Chrome, Firefox, Safari, Edge)
4. **CORS Headers** - Already configured in next.config.ts for WebContainer
5. **Rate Limits** - Consider adding rate limiting to `/api/generate` later

---

## 📞 Support

If something isn't working:

1. Check `.env.local` has all required variables
2. Check Supabase project is created and accessible
3. Run `npm run prisma:generate` to regenerate Prisma client
4. Check console logs for detailed errors
5. Clear Next.js cache: `rm -rf .next`

---

## Next Phase (Deployment - Phase 4)

Phase 4 not included in this sprint, but will include:
- Vercel API integration
- Deploy endpoint
- Live URL generation
- Deployment tracking in DB

Start with Phase 4 when MVP is stable and working end-to-end.
