import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourceIcon = path.join(__dirname, 'public', 'iconpng.png');
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(sourceIcon)) {
  console.error(`Source icon not found at: ${sourceIcon}`);
  process.exit(1);
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Copy icon to the assets folder standard names for @capacitor/assets
const targets = [
  'icon.png',
  'icon-only.png',
  'icon-foreground.png',
  'logo.png'
];

for (const target of targets) {
  const dest = path.join(assetsDir, target);
  fs.copyFileSync(sourceIcon, dest);
  console.log(`✓ Copied icon to ${dest}`);
}

console.log('\nAssets prepared successfully! Now run:');
console.log('npx @capacitor/assets generate --android --assetPath assets\n');
