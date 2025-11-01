# Converting Your Logo to App Icon Guide

## 📱 Your Logo Elements
Based on your logo, you have:
- **White background**
- **Black "Move" text** (with prominent "M")
- **Orange moving truck graphic** with "it" inside
- **Orange horizontal line**
- **Tagline**: "Moving | Shipping | Storage"

## 🎯 App Icon Recommendations

For app icons, you need a **simplified version** that's recognizable at small sizes. Choose one of these approaches:

### Option 1: Orange Truck Icon (Recommended)
- **Background**: White
- **Main Element**: Orange moving truck graphic (the distinctive truck shape)
- **Best for**: Unique, recognizable icon

### Option 2: Stylized "M" with Truck
- **Background**: White or orange (#db692c)
- **Main Element**: Bold "M" from "Move" with truck accent
- **Best for**: Text-based branding

### Option 3: Combined "Move it" Truck
- **Background**: White
- **Main Element**: The orange truck with "it" inside (from your logo)
- **Best for**: Full brand recognition

## 🛠️ Step-by-Step Process

### Step 1: Prepare Your Source Image
1. Extract the truck graphic from your logo (remove tagline)
2. Or use just the "M" with orange truck accent
3. Create a **square version** (1024×1024px recommended)

### Step 2: Generate All Icon Sizes

#### For Web Icons (Root Directory)
Use an online tool like **RealFaviconGenerator**:
1. Go to: https://realfavicongenerator.net/
2. Upload your square icon (1024×1024px)
3. Download the generated package
4. Extract to root directory: `/backend/`

#### For Android Icons (APK)
Use **Android Asset Studio**:
1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload your square icon
3. Set foreground (your truck/M graphic)
4. Set background (white, matching your logo)
5. Download ZIP
6. Extract to: `android/app/src/main/res/mipmap-*/`

### Step 3: File Locations

**Web Icons** → Root directory (`/backend/`):
- `favicon.svg`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180×180)
- `favicon-192x192.png`
- `favicon-512x512.png`
- `favicon.ico`

**Android Icons** → `android/app/src/main/res/mipmap-*/`:
- `ic_launcher.png` (5 sizes: 48, 72, 96, 144, 192px)
- `ic_launcher_foreground.png` (5 sizes: 48, 72, 96, 144, 192px)
- `ic_launcher_round.png` (5 sizes: 48, 72, 96, 144, 192px)

## 🎨 Design Tips

1. **Keep it Simple**: Remove tagline text - it won't be readable at small sizes
2. **High Contrast**: Ensure the truck/M stands out clearly
3. **Padding**: Leave ~20% padding around edges (for Android adaptive icons)
4. **Square Format**: Always create square versions (1:1 aspect ratio)
5. **Transparent Background**: For foreground layers, use transparent backgrounds

## 📋 Quick Checklist

- [ ] Extract truck graphic or "M" from logo
- [ ] Create 1024×1024px square version
- [ ] Generate web icons (favicon, apple-touch-icon, etc.)
- [ ] Generate Android icons (all densities)
- [ ] Replace files in correct locations
- [ ] Update background color in Android (currently set to #db692c, change to white if needed)
- [ ] Test icons on device/emulator

## ⚠️ Important Notes

- **Background Color**: Your logo uses **white background**, but we previously set Android background to `#db692c`. You may want to change it back to white (`#FFFFFF`) to match your logo.
- **Adaptive Icons**: Android uses adaptive icons. The foreground layer (truck/M) sits on top of the background color.
- **File Names**: Use exact file names (case-sensitive)

## 🔄 After Icon Replacement

1. **For Web**: Clear browser cache to see new favicons
2. **For Android**: Rebuild APK:
   ```bash
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

