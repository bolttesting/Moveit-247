# 🎨 Android App Icon Setup - Quick Guide

## Quick Start (Easiest Method)

1. **Get your logo ready**: Save your "Move it" logo as a PNG file
2. **Place it here**: Copy your logo to `android/logo-source.png`
3. **Run the script**: 
   ```bash
   npm run generate-icons
   ```
   Or:
   ```bash
   node android/generate-icons.js
   ```
4. **Sync with Capacitor**:
   ```bash
   npx cap sync android
   ```

That's it! Your logo will be the app icon.

## What the Script Does

The script automatically:
- ✅ Generates icons in all required sizes (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- ✅ Creates square, foreground, and round icon variants
- ✅ Places icons in the correct Android folders
- ✅ Maintains aspect ratio and adds white background

## Logo Requirements

- **Format**: PNG
- **Size**: 1024x1024px or larger (square recommended)
- **Background**: Transparent or white works best
- **File name**: `logo-source.png`
- **Location**: `android/logo-source.png`

## Alternative Methods

See `android/ICON_SETUP_INSTRUCTIONS.md` for:
- Manual setup instructions
- Android Asset Studio method
- Custom background colors
- Troubleshooting tips

---

**Note**: If `logo-source.png` is not found, the script will provide detailed instructions.

