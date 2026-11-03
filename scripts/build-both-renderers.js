const fs = require('fs');
const path = require('path');

const spaPath = 'C:/Users/ATG study abroad/.gemini/antigravity/brain/097431c5-594d-4f27-be27-585a95233757/.user_uploaded/media_1793692122949_0934e472.html';
const ambrosPath = 'C:/Users/ATG study abroad/.gemini/antigravity/brain/097431c5-594d-4f27-be27-585a95233757/.user_uploaded/media_1793692111163_189459b9.html';

const spaOriginal = fs.readFileSync(spaPath, 'utf8');
const ambrosOriginal = fs.readFileSync(ambrosPath, 'utf8');

// 1. Create static standalone pages for direct preview & serving
const publicDir = path.join(process.cwd(), 'public');
const cardsDir = path.join(publicDir, 'cards');

const spaStaticDir = path.join(cardsDir, 'mahadev-spa');
if (!fs.existsSync(spaStaticDir)) fs.mkdirSync(spaStaticDir, { recursive: true });

const ambrosStaticDir = path.join(cardsDir, 'ambros-studio');
if (!fs.existsSync(ambrosStaticDir)) fs.mkdirSync(ambrosStaticDir, { recursive: true });

// Replace relative data urls or keep original for standalone
fs.writeFileSync(path.join(spaStaticDir, 'index.html'), spaOriginal);
fs.writeFileSync(path.join(ambrosStaticDir, 'index.html'), ambrosOriginal);
fs.writeFileSync(path.join(publicDir, 'mahadev-spa.html'), spaOriginal);
fs.writeFileSync(path.join(publicDir, 'mahadev-spa-centre.html'), spaOriginal);
fs.writeFileSync(path.join(publicDir, 'ambros-studio.html'), ambrosOriginal);

console.log('Saved static standalone files successfully.');

