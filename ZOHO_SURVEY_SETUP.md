# Zoho Survey API Integration Guide

This guide will help you integrate Zoho Survey API to fetch survey forms in the Add Project Tab 3.

## Prerequisites
- Zoho account with Survey access
- Access to Zoho Developer Console
- Server environment variables configuration

---

## Step 1: Create Zoho API Application

1. **Go to Zoho Developer Console**
   - Visit: https://api-console.zoho.com/
   - Sign in with your Zoho account

2. **Create a New Client**
   - Click on "Add Client" or "Create Client"
   - Select "Server-based Applications" as the client type
   - Fill in the details:
     - **Client Name**: MoveIt247 Survey Integration
     - **Homepage URL**: `https://your-domain.com` (or `http://localhost:4000` for development)
     - **Authorized Redirect URIs**: 
       - For production: `https://your-domain.com/oauth/zoho/callback`
       - For development: `http://localhost:4000/oauth/zoho/callback`

3. **Get Your Credentials**
   - After creating, you'll receive:
     - **Client ID**: Copy this value
     - **Client Secret**: Copy this value (keep it secure!)

---

## Step 2: Generate Refresh Token

### Option A: Using Zoho OAuth Playground (Recommended)

1. **Go to Zoho OAuth Playground**
   - Visit: https://api-console.zoho.com/self/client
   - Or: https://accounts.zoho.com/developerconsole

2. **Select Your Client**
   - Choose the client you just created
   - Select **Scope**: 
     - `ZohoSurvey.surveys.READ`
     - `ZohoSurvey.responses.READ`
     - Or use: `ZohoSurvey.fullaccess.ALL`

3. **Generate Authorization Code**
   - Click "Generate Code"
   - You'll be redirected to Zoho login
   - After login, copy the **Authorization Code**

4. **Generate Refresh Token**
   - Paste the Authorization Code
   - Click "Generate Refresh Token"
   - Copy the **Refresh Token** (this is what you need!)

### Option B: Manual OAuth Flow

1. **Get Authorization Code**
   ```
   https://accounts.zoho.{region}/oauth/v2/auth?scope=ZohoSurvey.surveys.READ,ZohoSurvey.responses.READ&client_id={CLIENT_ID}&response_type=code&access_type=offline&redirect_uri={REDIRECT_URI}
   ```
   - Replace `{CLIENT_ID}` with your Client ID
   - Replace `{REDIRECT_URI}` with your redirect URI
   - Replace `{region}` with your region (com, eu, in, jp, au)
   - Login and authorize
   - Copy the `code` parameter from the redirect URL

2. **Exchange Code for Refresh Token**
   ```bash
   curl -X POST "https://accounts.zoho.{region}/oauth/v2/token" \
     -d "grant_type=authorization_code" \
     -d "client_id={CLIENT_ID}" \
     -d "client_secret={CLIENT_SECRET}" \
     -d "redirect_uri={REDIRECT_URI}" \
     -d "code={AUTHORIZATION_CODE}"
   ```
   - Response will contain `refresh_token` - copy it!

---

## Step 3: Determine Your Zoho Region

Your Zoho region depends on where your account was created:

- **com** - United States (default)
- **eu** - Europe
- **in** - India
- **jp** - Japan
- **au** - Australia

Check your Zoho account URL to determine:
- If your URL is `https://accounts.zoho.com` → region is `com`
- If your URL is `https://accounts.zoho.eu` → region is `eu`
- And so on...

---

## Step 4: Configure Environment Variables

### For Local Development (Windows)

1. **Create `.env` file** in your project root (if using dotenv)
   ```env
   ZOHO_API_VERSION=v2
   ZOHO_REGION=com
   ZOHO_CLIENT_ID=your_client_id_here
   ZOHO_CLIENT_SECRET=your_client_secret_here
   ZOHO_REFRESH_TOKEN=your_refresh_token_here
   ```

2. **Or set in PowerShell** (temporary):
   ```powershell
   $env:ZOHO_CLIENT_ID="your_client_id_here"
   $env:ZOHO_CLIENT_SECRET="your_client_secret_here"
   $env:ZOHO_REFRESH_TOKEN="your_refresh_token_here"
   $env:ZOHO_REGION="com"
   ```

### For Production (Railway/Vercel/Heroku)

1. **Railway:**
   - Go to your project → Settings → Environment Variables
   - Add each variable:
     - `ZOHO_CLIENT_ID`
     - `ZOHO_CLIENT_SECRET`
     - `ZOHO_REFRESH_TOKEN`
     - `ZOHO_REGION` (optional, defaults to 'com')

2. **Vercel:**
   - Go to Project Settings → Environment Variables
   - Add variables for Production, Preview, and Development

3. **Heroku:**
   ```bash
   heroku config:set ZOHO_CLIENT_ID=your_client_id
   heroku config:set ZOHO_CLIENT_SECRET=your_client_secret
   heroku config:set ZOHO_REFRESH_TOKEN=your_refresh_token
   heroku config:set ZOHO_REGION=com
   ```

---

## Step 5: Update server.js (if needed)

The code already reads from environment variables. If you need to add dotenv support:

```javascript
// At the top of server.js
import dotenv from 'dotenv';
dotenv.config();
```

Or if using CommonJS:
```javascript
require('dotenv').config();
```

---

## Step 6: Verify Zoho Survey API Endpoint

The current implementation uses:
- `https://surveys.zoho.com/api/v1/surveys`
- Fallback: `https://surveys.zoho.{region}/api/v1/surveys`

**Check Zoho Survey API Documentation:**
- Visit: https://www.zoho.com/survey/help/api/
- Verify the correct endpoint format for your region
- Update the endpoint in `server.js` if needed (line ~1198)

**Common Zoho Survey API Endpoints:**
- List Surveys: `GET https://surveys.zoho.com/api/v1/surveys`
- Get Survey: `GET https://surveys.zoho.com/api/v1/surveys/{survey_id}`
- List Responses: `GET https://surveys.zoho.com/api/v1/surveys/{survey_id}/responses`

---

## Step 7: Test the Integration

1. **Start your server:**
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Test the API endpoint directly:**
   ```bash
   curl http://localhost:4000/api/zoho/surveys
   ```

3. **Test in the UI:**
   - Go to Add Project → Tab 3: Documents
   - Click "Fetch from Zoho" button
   - Check the status message
   - Verify surveys appear in dropdown

---

## Troubleshooting

### Error: "Zoho not configured"
- **Solution**: Check that all environment variables are set correctly
- Verify: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`

### Error: "Authentication failed"
- **Solution**: 
  - Verify your Client ID and Client Secret are correct
  - Check if Refresh Token is valid (regenerate if expired)
  - Ensure you've authorized the required scopes

### Error: "Zoho Survey API endpoint not accessible"
- **Solution**: 
  - Check Zoho Survey API documentation for correct endpoint
  - Verify your account has Survey API access
  - Check if you need to enable API access in Zoho Survey settings
  - Try different endpoint format based on your region

### Error: "Failed to fetch surveys from Zoho"
- **Solution**:
  - Check server logs for detailed error messages
  - Verify network connectivity to Zoho API
  - Ensure your Zoho account has active surveys
  - Check if API rate limits are being hit

### No surveys showing up
- **Solution**:
  - Verify you have surveys created in Zoho Survey
  - Check if surveys are published/active
  - Verify API permissions include survey read access

---

## Zoho Survey API Scopes Required

Make sure your OAuth application has these scopes:
- `ZohoSurvey.surveys.READ` - To list surveys
- `ZohoSurvey.responses.READ` - To read survey responses
- Or use: `ZohoSurvey.fullaccess.ALL` - Full access (for development)

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables only

2. **Rotate tokens regularly**
   - Refresh tokens can expire
   - Regenerate if compromised

3. **Use least privilege**
   - Only grant necessary scopes
   - Don't use full access in production if not needed

4. **Monitor API usage**
   - Check Zoho API dashboard for usage
   - Set up alerts for unusual activity

---

## Alternative: Zoho Survey Webhook (If API not available)

If Zoho Survey API is not accessible, you can use webhooks:

1. **Set up Webhook in Zoho Survey**
   - Go to Survey Settings → Integrations → Webhooks
   - Add webhook URL: `https://your-domain.com/api/zoho/webhook`
   - Configure to send survey data on completion

2. **Create webhook endpoint in server.js**
   ```javascript
   app.post('/api/zoho/webhook', (req, res) => {
     // Handle incoming survey data
     // Store in database or process
   });
   ```

---

## Support Resources

- **Zoho Survey API Docs**: https://www.zoho.com/survey/help/api/
- **Zoho Developer Console**: https://api-console.zoho.com/
- **Zoho Support**: https://help.zoho.com/

---

## Quick Checklist

- [ ] Created Zoho Developer account
- [ ] Created API client application
- [ ] Generated Client ID and Client Secret
- [ ] Generated Refresh Token
- [ ] Determined Zoho region
- [ ] Set environment variables
- [ ] Tested API endpoint
- [ ] Verified surveys appear in dropdown

---

**Note**: If you encounter any issues, check the browser console and server logs for detailed error messages.

