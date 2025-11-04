# 🚀 iOS App Quick Start

## ✅ What's Done

Your iOS app is now ready! Here's what has been set up:

1. ✅ **Capacitor iOS** package installed
2. ✅ **iOS project** initialized in `ios/` folder
3. ✅ **Web assets** copied to `www/` directory
4. ✅ **Configuration** files created
5. ✅ **Setup guide** created (`IOS_SETUP_GUIDE.md`)

## 📱 Next Steps (On macOS)

### 1. Install Prerequisites

```bash
# Install CocoaPods (if not installed)
sudo gem install cocoapods

# Install Xcode Command Line Tools (if needed)
xcode-select --install
```

### 2. Open in Xcode

```bash
# Option 1: Use npm script
npm run ios:open

# Option 2: Manual
npx cap open ios

# Option 3: Direct path
open ios/App/App.xcworkspace
```

**Important:** Open `App.xcworkspace` (NOT `.xcodeproj`)

### 3. Configure Signing

1. In Xcode, select **App** target
2. Go to **Signing & Capabilities** tab
3. Check **"Automatically manage signing"**
4. Select your **Team** (Apple Developer account)
5. Bundle Identifier: `com.moveit247.portal` (or change it)

### 4. Build and Run

#### For Simulator:
- Select a simulator (iPhone 14, iPhone 15, etc.)
- Click **Run** (▶️) or press `Cmd + R`

#### For Real Device:
- Connect iPhone via USB
- Select your device in Xcode
- Click **Run** (▶️)
- On iPhone: Settings → General → VPN & Device Management → Trust Developer

## 🔄 Development Workflow

### Making Changes:

1. **Edit your web code** (`index.html`, CSS, JS)
2. **Sync to iOS:**
   ```bash
   npm run ios:sync
   # or
   npx cap sync ios
   ```
3. **Reload in Xcode** - app will refresh automatically

### Adding Plugins:

```bash
# Install plugin
npm install @capacitor/camera

# Sync to iOS
npm run ios:sync
```

## 📦 Building for App Store

See detailed instructions in `IOS_SETUP_GUIDE.md`

Quick steps:
1. Update version in Xcode
2. Product → Archive
3. Distribute to App Store Connect
4. Submit for review

## ⚠️ Important Notes

### Windows Users:
- **You cannot build iOS apps on Windows**
- You need a **Mac** with **Xcode** to build iOS apps
- You can prepare the code on Windows, but building must be done on macOS
- **When you're on Mac:** Just open the project and tell me! I can help you run all the commands and set everything up automatically!

### Server Configuration:
- The app is configured to work with your server
- Update `capacitor.config.json` → `server.url` if needed
- For local development, you can use your local IP address

## 📚 Additional Resources

- **Full Guide:** See `IOS_SETUP_GUIDE.md` for complete instructions
- **Capacitor Docs:** https://capacitorjs.com/docs/ios
- **Xcode Help:** https://developer.apple.com/xcode/

## 🎉 You're Ready!

Your iOS app structure is complete. Open it in Xcode on a Mac to start building!

