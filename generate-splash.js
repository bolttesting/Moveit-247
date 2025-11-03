import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sharp;
try {
    sharp = (await import('sharp')).default;
} catch (e) {
    console.error('Sharp is required. Install with: npm i -D sharp');
    process.exit(1);
}

const SOURCE_LOGO = path.join(__dirname, 'android', 'logo-source.png');
if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`Logo not found at ${SOURCE_LOGO}. Place your square logo there (>=1024x1024).`);
    process.exit(1);
}

// Brand colors
const BACKGROUND = { r: 219, g: 105, b: 44, alpha: 1 }; // #db692c

// Android splash targets (portrait/landscape)
const targets = [
    { folder: 'drawable-port-mdpi', width: 320, height: 480 },
    { folder: 'drawable-port-hdpi', width: 480, height: 800 },
    { folder: 'drawable-port-xhdpi', width: 720, height: 1280 },
    { folder: 'drawable-port-xxhdpi', width: 960, height: 1600 },
    { folder: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
    { folder: 'drawable-land-mdpi', width: 480, height: 320 },
    { folder: 'drawable-land-hdpi', width: 800, height: 480 },
    { folder: 'drawable-land-xhdpi', width: 1280, height: 720 },
    { folder: 'drawable-land-xxhdpi', width: 1600, height: 960 },
    { folder: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
];

const outRoot = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

console.log('🎬 Generating Android splash screens from logo...');

const logo = sharp(SOURCE_LOGO).png();
const logoMeta = await logo.metadata();
if (!logoMeta.width || !logoMeta.height) {
    console.error('Invalid logo image. Ensure it is a valid PNG/JPG.');
    process.exit(1);
}

for (const t of targets) {
    const outDir = path.join(outRoot, t.folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Base background
    const bg = await sharp({
        create: {
            width: t.width,
            height: t.height,
            channels: 4,
            background: BACKGROUND,
        },
    }).png().toBuffer();

    // Scale logo to ~40% of the shortest side
    const shortest = Math.min(t.width, t.height);
    const logoSize = Math.round(shortest * 0.4);
    const logoBuf = await logo.clone().resize(logoSize, logoSize, { fit: 'contain' }).toBuffer();

    // Composite centered
    const out = await sharp(bg)
        .composite([
            { input: logoBuf, gravity: 'center' },
        ])
        .png()
        .toBuffer();

    const outPath = path.join(outDir, 'splash.png');
    await fs.promises.writeFile(outPath, out);
    console.log(`   ✓ ${t.folder}/splash.png (${t.width}x${t.height})`);
}

console.log('✅ Splash images generated. Rebuild APK to see changes.');


