## Android (Capacitor) App

This repo includes a Capacitor Android app wrapper that loads the hosted portal at `https://moveit-247-production.up.railway.app/`.

### Build locally

1. Install Android Studio + SDK (Java 17)
2. Install deps:
   - `npm ci`
3. Sync Capacitor:
   - `npx cap sync android`
4. Open `android/` in Android Studio or build via CLI:
   - `cd android && ./gradlew assembleDebug`
5. The debug APK will be at:
   - `android/app/build/outputs/apk/debug/app-debug.apk`

### Build via GitHub Actions

Every push to `main` builds a Debug APK. Check Actions tab → latest run → Artifacts → `Moveit247-debug-apk` to download.

# MoveIt 247 - Complete Management System

A comprehensive management system for moving and logistics companies, built with Node.js and vanilla JavaScript.

## 🌟 Features

### User Management
- **4 User Roles**: Admin, Supervisor, Team Leader, Staff
- **Role-based Access Control**: Different permissions for each role
- **Profile Management**: Update profile, change password, upload profile picture

### Job Management
- **Complete Job Lifecycle**: From assignment to completion
- **Job Status Tracking**: Real-time status updates with history
- **File Uploads**: Permits, item images, and documents
- **Custom Apartment Sizes**: Support for standard and custom sizes
- **Time-based Job Scheduling**: With automatic delayed job detection

### Team Leader Workflow
- ✅ Acknowledge job assignment
- ✅ Mark arrival at location
- ✅ Start job
- ✅ Update moving status
- ✅ Upload images for each status change
- ✅ Complete job with client signature and rating

### Reports & Analytics
- **Team Leader Performance**: Completion rates, ratings, job counts
- **Staff Performance**: Job assignments and completion tracking
- **Jobs Summary**: Status breakdown with percentages
- **Revenue Report**: Tips and completed jobs tracking
- **Export Options**: CSV and PDF download for all reports

### Additional Features
- 📱 **Fully Responsive**: Works on desktop, tablet, and mobile
- 📊 **Interactive Dashboard**: Real-time statistics and charts
- 🔔 **Notifications**: Job assignments and status updates
- 📝 **Job History**: Complete audit trail with timestamps
- ⭐ **Rating System**: 5-star client satisfaction ratings
- ✍️ **Digital Signatures**: Client sign-off on job completion
- 💰 **Tip Tracking**: Record and report on tip amounts
- 📦 **Box Collection**: Track collected boxes per job
- 🖼️ **Image Gallery**: View all uploaded images and documents
- 🔍 **Search & Filter**: Find jobs, staff, and reports easily
- 📄 **Data Export**: Download reports in CSV or PDF format

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download here](https://nodejs.org/))
- npm (comes with Node.js)

### Installation

#### Windows:
1. Extract the zip file to a folder
2. Double-click `deploy.bat`
3. Wait for installation to complete
4. Server will start automatically
5. Open browser to `http://localhost:4000`

#### Linux/Mac:
```bash
# Extract and navigate to folder
cd /path/to/moveit247

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

#### Manual Installation:
```bash
# Install dependencies
npm install

# Start server
npm start
```

## 🔐 Default Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the default password immediately after first login!

## 📱 Access Points

- **Local Machine**: `http://localhost:4000`
- **Same Network**: `http://YOUR_LOCAL_IP:4000`
- **Production**: `https://your-domain.com`

To find your local IP:
- Windows: Run `ipconfig` in Command Prompt
- Mac/Linux: Run `ifconfig` or `ip addr show` in Terminal

## 🎯 User Roles & Permissions

### Admin
- Full system access
- Manage all users (Supervisors, Team Leaders, Staff)
- Create and manage jobs
- View all reports
- Approve completed jobs
- Access job history

### Supervisor
- Manage Team Leaders and Staff
- Create and manage jobs
- Approve completed jobs
- View job history
- No access to reports (admin only)

### Team Leader
- View assigned jobs only
- Update job status with images
- Complete jobs with client signature
- View own job history
- Receive job assignment notifications

### Staff
- View assigned jobs only (read-only)
- Update own profile
- Cannot modify job status

## 📊 Application Structure

```
moveit247/
├── server.js              # Backend API server
├── index.html             # Frontend application
├── package.json           # Dependencies
├── db.json                # Database file
├── uploads/               # Uploaded files directory
├── deploy.sh              # Linux/Mac deployment script
├── deploy.bat             # Windows deployment script
├── DEPLOYMENT_GUIDE.md    # Detailed deployment instructions
└── README.md              # This file
```

## 🔧 Configuration

### Change Port (default: 4000)

Edit `server.js`:
```javascript
const PORT = 4000; // Change to your preferred port
```

### Environment Variables

Create a `.env` file:
```
PORT=4000
NODE_ENV=production
```

## 🛠️ Development

### Start Development Server
```bash
npm start
```

### Access Application
Open browser to `http://localhost:4000`

### Watch for Changes
The application does not have hot-reload by default. Restart the server after making changes:
```bash
# Stop server (Ctrl + C)
# Start again
npm start
```

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions including:
- VPS Deployment (DigitalOcean, AWS, etc.)
- Heroku Deployment
- Railway Deployment
- Nginx Configuration
- SSL Setup
- PM2 Process Management

### Quick Production Deployment

**Using PM2:**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name moveit247

# Save configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

## 🔒 Security Best Practices

1. **Change Default Password**: Immediately after first login
2. **Use HTTPS**: Always use SSL/TLS in production
3. **Regular Backups**: Backup `db.json` and `uploads/` folder daily
4. **Update Dependencies**: Keep Node.js and npm packages up to date
5. **Firewall**: Configure firewall to only allow necessary ports
6. **Access Control**: Use strong passwords for all accounts

## 💾 Backup & Restore

### Backup
```bash
# Backup database
cp db.json backups/db-backup-$(date +%Y%m%d).json

# Backup uploads
cp -r uploads backups/uploads-backup-$(date +%Y%m%d)/
```

### Restore
```bash
# Restore database
cp backups/db-backup-YYYYMMDD.json db.json

# Restore uploads
cp -r backups/uploads-backup-YYYYMMDD/ uploads/

# Restart server
pm2 restart moveit247
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

### Cannot Access from Other Devices
1. Check firewall settings
2. Ensure port 4000 is open
3. Verify you're using correct IP address
4. Make sure devices are on same network

### Images Not Loading
1. Check `uploads/` directory exists
2. Verify write permissions
3. Check file upload size limits
4. Review server logs for errors

### Database Errors
1. Check `db.json` file exists
2. Verify JSON is valid (use JSON validator)
3. Check file permissions
4. Restore from backup if corrupted

## 📈 Performance Tips

1. **Use PM2**: Automatic restarts, load balancing, monitoring
2. **Enable Compression**: Add gzip compression in production
3. **Optimize Images**: Compress uploaded images
4. **Clean Old Data**: Archive old jobs periodically
5. **Monitor Resources**: Use PM2 monitoring tools

## 🔄 Updates

To update the application:
1. Backup `db.json` and `uploads/` folder
2. Replace application files
3. Run `npm install` (if dependencies changed)
4. Restart server

## 📞 Support

For issues or questions:
1. Check this README and DEPLOYMENT_GUIDE.md
2. Review troubleshooting section
3. Check server logs: `pm2 logs moveit247`

## 🎨 Features by Section

### Dashboard
- Real-time statistics
- Job status charts
- Recent jobs list
- Quick actions
- Performance metrics

### Jobs
- Create new jobs
- Assign team leaders and staff
- Upload permits and images
- Track job status
- View job details
- Filter and search
- CSV/PDF export

### Job History
- Completed jobs list
- Client ratings
- Tip amounts
- Completion dates
- Detailed job views

### Pending Approval
- Review completed jobs
- View client signatures
- Check ratings and feedback
- Approve/reject jobs
- Export pending jobs

### Reports (Admin Only)
- Team Leader Performance
- Staff Performance
- Jobs Summary
- Revenue Report
- CSV/PDF export for all reports

### Profile
- Update personal information
- Change password
- Upload profile picture
- View account details

## 💻 Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: JSON file-based storage
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **File Upload**: Multer
- **ID Generation**: nanoid

## 📜 License

Copyright © 2025 MoveIt 247. All rights reserved.

## ✅ System Requirements

### Minimum:
- **CPU**: 1 core
- **RAM**: 512MB
- **Storage**: 1GB
- **Node.js**: 18.0.0+

### Recommended:
- **CPU**: 2+ cores
- **RAM**: 2GB+
- **Storage**: 5GB+
- **Node.js**: 20.0.0+

## 🎉 Getting Help

1. Read the documentation
2. Check troubleshooting section
3. Review deployment guide
4. Check server logs
5. Verify configuration

## 🚀 Ready to Go!

Your MoveIt 247 Management System is ready to use!

Run `npm start` and access at `http://localhost:4000`

**Default Login**: admin / admin123

**Happy Managing! 🚚📦**
#   M o v e i t - 2 4 7 
 
 #   M o v e i t - 2 4 7 
 
 #   M o v e i t - 2 4 7 
 
 