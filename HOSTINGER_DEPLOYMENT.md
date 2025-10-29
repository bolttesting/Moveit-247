# 🚀 Hostinger Deployment Guide for MoveIt247

## ⚠️ **IMPORTANT: Hostinger Hosting Requirements**

**You CANNOT use regular Web Hosting!** This is a **Node.js application** and requires:

### **Option 1: Hostinger Node.js Hosting (Recommended)** ✅
- **Plan Needed:** VPS Hosting or Cloud Hosting
- **Why:** Your app uses Node.js server (Express.js)
- **Cost:** Starting from $4.99/month (VPS)

### **Option 2: Regular Hosting Workaround** ❌ (NOT RECOMMENDED)
- Regular shared hosting (public_html) only supports PHP/HTML
- Your Node.js app won't run there
- You'd need to convert everything to PHP (major rewrite)

---

## 📋 **Deployment Steps for Hostinger VPS/Cloud**

### **Step 1: Choose the Right Hosting Plan**

1. Go to **Hostinger.com**
2. Choose **VPS Hosting** or **Cloud Hosting**
3. Look for plans with:
   - Node.js support ✅
   - SSH access ✅
   - At least 2GB RAM ✅

---

### **Step 2: Access Your Server**

#### **Option A: Using Hostinger Panel (hPanel)**
1. Login to Hostinger
2. Go to **VPS** → **Settings**
3. Find **SSH Access** details:
   - IP Address
   - Port (usually 22)
   - Username
   - Password

#### **Option B: Using SSH Client**
```bash
# Windows (use PuTTY or PowerShell)
ssh root@your-server-ip

# Mac/Linux
ssh root@your-server-ip
```

---

### **Step 3: Prepare Your Server**

Once connected via SSH, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install PM2 (Process Manager to keep app running)
sudo npm install -g pm2

# Create app directory
mkdir -p /var/www/moveit247
cd /var/www/moveit247
```

---

### **Step 4: Upload Your Files**

#### **Method 1: Using FileZilla (Easiest for Windows)** ✅

1. **Download FileZilla Client** (free)
   - https://filezilla-project.org/

2. **Connect to your server:**
   - Host: `sftp://your-server-ip`
   - Username: `root` (or your SSH username)
   - Password: Your SSH password
   - Port: `22`

3. **Upload these files to `/var/www/moveit247`:**
   ```
   ✅ server.js
   ✅ package.json
   ✅ package-lock.json
   ✅ db.json (cleaned version)
   ✅ index.html
   ✅ uploads/ (folder - initially empty)
   ✅ README.md
   ✅ .gitignore (optional)
   ```

4. **DON'T upload:**
   ```
   ❌ node_modules/ (will be installed on server)
   ❌ deploy.bat / deploy.sh (local scripts)
   ❌ .git/ (if present)
   ```

#### **Method 2: Using Hostinger File Manager**

1. Login to **hPanel**
2. Go to **Files** → **File Manager**
3. Navigate to `/var/www/moveit247`
4. Click **Upload** and select your files
5. Upload all files except `node_modules`

#### **Method 3: Using SCP (Command Line)**

```bash
# From your local machine (Windows PowerShell)
scp -r C:\Users\ahmad\Downloads\backend/* root@your-server-ip:/var/www/moveit247/

# Don't copy node_modules
```

---

### **Step 5: Install Dependencies on Server**

SSH back into your server:

```bash
cd /var/www/moveit247

# Install all required packages
npm install

# This will install:
# - express
# - multer
# - nanoid
# - cors
```

---

### **Step 6: Configure Firewall & Ports**

```bash
# Allow HTTP (port 80)
sudo ufw allow 80/tcp

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp

# Allow your app port (4000)
sudo ufw allow 4000/tcp

# Enable firewall
sudo ufw enable
```

---

### **Step 7: Update Server Configuration**

Create a production configuration file:

```bash
nano /var/www/moveit247/server.js
```

Update the PORT to use environment variable:

```javascript
const PORT = process.env.PORT || 4000;
```

---

### **Step 8: Start Your Application**

#### **Option A: Using PM2 (Recommended)** ✅

```bash
cd /var/www/moveit247

# Start the app with PM2
pm2 start server.js --name moveit247

# Save PM2 configuration
pm2 save

# Set PM2 to start on server boot
pm2 startup
# (follow the command it gives you)

# Check status
pm2 status
pm2 logs moveit247
```

#### **Option B: Manual Start (Not Recommended)**

```bash
cd /var/www/moveit247
node server.js
# (This will stop when you close SSH)
```

---

### **Step 9: Setup Domain & Reverse Proxy**

#### **Configure Nginx (Recommended)**

1. Install Nginx:
```bash
sudo apt install nginx -y
```

2. Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/moveit247
```

3. Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/moveit247 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### **Step 10: Setup SSL Certificate (HTTPS)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts
# Choose option 2: Redirect HTTP to HTTPS
```

---

### **Step 11: Point Your Domain**

In **Hostinger DNS Settings**:

1. Go to **hPanel** → **Domains**
2. Click **Manage** on your domain
3. Go to **DNS / Name Servers**
4. Add/Update A Record:
   ```
   Type: A
   Name: @ (or your subdomain)
   Points to: Your VPS IP Address
   TTL: 14400
   ```

5. Wait 10-60 minutes for DNS propagation

---

## 🎯 **Quick Deployment Checklist**

- [ ] VPS/Cloud hosting purchased
- [ ] SSH access obtained
- [ ] Node.js installed on server
- [ ] Files uploaded via FileZilla/SCP
- [ ] `npm install` completed
- [ ] Firewall configured
- [ ] PM2 installed and app started
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Domain DNS updated
- [ ] Test: Visit `https://your-domain.com`

---

## 🔧 **Useful PM2 Commands**

```bash
# View logs
pm2 logs moveit247

# Restart app
pm2 restart moveit247

# Stop app
pm2 stop moveit247

# Delete app from PM2
pm2 delete moveit247

# Monitor CPU/Memory
pm2 monit

# List all apps
pm2 list
```

---

## 🚨 **Troubleshooting**

### **Problem: App not accessible**
```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs moveit247

# Check port
sudo netstat -tulpn | grep 4000
```

### **Problem: "Cannot GET /"**
- Make sure `index.html` is in the same directory as `server.js`
- Check file permissions: `chmod 644 index.html`

### **Problem: File upload errors**
```bash
# Create uploads directory
mkdir -p /var/www/moveit247/uploads

# Set permissions
chmod 755 /var/www/moveit247/uploads
```

### **Problem: Database not saving**
```bash
# Check file permissions
chmod 644 /var/www/moveit247/db.json

# Check if file exists
ls -la /var/www/moveit247/db.json
```

---

## 📊 **Performance Optimization**

Add to `server.js`:

```javascript
// Enable gzip compression
const compression = require('compression');
app.use(compression());

// Set cache headers
app.use(express.static('.', {
    maxAge: '1d',
    etag: true
}));
```

Install compression:
```bash
npm install compression
```

---

## 🔐 **Security Recommendations**

1. **Change default password in `db.json`**
   ```json
   "password": "admin123"  // ← Change this!
   ```

2. **Enable HTTPS only** (done via Certbot)

3. **Add rate limiting** to prevent abuse:
   ```bash
   npm install express-rate-limit
   ```

4. **Regular backups:**
   ```bash
   # Backup database
   cp /var/www/moveit247/db.json /var/www/moveit247/db.json.backup

   # Automate with cron
   crontab -e
   # Add: 0 2 * * * cp /var/www/moveit247/db.json /var/www/moveit247/db.json.backup.$(date +\%Y\%m\%d)
   ```

---

## 💰 **Cost Estimate**

| Item | Cost |
|------|------|
| Hostinger VPS (2GB) | $4.99/month |
| Domain (.com) | $9.99/year |
| SSL Certificate | **FREE** (Let's Encrypt) |
| **Total** | **~$5-6/month** |

---

## 📞 **Need Help?**

If you run into issues:
1. Check PM2 logs: `pm2 logs moveit247`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Contact Hostinger support (they can help with server setup)

---

## ✅ **Success Indicators**

Your deployment is successful when:
- ✅ You can access `https://your-domain.com`
- ✅ Login page appears
- ✅ You can login as admin
- ✅ All features work (jobs, tracking, etc.)
- ✅ PM2 shows status: `online`
- ✅ Location tracking works (HTTPS required!)

---

**🎉 Your MoveIt247 system is now live!**

