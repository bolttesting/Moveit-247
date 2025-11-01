/**
 * Android Icon Generator Script
 * 
 * This script generates Android app icons in all required sizes
 * from a single source logo image.
 * 
 * Usage:
 * 1. Place your logo image (PNG) in the android folder as "logo-source.png"
 * 2. Run: node android/generate-icons.mjs
 * 3. The script will generate all required icon sizes automatically
 * 
 * Requirements:
 * - Node.js
 * - sharp package (will be installed automatically)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes for each density
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Source logo file
const sourceLogo = path.join(__dirname, 'logo-source.png');
const outputDir = path.join(__dirname, 'app', 'src', 'main', 'res');

async function generateIcons() {
  try {
    // Check if source logo exists
    if (!fs.existsSync(sourceLogo)) {
      console.error('❌ Error: logo-source.png not found in android folder!');
      console.log('\n📝 Instructions:');
      console.log('1. Save your "Move it" logo as a PNG file');
      console.log('2. Rename it to "logo-source.png"');
      console.log('3. Place it in the android folder');
      console.log('4. Run this script again: node android/generate-icons.mjs');
      console.log('   Or use: npm run generate-icons');
      process.exit(1);
    }

    // Try to use sharp (modern, fast image processing)
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (e) {
      console.log('📦 Installing sharp package...');
      execSync('npm install sharp --save-dev', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      sharp = (await import('sharp')).default;
    }

    console.log('🎨 Generating Android app icons...\n');

    // Read source image
    const image = sharp(sourceLogo);
    const metadata = await image.metadata();
    console.log(`📐 Source image: ${metadata.width}x${metadata.height}px\n`);

    // Generate icons for each density
    for (const [folder, size] of Object.entries(iconSizes)) {
      const folderPath = path.join(outputDir, folder);
      
      // Ensure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      console.log(`✨ Generating ${folder} (${size}x${size}px)...`);

      // Generate ic_launcher.png (square icon with white background)
      await image
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFile(path.join(folderPath, 'ic_launcher.png'));

      // Generate ic_launcher_foreground.png (transparent background for adaptive icons)
      await image
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

      // Generate ic_launcher_round.png (same as launcher for round icons)
      await image
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFile(path.join(folderPath, 'ic_launcher_round.png'));
    }

    console.log('\n✅ Icon generation complete!');
    console.log('\n📱 Next steps:');
    console.log('1. Review the generated icons in android/app/src/main/res/mipmap-*/');
    console.log('2. Sync with Capacitor: npx cap sync android');
    console.log('3. Rebuild Android app: cd android && ./gradlew assembleDebug');
    console.log('\n🎉 Your "Move it" logo is now the app icon!');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    
    if (error.message.includes('sharp') || error.message.includes('Cannot find module')) {
      console.log('\n💡 Alternative: Use Android Asset Studio');
      console.log('Visit: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
      console.log('Upload your logo and download the generated icons.');
    }
    
    process.exit(1);
  }
}

// Run the script
generateIcons();

