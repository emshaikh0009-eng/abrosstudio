const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/ATG study abroad/.gemini/antigravity/brain/097431c5-594d-4f27-be27-585a95233757/.user_uploaded/media_1793692111163_189459b9.html';
const html = fs.readFileSync(srcPath, 'utf8');

const destDir = path.join(process.cwd(), 'public', 'assets');

const logoMatch = html.match(/src="data:image\/jpeg;base64,([^"]+)"/);
if (logoMatch) {
  const logoFile = path.join(destDir, 'ambros-crafted-hero.jpg');
  fs.writeFileSync(logoFile, Buffer.from(logoMatch[1], 'base64'));
  console.log('Saved ambros-crafted-hero.jpg, size:', fs.statSync(logoFile).size);
}

