const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/ATG study abroad/.gemini/antigravity/brain/097431c5-594d-4f27-be27-585a95233757/.user_uploaded/media_1793692122949_0934e472.html';
const html = fs.readFileSync(srcPath, 'utf8');

const destDir = path.join(process.cwd(), 'public', 'assets', 'mahadev');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Hero bg image
const heroMatch = html.match(/url\(data:image\/jpeg;base64,([^)]+)\)/);
if (heroMatch) {
  const heroFile = path.join(destDir, 'hero-bg.jpg');
  fs.writeFileSync(heroFile, Buffer.from(heroMatch[1], 'base64'));
  console.log('Saved hero-bg.jpg, size:', fs.statSync(heroFile).size);
}

// 2. Gallery images
const regex = /<img src="data:image\/jpeg;base64,([^"]+)"/g;
let match;
let idx = 1;
while ((match = regex.exec(html)) !== null) {
  const fName = `gallery-${idx}.jpg`;
  const fPath = path.join(destDir, fName);
  fs.writeFileSync(fPath, Buffer.from(match[1], 'base64'));
  console.log(`Saved ${fName}, size:`, fs.statSync(fPath).size);
  idx++;
}

