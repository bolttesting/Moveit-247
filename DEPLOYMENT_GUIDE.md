# MoveIt 247 - Deployment Guide

## 📦 Package Contents

This package contains a complete Node.js backend and frontend application for the MoveIt 247 Management System.

### Files Included:
- `server.js` - Backend API server
- `index.html` - Frontend application
- `package.json` - Node.js dependencies
- `package-lock.json` - Locked dependency versions
- `db.json` - Database file (JSON-based storage)
- `uploads/` - Directory for uploaded files (images, documents)
- `README.md` - Project documentation
- `.gitignore` - Git ignore rules

## 🚀 Deployment Options

### Option 1: Deploy to a VPS (Recommended for Production)

#### Requirements:
- Ubuntu 20.04+ or similar Linux server
- Node.js 18+ installed
- Domain name (optional)
- SSL certificate (recommended)

#### Steps:

1. **Upload files to server**
```bash
# Using SCP
scp -r /path/to/backend/ user@your-server-ip:/var/www/moveit247/

# Or using SFTP/FTP client like FileZilla
```

2. **SSH into your server**
```bash
ssh user@your-server-ip
```

3. **Navigate to project directory**
```bash
cd /var/www/moveit247
```

4. **Install dependencies**
```bash
npm install
```

5. **Install PM2 (Process Manager)**
```bash
npm install -g pm2
```

6. **Start the application with PM2**
```bash
pm2 start server.js --name moveit247
pm2 save
pm2 startup
```

7. **Setup Nginx as reverse proxy**
```bash
sudo nano /etc/nginx/sites-available/moveit247
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Enable the site**
```bash
sudo ln -s /etc/nginx/sites-available/moveit247 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL with Let's Encrypt** (Optional but recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

10. **Access your application**
- Visit: `https://your-domain.com` (or `http://your-server-ip:4000`)
- Default login: `admin` / `admin123`

---

### Option 2: Deploy to Heroku

#### Steps:

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku app**
```bash
cd /path/to/backend
heroku create moveit247-app
```

4. **Create a Procfile**
```bash
echo "web: node server.js" > Procfile
```

5. **Update server.js port** (Add at the top)
```javascript
const PORT = process.env.PORT || 4000;
// Change app.listen(4000, ...) to app.listen(PORT, ...)
```

6. **Deploy to Heroku**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku master
```

7. **Open your app**
```bash
heroku open
```

---

### Option 3: Deploy to DigitalOcean App Platform

#### Steps:

1. **Create account** at digitalocean.com
2. **Create new App** from the control panel
3. **Connect your GitHub repository** or upload files
4. **Configure build settings:**
   - Build Command: `npm install`
   - Run Command: `node server.js`
5. **Deploy**

---

### Option 4: Deploy to Railway

#### Steps:

1. **Visit railway.app** and sign up
2. **Click "New Project"**
3. **Select "Deploy from GitHub"** or "Empty Project"
4. **Upload your files** or connect repository
5. **Railway will auto-detect Node.js** and deploy
6. **Get your deployment URL**

---

### Option 5: Local/LAN Deployment

#### For testing or local network use:

1. **Install Node.js** on your computer
2. **Navigate to project folder**
```bash
cd /path/to/backend
```

3. **Install dependencies**
```bash
npm install
```

4. **Start the server**
```bash
npm start
```

5. **Access the application**
   - On same computer: `http://localhost:4000`
   - From other devices on network: `http://YOUR_LOCAL_IP:4000`

6. **Find your local IP:**
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr show`

---

## 🔐 Security Recommendations

### Before Going Live:

1. **Change default admin password**
   - Login as admin
   - Go to Profile
   - Update password

2. **Update server.js for production**
```javascript
// Add this after the imports
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Add this before routes
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

Install security packages:
```bash
npm install helmet express-rate-limit
```

3. **Use environment variables**
```bash
# Create .env file
PORT=4000
NODE_ENV=production
```

4. **Enable HTTPS** (Always use SSL in production)

5. **Regular backups**
```bash
# Backup db.json daily
cp db.json backups/db-$(date +%Y%m%d).json
```

---

## 📊 Database Backup & Restore

### Backup
```bash
# Manual backup
cp db.json db.backup.json

# Automated daily backup (Linux/Mac)
crontab -e
# Add: 0 2 * * * cp /path/to/db.json /path/to/backups/db-$(date +\%Y\%m\%d).json
```

### Restore
```bash
cp db.backup.json db.json
# Restart server
pm2 restart moveit247
```

---

## 🔧 Troubleshooting

### Server won't start
```bash
# Check if port 4000 is in use
netstat -ano | findstr :4000  # Windows
lsof -i :4000  # Linux/Mac

# Kill process using port
# Windows: taskkill /PID <PID> /F
# Linux/Mac: kill -9 <PID>
```

### Cannot connect to server
- Check firewall settings
- Ensure port 4000 is open
- Check server logs: `pm2 logs moveit247`

### Images not loading
- Check `uploads/` directory permissions
- Ensure write access: `chmod 755 uploads/`

---

## 📱 Mobile Access

The application is fully responsive and works on:
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024+)
- ✅ Mobile (360x640+)

Access from mobile:
- Same WiFi: `http://YOUR_SERVER_IP:4000`
- Internet: `https://your-domain.com`

---

## 🎯 Default Credentials

### Admin Account:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after deployment!

---

## 📞 Support & Documentation

### Features:
- ✅ User Management (Admin, Supervisor, Team Leader, Staff)
- ✅ Job Management with Status Tracking
- ✅ File Upload (Images, Documents)
- ✅ Job History & Tracking
- ✅ Performance Reports
- ✅ Mobile Responsive Design
- ✅ Real-time Dashboard
- ✅ CSV & PDF Export
- ✅ Role-based Access Control

### Tech Stack:
- **Backend:** Node.js + Express.js
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Database:** JSON file-based storage
- **File Storage:** Local filesystem

---

## 🔄 Updates & Maintenance

### Update the application:
1. Backup `db.json` and `uploads/` folder
2. Replace files with new version
3. Run `npm install` (if dependencies changed)
4. Restart server: `pm2 restart moveit247`

### Monitor application:
```bash
# View logs
pm2 logs moveit247

# Monitor CPU/Memory
pm2 monit

# Check status
pm2 status
```

---

## 📜 License

Copyright © 2025 MoveIt 247. All rights reserved.

---

## ✅ Post-Deployment Checklist

- [ ] Application is accessible via URL
- [ ] Default admin password changed
- [ ] SSL certificate installed (for production)
- [ ] Firewall configured
- [ ] Backup system in place
- [ ] PM2 auto-restart configured
- [ ] Domain name configured (if applicable)
- [ ] Test all features (login, job creation, file upload)
- [ ] Test on mobile devices
- [ ] Configure email notifications (future enhancement)

---

## 🎉 Success!

Your MoveIt 247 Management System is now live!

Access it at: `http://your-domain.com` or `http://your-server-ip:4000`

**Happy Managing! 🚚📦**

