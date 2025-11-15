# Security Documentation

## 🔒 Environment Variables & API Keys

### VITE_GEMINI_API_KEY

**Status**: ✅ Safe to expose to browser (by design)

#### Why This is Safe

1. **Client-Side API Design**
   - Google Gemini API is designed for client-side use
   - Similar to Google Maps API, Firebase, etc.
   - Intended to be called from browsers

2. **Protection Mechanisms**
   - **Domain Restrictions**: Set allowed domains in Google Cloud Console
   - **Usage Quotas**: Limit requests per day/month
   - **API Key Restrictions**: Can restrict to specific APIs only
   - **Rate Limiting**: Google enforces rate limits

3. **Standard Practice**
   - All Vite environment variables with `VITE_` prefix are exposed to client
   - This is required for them to work in the browser
   - Same pattern used by Create React App (`REACT_APP_`), Next.js (`NEXT_PUBLIC_`), etc.

#### How to Secure Your API Key

**In Google Cloud Console** (https://console.cloud.google.com):

1. **Set Application Restrictions**
   ```
   HTTP referrers (websites)
   - https://your-domain.vercel.app/*
   - http://localhost:5173/* (for development)
   ```

2. **Set API Restrictions**
   ```
   Restrict key to:
   - Generative Language API
   ```

3. **Set Usage Quotas**
   ```
   Queries per day: 1000 (or your preference)
   Queries per minute: 60
   ```

4. **Monitor Usage**
   - Check Google Cloud Console regularly
   - Set up billing alerts
   - Review API usage logs

#### What Happens if Key is Exposed?

**Worst Case Scenario**:
- Someone uses your API quota
- You hit your usage limits
- You may incur charges (if on paid plan)

**What They CANNOT Do**:
- ❌ Access your Google account
- ❌ Access other Google services
- ❌ Steal personal data
- ❌ Modify your project
- ❌ Use it on other domains (if restricted)

**Mitigation**:
1. Rotate the key in Google Cloud Console
2. Update the key in Vercel environment variables
3. Redeploy

---

## 🛡️ Security Best Practices

### What We Do

✅ **No Sensitive Data in Code**
- No passwords, tokens, or secrets in source code
- All sensitive data in environment variables
- `.env` files in `.gitignore`

✅ **API Key Protection**
- Domain restrictions enabled
- Usage quotas set
- Regular monitoring

✅ **HTTPS Only**
- Vercel provides automatic HTTPS
- All traffic encrypted

✅ **No Backend Secrets**
- No database credentials
- No server-side API keys
- Pure client-side application

✅ **Content Security**
- No user data storage
- No authentication system
- No personal information collected

### What Users Should Do

**If Deploying Your Own Instance**:

1. **Get Your Own API Key**
   - Don't use someone else's key
   - Get free key at https://makersuite.google.com/app/apikey

2. **Restrict Your Key**
   - Add your domain to allowed referrers
   - Set usage quotas
   - Enable only needed APIs

3. **Monitor Usage**
   - Check Google Cloud Console monthly
   - Set up billing alerts
   - Review for unusual activity

4. **Rotate Regularly**
   - Change API key every 3-6 months
   - Update in Vercel dashboard
   - Redeploy application

---

## 🚨 What to Avoid

### ❌ Never Expose These

These should NEVER be in client-side code:

- Database passwords
- Server API keys (AWS, etc.)
- OAuth client secrets
- Private keys
- JWT secrets
- Encryption keys
- Admin credentials

### ✅ Safe to Expose (with restrictions)

These are designed for client-side use:

- Google Maps API key (with domain restrictions)
- Firebase config (with security rules)
- Gemini API key (with domain restrictions)
- Public analytics IDs (Google Analytics, etc.)
- CDN URLs
- Public API endpoints

---

## 🔍 Vercel Security

### Automatic Protections

Vercel provides:
- ✅ Automatic HTTPS/SSL
- ✅ DDoS protection
- ✅ Edge network security
- ✅ Environment variable encryption
- ✅ Secure build environment

### Environment Variables

**How Vercel Handles Them**:
1. Stored encrypted in Vercel's infrastructure
2. Injected at build time
3. `VITE_` prefix makes them available to browser
4. Non-prefixed vars stay server-side only (if using SSR)

---

## 📊 Risk Assessment

### VITE_GEMINI_API_KEY

**Risk Level**: 🟡 Low (with proper restrictions)

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| Quota abuse | Medium | Low | Set usage limits |
| Key theft | High | Low | Domain restrictions |
| Unauthorized use | Medium | Low | Rate limiting |
| Cost overrun | Low | Medium | Billing alerts |

**Overall**: Safe for production use with proper configuration

---

## 🔄 Key Rotation Process

If you need to rotate your API key:

### Step 1: Create New Key
1. Go to Google Cloud Console
2. Create new API key
3. Apply same restrictions

### Step 2: Update Vercel
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Edit `VITE_GEMINI_API_KEY`
4. Save new value

### Step 3: Redeploy
1. Deployments tab
2. Redeploy latest
3. Verify new key works

### Step 4: Revoke Old Key
1. Go to Google Cloud Console
2. Delete old API key
3. Confirm it's no longer in use

---

## 📝 Compliance

### Data Privacy

**What We Collect**: Nothing
- No user accounts
- No personal data
- No tracking cookies
- No analytics (optional)

**What Google Collects** (via Gemini API):
- API requests (for service operation)
- Usage metrics (for billing)
- See Google's privacy policy

### GDPR Compliance

Since we don't collect user data:
- ✅ No data to protect
- ✅ No consent needed
- ✅ No data retention policy needed
- ✅ No right to deletion needed

---

## 🆘 Security Incident Response

### If API Key is Compromised

1. **Immediate Actions**
   - Revoke key in Google Cloud Console
   - Check usage logs for abuse
   - Create new key with restrictions

2. **Update Deployment**
   - Update Vercel environment variable
   - Redeploy application
   - Verify new key works

3. **Review**
   - Check for unusual charges
   - Review access logs
   - Update restrictions if needed

### Reporting Security Issues

If you find a security vulnerability:
1. **Do NOT** open a public GitHub issue
2. Email the repository owner directly
3. Include details and reproduction steps
4. Allow time for fix before disclosure

---

## ✅ Security Checklist

Before deploying:

- [ ] API key has domain restrictions
- [ ] Usage quotas are set
- [ ] Billing alerts configured
- [ ] `.env` in `.gitignore`
- [ ] No secrets in source code
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Regular monitoring plan in place

---

## 📚 Resources

**Google Cloud Security**:
- API Key Best Practices: https://cloud.google.com/docs/authentication/api-keys
- Security Overview: https://cloud.google.com/security

**Vercel Security**:
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Security: https://vercel.com/security

**Vite Security**:
- Env Variables: https://vitejs.dev/guide/env-and-mode.html

---

## 🎯 Summary

**VITE_GEMINI_API_KEY is safe to use in production** when:
1. ✅ Domain restrictions are enabled
2. ✅ Usage quotas are set
3. ✅ Regular monitoring is in place
4. ✅ Key is rotated periodically

This is the **standard, recommended approach** for client-side AI integrations.

**The Vercel warning is informational** - it's reminding you to verify the key is meant to be public, which in this case, it is.

---

**Last Updated**: 2024  
**Security Contact**: Repository owner  
**Threat Model**: Low-risk client-side application
