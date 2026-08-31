# Setup Guide - The Zimbabwean Table

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Gemini API Key

**Option A: Get Free Gemini API Key (Recommended)**

1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy your key
4. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
5. Edit `.env` and add:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

**Option B: Use OpenRouter (Alternative)**

1. Visit: https://openrouter.ai/keys
2. Create an account and get API key
3. In `.env`:
   ```
   OPENROUTER_API_KEY=your_openrouter_key_here
   ```

### 3. Run the Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

## Testing the Features

### ✅ AI Discovery
1. Navigate to `/tourist/ai` (or click "AI" in tourist nav)
2. Try: "Find me traditional food in Harare under $30"
3. You should see:
   - "AI matched" badge (green) - means Gemini is working ✓
   - NOT "Offline matching" (orange) - means API failed ✗

### ✅ AI Menu Generator
1. Navigate to `/hospitality/menu`
2. Select season, style, and courses
3. Click "Generate seasonal menu"
4. You should see:
   - "AI generated" badge (green) ✓
   - NOT "Offline menu" (orange) ✗

### ✅ Real Places (Foursquare)
1. Navigate to `/tourist/places` (new "Places" tab)
2. Select a city (Harare, Bulawayo, Victoria Falls, etc.)
3. Search for "restaurant" or "cafe"
4. You should see real venues from Zimbabwe
5. Click "View on map" to open location in Google Maps

## Troubleshooting

### Issue: AI shows "Offline matching/menu" badge

**Cause**: Gemini API key is missing or invalid

**Solution**:
1. Check your `.env` file exists
2. Verify `GEMINI_API_KEY` is set correctly
3. Check browser console for error messages
4. Restart dev server after changing `.env`

### Issue: "No API key configured" error

**Cause**: No `.env` file or empty API keys

**Solution**:
```bash
# Create .env from template
cp .env.example .env

# Edit and add your key
nano .env  # or use any text editor
```

### Issue: Foursquare shows no results

**Cause**: API rate limit or network issue

**Solution**:
1. Wait a minute and try again
2. Try a different city
3. Check browser console for errors

### Issue: Module not found errors

**Cause**: Dependencies not installed

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Checking Console Logs

Open browser Developer Tools (F12) and look for:

### ✓ Success Messages:
```
Using Gemini API...
✓ Gemini gemini-3.6-flash success
```

### ✗ Error Messages:
```
Gemini gemini-3.6-flash error 401: API key not valid
AI Discovery failed, using fallback: Error: gemini unavailable
```

## Environment Variables Explained

```bash
# Required for AI features (choose ONE)
GEMINI_API_KEY=        # Google's Gemini API (recommended, free tier)
OPENROUTER_API_KEY=    # OpenRouter (alternative, paid)

# Pre-configured (no action needed)
# Foursquare API key is hardcoded in src/lib/foursquare.server.ts
```

## What Uses What API

| Feature | API | Required Key |
|---------|-----|--------------|
| AI Discovery (`/tourist/ai`) | Gemini 3.6 Flash | GEMINI_API_KEY |
| AI Menu Generator (`/hospitality/menu`) | Gemini 3.6 Flash | GEMINI_API_KEY |
| Real Places (`/tourist/places`) | Foursquare | ✓ Pre-configured |
| Tourist Dashboard | None | - |
| Hospitality Dashboard | None | - |
| Farmer Dashboard | None | - |

## API Usage & Limits

### Gemini API (Free Tier)
- 60 requests per minute
- 1,500 requests per day
- Free forever
- No credit card required

### Foursquare API (Pre-configured)
- 50,000 regular calls per day
- Already configured in the app
- No setup needed

## Need Help?

1. Check CHANGELOG.md for recent updates
2. Check browser console for errors
3. Verify `.env` file has correct keys
4. Restart dev server after env changes
5. Try the alternative API (OpenRouter vs Gemini)

## Production Deployment

Before deploying:

1. ✓ Set environment variables in your hosting platform
2. ✓ Never commit `.env` to git (already in .gitignore)
3. ✓ Test AI features work in production
4. ✓ Monitor API usage and rate limits

Example for Vercel:
```bash
vercel env add GEMINI_API_KEY
# Paste your key when prompted
```

Example for Netlify:
```bash
netlify env:set GEMINI_API_KEY your_key_here
```

---

🎉 **You're all set!** The app should now show "AI generated" and "AI matched" badges when working correctly.
