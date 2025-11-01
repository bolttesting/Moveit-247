# Android APK App Icon Replacement Guide

## 📱 Location: `android/app/src/main/res/mipmap-*/`

Your Android app uses **adaptive icons** which require multiple icon files at different sizes.

## 📋 Required Icon Files

### Icon Types (Need all 3 for each density):
1. **`ic_launcher.png`** - Main square icon
2. **`ic_launcher_round.png`** - Round icon (for devices with round icon support)
3. **`ic_launcher_foreground.png`** - Foreground layer (your logo/M on transparent background)

### Required Densities (5 folders):
Replace icons in each of these folders:

| Folder | Icon Size | Purpose |
|--------|-----------|---------|
| `mipmap-mdpi/` | **48×48** px | Low density screens |
| `mipmap-hdpi/` | **72×72** px | Medium density screens |
| `mipmap-xhdpi/` | **96×96** px | High density screens |
| `mipmap-xxhdpi/` | **144×144** px | Extra high density screens |
| `mipmap-xxxhdpi/` | **192×192** px | Ultra high density screens |

## 🎨 Design Specifications

### Background Color: ✅ Already Updated
- **Color**: `#db692c` (orange)
- **Location**: `android/app/src/main/res/values/ic_launcher_background.xml`
- **Status**: ✅ Updated to your color

### Foreground Icon:
- **Content**: White "M" letter
- **Background**: **Transparent** (important!)
- **Shape**: Square (icon will be masked by Android)
- **Padding**: Leave ~20% padding around edges (Android will mask it)

### Full Icon (`ic_launcher.png` and `ic_launcher_round.png`):
- **Background**: `#db692c` (orange)
- **Content**: White "M" centered
- **Shape**: Square (for `ic_launcher.png`), will be automatically rounded (for `ic_launcher_round.png`)

## 📁 Exact File Paths

Replace these files (total: **15 files** - 3 types × 5 densities):

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48×48)
│   ├── ic_launcher_foreground.png (48×48, transparent)
│   └── ic_launcher_round.png (48×48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72×72)
│   ├── ic_launcher_foreground.png (72×72, transparent)
│   └── ic_launcher_round.png (72×72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96×96)
│   ├── ic_launcher_foreground.png (96×96, transparent)
│   └── ic_launcher_round.png (96×96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144×144)
│   ├── ic_launcher_foreground.png (144×144, transparent)
│   └── ic_launcher_round.png (144×144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192×192)
    ├── ic_launcher_foreground.png (192×192, transparent)
    └── ic_launcher_round.png (192×192)
```

## 🛠️ How to Create These Icons

### Option 1: Android Asset Studio (Recommended)
1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload your icon (or design with orange background #db692c and white "M")
3. Set:
   - **Background color**: `#db692c`
   - **Foreground**: White "M" on transparent
4. Download the ZIP
5. Extract and copy all files to the `mipmap-*/` folders

### Option 2: Manual Creation
1. Create your icon design (512×512px source)
2. Export at each size needed (48, 72, 96, 144, 192)
3. For `ic_launcher_foreground.png`:
   - Use **transparent background**
   - White "M" centered
   - Leave padding around edges (Android masks ~20% from edges)
4. For `ic_launcher.png` and `ic_launcher_round.png`:
   - Use orange background (#db692c)
   - White "M" centered

### Option 3: ImageMagick/Batch Tool
Use a script to resize from one 512×512 source image:
```bash
# Example: Create all sizes from source.png
convert source.png -resize 192x192 mipmap-xxxhdpi/ic_launcher.png
convert source.png -resize 144x144 mipmap-xxhdpi/ic_launcher.png
# ... and so on
```

## ✅ After Replacing Icons

1. **Rebuild the APK**:
   ```bash
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

2. **Or rebuild in Android Studio**:
   - Open project in Android Studio
   - Build > Rebuild Project
   - Build > Build Bundle(s) / APK(s) > Build APK(s)

3. **Test**:
   - Install APK on device
   - Check home screen icon appears correctly
   - Check app drawer icon

## 🎯 Quick Reference

- **Background Color**: `#db692c` ✅ (Already updated)
- **Foreground**: White "M" on transparent
- **Total Files**: 15 PNG files (3 types × 5 densities)
- **Location**: `android/app/src/main/res/mipmap-*/`
- **File Names**: Exact names must match (case-sensitive)

## 📝 Notes

- **Adaptive Icons**: Android 8.0+ uses adaptive icons. The foreground layer sits on top of the background color.
- **Safe Zone**: Keep your "M" centered and don't put important content near edges (Android masks edges)
- **Transparency**: `ic_launcher_foreground.png` **must** have transparent background
- **Round Icons**: `ic_launcher_round.png` can be the same as `ic_launcher.png` - Android will apply round mask automatically

