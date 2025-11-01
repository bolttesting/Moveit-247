# Android App Icon Setup Instructions

## 📱 Adding the "Move it" Logo as Android App Icon

This guide will help you add your "Move it" logo as the Android app icon.

## Method 1: Automated Script (Recommended)

### Step 1: Prepare Your Logo
1. Get your "Move it" logo image (PNG format)
2. Ensure it has a transparent or white background
3. Recommended size: 1024x1024px or larger (square format)

### Step 2: Add Source Logo
1. Copy your logo image to the `android` folder
2. Rename it to `logo-source.png`
3. The file path should be: `android/logo-source.png`

### Step 3: Generate Icons
Run the automated script:
```bash
node android/generate-icons.js
```

The script will:
- ✅ Generate all required icon sizes automatically
- ✅ Create icons for all Android densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- ✅ Generate both square and round icon variants
- ✅ Place icons in the correct Android resource folders

### Step 4: Sync & Rebuild
```bash
# Sync Capacitor
npx cap sync android

# Rebuild Android app (if building APK)
cd android
./gradlew assembleDebug
```

## Method 2: Manual Setup (Using Android Asset Studio)

### Step 1: Prepare Your Logo
1. Ensure your logo is square (1024x1024px recommended)
2. PNG format with transparent or white background

### Step 2: Use Android Asset Studio
1. Visit: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload your "Move it" logo image
3. Configure settings:
   - **Foreground**: Your logo (centered)
   - **Background**: White (#FFFFFF) or transparent
   - **Legacy icon**: Enable for older Android versions
4. Click "Download" to get the icon pack ZIP

### Step 3: Extract and Copy
1. Extract the downloaded ZIP file
2. Copy all icon files to their respective folders:
   ```
   res/
   ├── mipmap-mdpi/
   │   ├── ic_launcher.png
   │   ├── ic_launcher_foreground.png
   │   └── ic_launcher_round.png
   ├── mipmap-hdpi/
   │   ├── ic_launcher.png
   │   ├── ic_launcher_foreground.png
   │   └── ic_launcher_round.png
   ├── mipmap-xhdpi/
   │   └── ... (same files)
   ├── mipmap-xxhdpi/
   │   └── ... (same files)
   └── mipmap-xxxhdpi/
       └── ... (same files)
   ```
3. Replace files in: `android/app/src/main/res/mipmap-*/`

### Step 4: Update Background (if needed)
If you want to change the adaptive icon background color, edit:
```
android/app/src/main/res/values/ic_launcher_background.xml
```

Change the `color` value to your desired background color:
```xml
<color name="ic_launcher_background">#FFFFFF</color>
```

### Step 5: Sync & Rebuild
```bash
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Method 3: Manual Image Resizing

If you prefer to create icons manually:

### Required Icon Sizes:
- **mdpi**: 48x48px
- **hdpi**: 72x72px
- **xhdpi**: 96x96px
- **xxhdpi**: 144x144px
- **xxxhdpi**: 192x192px

### Steps:
1. Resize your logo to each size above
2. Create 3 versions for each size:
   - `ic_launcher.png` (with white background)
   - `ic_launcher_foreground.png` (transparent background)
   - `ic_launcher_round.png` (with white background, same as launcher)
3. Save to: `android/app/src/main/res/mipmap-{density}/`

## 📋 Icon File Locations

After setup, your icons should be in:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png
├── mipmap-hdpi/
│   └── ... (same files)
├── mipmap-xhdpi/
│   └── ... (same files)
├── mipmap-xxhdpi/
│   └── ... (same files)
└── mipmap-xxxhdpi/
    └── ... (same files)
```

## ✅ Verification

After setup:
1. Open Android Studio
2. Navigate to: `app/src/main/res/mipmap-*/`
3. Verify all icon files are present
4. Build and run the app
5. Check the app icon on the device/emulator

## 🎨 Logo Recommendations

For best results:
- **Format**: PNG with transparency
- **Size**: Minimum 1024x1024px (square)
- **Background**: Transparent or solid color
- **Design**: Should be recognizable at small sizes (48px)
- **Colors**: Use high contrast for visibility

## 🔧 Troubleshooting

### Icons not updating?
1. Clear app data: `adb shell pm clear com.moveit247.portal`
2. Uninstall and reinstall the app
3. Clean build: `cd android && ./gradlew clean`

### Icons look blurry?
- Ensure you're using high-resolution source images
- Verify all density folders have correct sized icons

### Round icons not showing?
- Ensure `ic_launcher_round.png` exists in all density folders
- Check `AndroidManifest.xml` for round icon configuration

## 📱 Testing

After updating icons:
1. Build debug APK: `cd android && ./gradlew assembleDebug`
2. Install on device: `adb install app/build/outputs/apk/debug/app-debug.apk`
3. Check home screen for new icon

---

**Need help?** Check the Capacitor documentation: https://capacitorjs.com/docs/android

