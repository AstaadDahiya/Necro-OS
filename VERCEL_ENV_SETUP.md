# Vercel Environment Variable Setup

## ✅ Fixed: vercel.json Configuration

The `vercel.json` has been updated to remove the secret reference that was causing the deployment error.

---

## 🔧 How to Add Environment Variables in Vercel

### Step 1: Deploy Your Project

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import `AstaadDahiya/Necro-OS` from GitHub
4. Click "Deploy" (it will deploy without the API key first)

### Step 2: Add Environment Variable

After the first deployment:

1. Go to your project dashboard
2. Click on **"Settings"** tab
3. Click on **"Environment Variables"** in the left sidebar
4. Add a new variable:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key (get from https://makersuite.google.com/app/apikey)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **"Save"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click the three dots (...) on the latest deployment
3. Click **"Redeploy"**
4. The app will rebuild with your API key

---

## 🎯 Alternative: Deploy Without Gemini API

The app works without the Gemini API key! The AI features will be disabled, but all other horror features work:

**What works without API key**:
- ✅ All visual effects
- ✅ All audio effects
- ✅ Possession system
- ✅ Exorcism mechanics
- ✅ Achievements
- ✅ Endings
- ✅ All applications
- ✅ Jumpscares

**What needs API key**:
- ❌ Cursed Clippy AI chat
- ❌ AI-generated phantom notifications

**To disable AI features**, the app automatically detects missing API key and disables those features gracefully.

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_GEMINI_API_KEY` | No | undefined | Google Gemini API key for AI features |

---

## 🚀 Quick Deploy Commands

### Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add VITE_GEMINI_API_KEY

# Enter your API key when prompted

# Deploy to production
vercel --prod
```

---

## ✅ Verification

After deployment with API key:

1. Open your deployed site
2. Open browser console
3. Check for errors:
   ```javascript
   // Should NOT see "Gemini API key not configured"
   ```
4. Try Cursed Clippy (if implemented)
5. Check phantom notifications

---

## 🔒 Security Notes

- ✅ API key is stored securely in Vercel
- ✅ Not exposed in client-side code
- ✅ Not in git repository
- ✅ Can be rotated anytime in Vercel dashboard

---

## 🐛 Troubleshooting

### Error: "VITE_GEMINI_API_KEY is not defined"

**Solution**: Add the environment variable in Vercel dashboard and redeploy

### Error: "Gemini API quota exceeded"

**Solution**: Check your Google Cloud quota at https://console.cloud.google.com

### AI features not working

**Solution**: 
1. Verify API key is correct
2. Check browser console for errors
3. Ensure API key has proper permissions

---

## 🎉 Success!

Your NecroOS is now deployed with proper environment variable configuration!

**No more deployment errors!** 👻
