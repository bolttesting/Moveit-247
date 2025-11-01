import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to use sharp if available, otherwise use a fallback approach
let sharp;
try {
    sharp = (await import('sharp')).default;
} catch (e) {
    console.log('⚠️  Sharp not installed. Installing...');
    console.log('   Run: npm install sharp --save-dev');
    console.log('   Or use online tools: https://realfavicongenerator.net/');
    process.exit(1);
}

// Source image path
const SOURCE_IMAGE = path.join(__dirname, 'android', 'logo-source.png');
const OUTPUT_DIR = __dirname;

// Icon sizes configuration
const WEB_ICONS = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
];

const ANDROID_ICONS = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Android icon types
const ANDROID_ICON_TYPES = [
    'ic_launcher.png',
    'ic_launcher_foreground.png',
    'ic_launcher_round.png',
];

console.log('🎨 Generating icons from logo source...\n');

// Check if source image exists
if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found!');
    console.error(`   Expected at: ${SOURCE_IMAGE}`);
    console.error('\n   Please place your logo as: android/logo-source.png');
    console.error('   Recommended size: 1024×1024px (square)');
    process.exit(1);
}

try {
    // Load source image
    const sourceImage = sharp(SOURCE_IMAGE);
    const metadata = await sourceImage.metadata();
    
    console.log(`✅ Source image loaded: ${metadata.width}×${metadata.height}px\n`);

    // Generate web icons
    console.log('📱 Generating web icons...');
    for (const icon of WEB_ICONS) {
        const outputPath = path.join(OUTPUT_DIR, icon.name);
        await sourceImage
            .clone()
            .resize(icon.size, icon.size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
            })
            .png()
            .toFile(outputPath);
        console.log(`   ✓ ${icon.name} (${icon.size}×${icon.size})`);
    }

    // Generate Android icons
    console.log('\n🤖 Generating Android icons...');
    for (const androidIcon of ANDROID_ICONS) {
        const androidDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', androidIcon.folder);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(androidDir)) {
            fs.mkdirSync(androidDir, { recursive: true });
        }

        // Generate each icon type
        for (const iconType of ANDROID_ICON_TYPES) {
            const outputPath = path.join(androidDir, iconType);
            
            // For foreground, keep transparent background
            // For launcher icons, use white background
            const options = iconType.includes('foreground')
                ? { fit: 'contain' } // Transparent for foreground
                : { 
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 } // White for others
                };

            await sourceImage
                .clone()
                .resize(androidIcon.size, androidIcon.size, options)
                .png()
                .toFile(outputPath);
        }
        
        console.log(`   ✓ ${androidIcon.folder}/ (${androidIcon.size}×${androidIcon.size})`);
    }

    // Generate favicon.ico (using SVG conversion approach)
    console.log('\n📄 Generating favicon.ico...');
    const faviconPath = path.join(OUTPUT_DIR, 'favicon.ico');
    // Note: Sharp can't create ICO files directly, but we'll create a PNG
    // For proper ICO, use online tool or ImageMagick
    await sourceImage
        .clone()
        .resize(32, 32)
        .png()
        .toFile(faviconPath.replace('.ico', '.png'));
    console.log('   ✓ favicon.png (32×32) - For .ico format, use online converter');

    // Update favicon.svg (optional - create a simple SVG)
    console.log('\n✨ Updating favicon.svg...');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#FFFFFF"/>
  <image href="android/logo-source.png" width="80" height="80" x="10" y="10"/>
</svg>`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.svg'), svgContent);
    console.log('   ✓ favicon.svg updated');

    console.log('\n✅ All icons generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify icons look correct');
    console.log('   2. For favicon.ico, use: https://convertio.co/png-ico/');
    console.log('   3. Rebuild Android APK: npx cap sync android && cd android && ./gradlew assembleDebug');
    console.log('   4. Clear browser cache to see new web icons');

} catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
}

