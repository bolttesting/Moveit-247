# 📱 iOS App Setup Guide - MoveIt 247

This guide will help you build and deploy the MoveIt 247 iOS app using Capacitor.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **macOS** (required for iOS development)
2. **Xcode** (latest version from Mac App Store)
3. **Xcode Command Line Tools**: 
   ```bash
   xcode-select --install
   ```
4. **CocoaPods** (iOS dependency manager):
   ```bash
   sudo gem install cocoapods
   ```
5. **Node.js** (v18 or higher)
6. **Apple Developer Account** (for App Store deployment)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Install npm dependencies
npm install

# Install iOS dependencies (CocoaPods)
cd ios/App
pod install
cd ../..
```

### Step 2: Open in Xcode

```bash
# Open the iOS project in Xcode
npx cap open ios
```

Or manually:
- Navigate to `ios/App/App.xcworkspace` (NOT `.xcodeproj`)
- Double-click to open in Xcode

### Step 3: Configure App Settings

1. **Select the App target** in Xcode
2. Go to **Signing & Capabilities** tab
3. **Select your Team** (Apple Developer account)
4. **Update Bundle Identifier** if needed (default: `com.moveit247.portal`)
5. **Set Deployment Target** to iOS 13.0 or higher

### Step 4: Configure App Icons and Splash Screen

#### App Icon:
1. In Xcode, select `App` target → `Assets.xcassets` → `AppIcon`
2. Drag and drop your app icons (all required sizes)
3. Or use the provided icon generator:
   ```bash
   npm run generate-icons
   ```

#### Splash Screen:
- Splash screen is configured in `capacitor.config.json`
- Default background color: `#667eea` (purple gradient)
- You can customize it in the Capacitor config

### Step 5: Build and Run

#### For Simulator:
1. Select a simulator (iPhone 14, iPhone 15, etc.)
2. Click **Run** (▶️) or press `Cmd + R`
3. The app will build and launch in the simulator

#### For Physical Device:
1. Connect your iPhone via USB
2. Trust the computer on your iPhone
3. Select your device in Xcode
4. Click **Run** (▶️)
5. On your iPhone: Settings → General → VPN & Device Management → Trust Developer

## 🔧 Development Workflow

### Making Changes to Web Code:

1. **Edit your web files** (`index.html`, CSS, JS)
2. **Sync changes to iOS**:
   ```bash
   npx cap sync ios
   ```
3. **Reload in Xcode** (the app will automatically refresh)

### Adding Capacitor Plugins:

```bash
# Install plugin
npm install @capacitor/camera

# Sync to iOS
npx cap sync ios
```

### Testing on Device:

1. Build and run from Xcode
2. The app will install on your connected device
3. For wireless debugging: Xcode → Window → Devices → Enable wireless

## 📦 Building for App Store

### Step 1: Update Version and Build Number

1. In Xcode, select `App` target
2. Go to **General** tab
3. Update **Version** (e.g., 1.0.0)
4. Update **Build** number (e.g., 1)

### Step 2: Archive the App

1. Select **Any iOS Device** or **Generic iOS Device** from device selector
2. Go to **Product** → **Archive**
3. Wait for archive to complete
4. **Organizer** window will open automatically

### Step 3: Distribute to App Store

1. In Organizer, click **Distribute App**
2. Choose **App Store Connect**
3. Select **Upload**
4. Follow the wizard to upload

### Step 4: Submit for Review

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Create a new version
4. Fill in app information:
   - Screenshots
   - Description
   - Keywords
   - Privacy Policy URL
   - Support URL
5. Submit for review

## 🎨 Customization

### App Name:
- Change in `capacitor.config.json`: `"appName": "MoveIt 247"`
- Also update in Xcode: `App` target → `Display Name`

### Bundle Identifier:
- Change in `capacitor.config.json`: `"appId": "com.moveit247.portal"`
- Also update in Xcode: `App` target → `Bundle Identifier`

### App Icon:
- Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Required sizes: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### Splash Screen:
- Edit `capacitor.config.json` → `plugins.SplashScreen`
- Or customize in Xcode: `Assets.xcassets` → `LaunchImage`

## 🔐 Required Capabilities

### Network:
- ✅ Automatically configured (allows HTTP/HTTPS)

### Camera (if needed):
1. In Xcode: `App` target → `Signing & Capabilities`
2. Click **+ Capability**
3. Add **Camera**

### Location (if needed):
1. Add **Location Services**
2. Update `Info.plist` with usage descriptions:
   - `NSLocationWhenInUseUsageDescription`
   - `NSLocationAlwaysUsageDescription`

### Notifications:
- Already configured via `@capacitor/local-notifications`

## 📱 Testing Checklist

Before submitting to App Store:

- [ ] App launches without errors
- [ ] Login works correctly
- [ ] All features functional
- [ ] UI is responsive on all iPhone sizes
- [ ] No console errors
- [ ] App icon displays correctly
- [ ] Splash screen shows properly
- [ ] App works offline (if applicable)
- [ ] Notifications work (if enabled)
- [ ] Camera/Photo access works (if used)
- [ ] Location services work (if used)

## 🐛 Troubleshooting

### Build Errors:

**"No such module 'Capacitor'"**
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

**"Code signing error"**
- Ensure you've selected a team in Signing & Capabilities
- Check Bundle Identifier matches your developer account

**"Module not found"**
```bash
# Clean build folder
cd ios/App
rm -rf build
pod install
cd ../..
npx cap sync ios
```

### Runtime Errors:

**"White screen"**
- Check if server URL is correct in `capacitor.config.json`
- Verify network connectivity
- Check browser console for errors

**"App crashes on launch"**
- Check Xcode console for crash logs
- Verify all required permissions are set
- Ensure minimum iOS version is supported

### CocoaPods Issues:

```bash
# Update CocoaPods
sudo gem install cocoapods

# Clear CocoaPods cache
pod cache clean --all

# Reinstall pods
cd ios/App
rm -rf Pods Podfile.lock
pod install
```

## 📚 Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor Community](https://capacitorjs.com/community)

## 🚀 Deployment Options

### Option 1: App Store (Recommended)
- Reach all iOS users
- Automatic updates
- Requires Apple Developer Program ($99/year)

### Option 2: TestFlight (Beta Testing)
- Free for up to 10,000 testers
- Great for internal testing
- Requires Apple Developer Program

### Option 3: Enterprise Distribution
- For internal company use
- Requires Apple Enterprise Program ($299/year)
- No App Store listing

### Option 4: Ad-Hoc Distribution
- Limited to 100 devices
- For testing purposes
- Requires Apple Developer Program

## 📞 Support

For issues or questions:
1. Check Capacitor documentation
2. Review Xcode console logs
3. Check iOS system logs
4. Contact development team

---

**Happy Building! 🎉**

