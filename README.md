# Brand Pilot Dashboard 🚀

A modern social content dashboard built with Vite + React + TypeScript + Tailwind + shadcn-ui, backed by Supabase. It helps you:

- 🔍 Discover relevant tweets based on your interests.
- 🤖 Generate personalized AI replies with OpenAI.
- 📱 Post tweets and send threaded replies via Twitter (X) API.
- ✍️ Draft and manage content in a Content Studio.


## Tech Stack 🛠️

- **Frontend**: `Vite`, `React`, `TypeScript`, `Tailwind CSS`, `shadcn-ui`
- **Backend**: `Supabase` (Database, Auth, Edge Functions)
- **Integrations**:
  - 🐦 Twitter (X) API v2 via Supabase Edge Function `twitter-auth`
  - 🧠 OpenAI (GPT-4o-mini) via Edge Function `generate-post`


## Project Structure 📁

```
/ (root)
  ├─ src/
  │  ├─ components/
  │  ├─ hooks/
  │  ├─ integrations/supabase/
  │  └─ assets/
  ├─ supabase/
  │  ├─ functions/
  │  │  ├─ twitter-auth/
  │  │  │  └─ index.ts
  │  │  └─ generate-post/
  │  │     └─ index.ts
  │  └─ migrations/
  ├─ .env (frontend env)
  ├─ package.json
  └─ README.md
```

Key client modules:
- 📡 `src/integrations/supabase/api.ts` – typed API helpers (profiles, onboarding, posts, social connections, relevant posts, edge functions)
- 💬 `src/components/RelevantPosts.tsx` – UI to find tweets, generate AI responses, and send replies
- ✨ `src/components/AICreator.tsx` – AI post generation and publishing


## Prerequisites ✅

- 📦 Node.js 18+ and npm
- 🗄️ Supabase project (URL + anon key)
- 🐦 X (Twitter) Developer account with an App configured for OAuth 2.0
- 🔑 OpenAI API key


## 1) Configure Environment Variables ⚙️

Frontend `.env` (already present in the repo):

```
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-anon-key>"
VITE_SUPABASE_PROJECT_ID="<your-project-ref>"
```

Edge Function environment (set in Supabase Dashboard → Functions → twitter-auth → Settings → Environment Variables):

- 🔑 `TWITTER_CLIENT_ID` – From X portal (OAuth 2.0)
- 🔐 `TWITTER_CLIENT_SECRET` – From X portal (OAuth 2.0)
- 🌐 `FRONTEND_URL` – e.g. `http://localhost:8080` (or your prod domain)
- 🧠 `OPENAI_API_KEY` – For the `generate-post` function (OpenAI)

You can also set function secrets with the Supabase CLI:

```
supabase secrets set TWITTER_CLIENT_ID=... TWITTER_CLIENT_SECRET=... FRONTEND_URL=http://localhost:8080 OPENAI_API_KEY=...
```


## 2) Configure Twitter (X) App 🐦

In the X (Twitter) developer portal for your App:

- 📱 **Type of App**: Web App, Automated App or Bot
- 🔒 **Client type**: Confidential client
- 📝 **App permissions**: Read and Write
- 🎯 **Scopes**: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
- 🔗 **Callback URI / Redirect URL**:
  - `https://<your-project-ref>.supabase.co/functions/v1/twitter-auth?action=callback`
  - Example: `https://iymlvqlpdsauayedemaq.supabase.co/functions/v1/twitter-auth?action=callback`
- 🌐 **Website URL**:
  - `http://localhost:8080` (dev) or your production frontend URL

Save settings, then copy the Client ID and generate a Client Secret. Put them in Supabase function env as above.


## 3) Database Setup 🗄️

Your database should include (at minimum):
- 👤 `profiles` – user configuration (topics, voice, goals, etc.)
- 📝 `posts` – drafted content (now includes an optional `url` column)
- 🔗 `social_connections` – stores platform connections (Twitter access tokens)
- 💬 `relevant_posts` – saved tweets for engagement + AI responses

To apply migrations (optional if you manage schema manually):

- 📊 Use Supabase SQL Editor to run files in `supabase/migrations/` as needed.


## 4) Install and Run Locally 💻

```
npm install
npm run dev
```

The app runs at `http://localhost:8080/`. 🎉


## 5) Deploy Edge Functions ☁️

Deploy from the project root:

```
# Deploy Twitter OAuth + posting/replying function
supabase functions deploy twitter-auth

# Deploy OpenAI post generation function
supabase functions deploy generate-post
```

If you see "WARNING: Docker is not running," that's okay for cloud deploys. Ensure you're authenticated with `supabase login` if prompted. ✅


## 6) Using the App 🎮

- 🔗 Connect Twitter from the Connections tab (this runs the OAuth flow and stores tokens in `social_connections`).
- 💬 **Social Engagement**:
  - 🔍 Click "Find Relevant Post" to fetch and save tweets matched to your topics/interests.
  - 🤖 Click "Generate AI Response" to create a contextual reply.
  - 📤 Click "Send Reply" to post a threaded reply to Twitter.
- ✨ **Content Studio / AI Creator**:
  - 🧠 Generate posts with GPT-4o-mini and publish to Twitter.


## 7) Troubleshooting 🔧

- ❌ **401 Unauthorized when posting/replying**
  - ✅ Ensure scopes include `tweet.write` and the user reconnected after scopes changed.
  - 🔄 Tokens can expire; the function will attempt a refresh, but you may need to reconnect.
  - 🔍 Confirm the stored tokens belong to the same App as your configured `TWITTER_CLIENT_ID/SECRET`.

- ⏰ **429 Too Many Requests (rate limit)**
  - ⏳ Wait until `x-rate-limit-reset` or respect `retry-after` seconds.
  - 📊 The Edge Function returns HTTP 429 with helpful fields: `retry_after_seconds`, `retry_at_unix_ms`.
  - 🚫 Avoid repeated OAuth retries; each attempt calls `/2/users/me`.

- 🔄 **Callback redirects to Twitter and not back to your app**
  - ✅ Verify the callback URL matches exactly:
    `https://<project-ref>.supabase.co/functions/v1/twitter-auth?action=callback`
  - 🌐 Set `FRONTEND_URL` in function env (e.g., `http://localhost:8080`).

- 🔐 **"Invalid authorization code" in callback**
  - 🚫 Don't reuse old codes. Start a fresh connect flow after redeploys.
  - 🔍 Ensure the Client ID/Secret match the app that issued the code.
  - 🔗 Ensure the `redirect_uri` is identical in authorize and token exchange.

- 🛠️ **Supabase CLI auth / deploy**
  - 🔑 Run `supabase login` and follow prompts.
  - ✅ Ensure `project_id` in `supabase/config.toml` matches your project ref.


## 8) Useful Commands 💻

```
# Start dev server
npm run dev

# Lint
npm run lint

# Deploy functions
supabase functions deploy twitter-auth
supabase functions deploy generate-post
```


## 9) Security Notes 🔒

- 🚫 Never commit secrets. Keep `TWITTER_CLIENT_SECRET` and `OPENAI_API_KEY` in Supabase function env.
- 🔄 If secrets are exposed, rotate them in the X portal / OpenAI, update in Supabase, and redeploy.


## 10) License 📄

This project is provided as-is for development and demonstration purposes.
