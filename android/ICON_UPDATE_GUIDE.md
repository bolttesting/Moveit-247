# Android App Icon Update Guide

## When you receive the logo file:

1. **Create square icon**: Convert your logo to a square 1024x1024 PNG with white background
2. **Generate all sizes**: Use tools like Android Asset Studio or manually create:
   - `ic_launcher.png` and `ic_launcher_foreground.png` for each density:
     - `mipmap-mdpi/` - 48x48px
     - `mipmap-hdpi/` - 72x72px  
     - `mipmap-xhdpi/` - 96x96px
     - `mipmap-xxhdpi/` - 144x144px
     - `mipmap-xxxhdpi/` - 192x192px

3. **Update background color** in `values/ic_launcher_background.xml` (already set to white #FFFFFF)

4. **Replace files**: Copy the generated icons to:
   - `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`
   - `android/app/src/main/res/mipmap-*/ic_launcher_round.png` (same as ic_launcher for round icons)

5. **Rebuild APK**: Run `npx cap sync android && cd android && ./gradlew assembleDebug`

The current icon is the default Capacitor icon. Replace it with your MoveIt 24/7 logo once you have the square version ready.

