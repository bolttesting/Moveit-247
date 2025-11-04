# Zoho Survey API - Quick Setup Guide

## ⚡ Quick Steps (5 minutes)

### 1. Get Zoho API Credentials

1. Go to: **https://api-console.zoho.com/**
2. Click **"Add Client"** → Select **"Server-based Applications"**
3. Fill in:
   - Name: `MoveIt247`
   - Redirect URI: `http://localhost:4000/callback` (or your domain)
4. **Copy these values:**
   - ✅ Client ID
   - ✅ Client Secret

### 2. Generate Refresh Token

**Easy Method (OAuth Playground):**

1. Go to: **https://api-console.zoho.com/self/client**
2. Select your client
3. **Scopes to select:**
   ```
   ZohoSurvey.surveys.READ
   ZohoSurvey.responses.READ
   ```
4. Click **"Generate Code"** → Login → Copy code
5. Paste code → Click **"Generate Refresh Token"**
6. **Copy Refresh Token** ✅

### 3. Set Environment Variables

**For Windows (PowerShell):**
```powershell
$env:ZOHO_CLIENT_ID="your_client_id"
$env:ZOHO_CLIENT_SECRET="your_client_secret"
$env:ZOHO_REFRESH_TOKEN="your_refresh_token"
$env:ZOHO_REGION="com"
```

**For Production (Railway/Vercel):**
- Add these in your hosting platform's Environment Variables section:
  - `ZOHO_CLIENT_ID`
  - `ZOHO_CLIENT_SECRET`
  - `ZOHO_REFRESH_TOKEN`
  - `ZOHO_REGION` (optional, defaults to 'com')

### 4. Restart Your Server

```bash
npm start
```

### 5. Test It!

1. Go to **Add Project** → **Tab 3: Documents**
2. Click **"Fetch from Zoho"** button
3. Check if surveys appear in dropdown ✅

---

## 🔍 Find Your Zoho Region

Check your Zoho login URL:
- `accounts.zoho.com` → region = **com**
- `accounts.zoho.eu` → region = **eu**
- `accounts.zoho.in` → region = **in**
- `accounts.zoho.jp` → region = **jp**
- `accounts.zoho.au` → region = **au**

---

## ❌ Common Issues

**"Zoho not configured"**
- Check environment variables are set
- Restart server after setting variables

**"Authentication failed"**
- Verify Client ID and Secret are correct
- Regenerate Refresh Token
- Check scopes are selected

**"API endpoint not accessible"**
- Verify you have Zoho Survey subscription
- Check API access is enabled in Zoho Survey settings
- Try different API endpoint (see full guide)

---

## 📝 Required Zoho Survey API Scopes

Minimum scopes needed:
- `ZohoSurvey.surveys.READ`
- `ZohoSurvey.responses.READ`

---

## 🆘 Need Help?

See full guide: **ZOHO_SURVEY_SETUP.md**

