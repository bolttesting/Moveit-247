# Zoho CRM Integration Setup Guide

This guide will help you integrate your MoveIt 247 survey forms with Zoho CRM.

## Overview

When a survey is completed in the MoveIt 247 system, it will automatically create a Lead in Zoho CRM with all the survey details. This includes:
- Client information (name, phone, email)
- Survey details (location, apartment size, dates)
- Packing list items and totals
- Comments and client instructions

## Prerequisites

1. A Zoho CRM account (sign up at https://www.zoho.com/crm/)
2. API Console access (https://api-console.zoho.com/)
3. Your Zoho region (com, eu, in, jp, or au)

## Step 1: Create a Zoho CRM API Application

1. Go to https://api-console.zoho.com/
2. Sign in with your Zoho account
3. Click on **"Add Client"**
4. Fill in the details:
   - **Client Name**: MoveIt 247 Integration
   - **Client Type**: Server-based Applications
   - **Description**: Survey form integration
   - **Authorized Redirect URIs**: `https://localhost` (or your domain)
5. Click **"Create"**
6. You'll receive:
   - **Client ID** (keep this secure)
   - **Client Secret** (keep this secure)
7. **Important**: Note down both the Client ID and Client Secret

## Step 2: Generate Refresh Token

### Method 1: Using Zoho's Self Client (Recommended)

1. In your API Console, go to your application
2. Click on **"Generate Token"** or **"Self Client"**
3. Select the following scopes:
   - `ZohoCRM.modules.leads.ALL`
   - `ZohoCRM.modules.contacts.ALL`
   - `ZohoCRM.modules.notes.ALL`
   - `ZohoCRM.settings.ALL`
4. Click **"Generate"**
5. Copy the **Refresh Token**

### Method 2: Manual Authorization (Alternative)

1. Construct this URL (replace placeholders):
```
https://accounts.zoho.{region}/oauth/v2/auth?scope=ZohoCRM.modules.leads.ALL,ZohoCRM.modules.contacts.ALL&client_id={client_id}&response_type=code&access_type=offline&redirect_uri={redirect_uri}
```

2. Open this URL in a browser
3. Log in and authorize
4. You'll be redirected with a code in the URL
5. Exchange the code for a refresh token using:

```bash
curl https://accounts.zoho.{region}/oauth/v2/token?grant_type=authorization_code&client_id={client_id}&client_secret={client_secret}&redirect_uri={redirect_uri}&code={code}
```

6. Save the **refresh_token** from the response

## Step 3: Get Your Zoho Org ID (Optional)

1. Log in to Zoho CRM
2. Go to **Settings** (gear icon)
3. Click on **Developer Space** → **API Details**
4. Copy your **Organization ID** (if you see it)

## Step 4: Configure Environment Variables

Create a `.env` file in your project root (copy from `.env.example` if it exists):

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Zoho CRM Integration
ZOHO_CLIENT_ID=your_client_id_from_step_1
ZOHO_CLIENT_SECRET=your_client_secret_from_step_1
ZOHO_REFRESH_TOKEN=your_refresh_token_from_step_2
ZOHO_REGION=com
ZOHO_API_VERSION=v2
ZOHO_ORG_ID=your_org_id_from_step_3
```

### Region Codes

- `com` - United States (default)
- `eu` - Europe
- `in` - India
- `jp` - Japan
- `au` - Australia

## Step 5: Restart Your Server

```bash
# Stop the server (Ctrl + C)
# Start again with environment variables
npm start

# Or use the dev command which loads .env automatically
npm run dev
```

## Step 6: Test the Integration

1. Create a new survey in the MoveIt 247 system
2. Fill in the survey details
3. Complete the survey with packing list information
4. Check your Zoho CRM **Leads** module
5. You should see a new lead with all the survey details

## Troubleshooting

### "Zoho CRM not configured" Warning

This means your environment variables aren't set. Check that:
- Your `.env` file exists in the project root
- You're using `npm run dev` or have loaded the `.env` file manually
- All Zoho variables have valid values

**Note**: Node.js 20.6+ supports `--env-file` flag used in `npm run dev`. If you're using Node.js 18.x, you may need to install `dotenv` package:
```bash
npm install dotenv
```

Alternatively, on older Node versions, you can manually set environment variables before starting:
```bash
# Linux/Mac
export ZOHO_CLIENT_ID=your_client_id
export ZOHO_CLIENT_SECRET=your_client_secret
export ZOHO_REFRESH_TOKEN=your_refresh_token
npm start

# Windows PowerShell
$env:ZOHO_CLIENT_ID="your_client_id"
$env:ZOHO_CLIENT_SECRET="your_client_secret"
$env:ZOHO_REFRESH_TOKEN="your_refresh_token"
npm start

# Windows CMD
set ZOHO_CLIENT_ID=your_client_id
set ZOHO_CLIENT_SECRET=your_client_secret
set ZOHO_REFRESH_TOKEN=your_refresh_token
npm start
```

### "Auth failed" Error

1. Verify your refresh token is correct
2. Check that your Client ID and Client Secret are correct
3. Ensure your refresh token hasn't expired (generate a new one if needed)

### "API error" Message

1. Check your Zoho region is correct
2. Verify API permissions in Zoho CRM settings
3. Make sure your application is enabled in Zoho
4. Check Zoho CRM API limits

### Survey Submits But No Lead Created

1. Check server logs for detailed error messages
2. Verify API scopes were correctly set
3. Test your Zoho credentials with curl or Postman
4. Check if there are any duplicate lead prevention rules in Zoho

## Testing Manually

You can test the Zoho integration manually using curl:

```bash
# First, get an access token
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=refresh_token"

# Then use the access token to create a test lead
curl -X POST "https://www.zohoapis.com/crm/v2/Leads" \
  -H "Authorization: Zoho-oauthtoken ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "Last_Name": "Test Lead",
      "Mobile": "1234567890",
      "Email": "test@example.com"
    }]
  }'
```

## Customizing the Integration

### Adding Custom Fields

Edit the `leadData` object in `server.js` (around line 75):

```javascript
const leadData = {
  Last_Name: packingList?.personName || survey.clientName || 'Survey Lead',
  Mobile: packingList?.mobile || survey.clientNumber || '',
  Email: packingList?.email || '',
  // Add your custom fields here
  Custom_Field_1: survey.clientNumber,
  Custom_Field_2: survey.location,
};
```

### Creating Contacts Instead of Leads

To create a Contact instead of a Lead, change line 118 in `server.js`:

```javascript
// From:
const zohoApiUrl = `https://www.zohoapis.${ZOHO_REGION}/crm/${ZOHO_API_VERSION}/Leads`;

// To:
const zohoApiUrl = `https://www.zohoapis.${ZOHO_REGION}/crm/${ZOHO_API_VERSION}/Contacts`;
```

### Creating Deals Along with Leads

You can enhance the integration to automatically create a Deal when a survey is completed with pricing information. Add this after creating the lead:

```javascript
if (packingList && packingList.amount) {
  const dealData = {
    Deal_Name: `Deal - ${leadData.Last_Name}`,
    Amount: packingList.amount,
    Stage: 'Qualification',
    Type: packingList.serviceTypes[0] || 'Local',
  };
  // Create deal and link to lead...
}
```

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. Keep your Client Secret and Refresh Token secure
3. Use environment variables in production (never hardcode)
4. Rotate your refresh token periodically
5. Review Zoho CRM audit logs regularly

## API Limits

Zoho CRM has rate limits:
- Standard Plan: 50,000 API calls per day
- Professional Plan: 100,000 API calls per day
- Enterprise Plan: Unlimited

Monitor your usage in Zoho's API Console.

## Support

For issues:
1. Check Zoho's API documentation: https://www.zoho.com/crm/developer/docs/api/
2. Review Zoho's API status page: https://status.zoho.com/
3. Check server logs for detailed error messages
4. Contact Zoho support for API-specific issues

## Next Steps

Once integrated, you can:
1. Set up automated workflows in Zoho CRM
2. Create custom reports with survey data
3. Sync survey responses with other Zoho products
4. Set up email notifications for new leads
5. Create custom dashboards in Zoho Analytics

Happy integrating! 🚀
