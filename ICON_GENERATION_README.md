# Icon Generation Script

## 🎨 Automatic Icon Generation

This script generates all required icon sizes from your logo source image.

## 📋 Requirements

1. **Source Image**: Place your logo as `android/logo-source.png`
   - Format: PNG (preferred) or JPG
   - Size: 1024×1024px (square) recommended
   - Design: Your logo with white background (matching your brand)

2. **Install Dependencies**:
   ```bash
   npm install sharp --save-dev
   ```

## 🚀 Usage

### Step 1: Prepare Your Logo
1. Place your logo image in: `android/logo-source.png`
2. Ensure it's square (1024×1024px recommended)
3. Use white background matching your logo design

### Step 2: Install Sharp (if not already installed)
```bash
npm install sharp --save-dev
```

### Step 3: Generate Icons
```bash
npm run generate-icons
```

Or directly:
```bash
node generate-icons.js
```

## 📁 Generated Files

### Web Icons (Root Directory):
- ✅ `favicon-16x16.png` (16×16)
- ✅ `favicon-32x32.png` (32×32)
- ✅ `apple-touch-icon.png` (180×180)
- ✅ `favicon-192x192.png` (192×192)
- ✅ `favicon-512x512.png` (512×512)
- ✅ `favicon.svg` (updated)
- ⚠️ `favicon.ico` (generated as PNG - convert manually using online tool)

### Android Icons (5 densities × 3 types):
Generated in: `android/app/src/main/res/mipmap-*/`

- ✅ `ic_launcher.png` (main icon)
- ✅ `ic_launcher_foreground.png` (foreground layer)
- ✅ `ic_launcher_round.png` (round icon)

Densities:
- `mipmap-mdpi/` → 48×48px
- `mipmap-hdpi/` → 72×72px
- `mipmap-xhdpi/` → 96×96px
- `mipmap-xxhdpi/` → 144×144px
- `mipmap-xxxhdpi/` → 192×192px

## 🔧 How It Works

1. Loads source image from `android/logo-source.png`
2. Resizes to all required sizes
3. Generates web icons in root directory
4. Generates Android icons in mipmap folders
5. Updates `favicon.svg` with reference to source

## ⚠️ Notes

- **favicon.ico**: Generated as PNG format. Convert to ICO manually:
  - Use: https://convertio.co/png-ico/
  - Or: https://favicon.io/favicon-converter/
  
- **Android Background**: Already set to white (#FFFFFF) in `android/app/src/main/res/values/ic_launcher_background.xml`

- **Foreground Icons**: For `ic_launcher_foreground.png`, the script keeps transparency if your source has it

## ✅ After Generation

1. **For Web**:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+F5)
   - Test on different browsers

2. **For Android**:
   ```bash
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

3. **For favicon.ico**:
   - Convert `favicon.png` to `.ico` using online tool
   - Replace in root directory

## 🎯 Troubleshooting

### Error: "Sharp not installed"
```bash
npm install sharp --save-dev
```

### Error: "Source image not found"
- Make sure `android/logo-source.png` exists
- Check the file name is exactly `logo-source.png`
- Use a square image (recommended: 1024×1024px)

### Icons look wrong
- Ensure source image is square (1:1 aspect ratio)
- Check source image quality (use high-resolution)
- Verify white background matches your design

## 📝 Customization

Edit `generate-icons.js` to:
- Change background colors
- Adjust padding/sizing
- Modify output formats
- Add additional icon sizes

