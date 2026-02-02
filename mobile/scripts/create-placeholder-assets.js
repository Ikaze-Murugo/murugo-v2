#!/usr/bin/env node
/**
 * Creates minimal valid PNG placeholder assets for Expo.
 * Run: node scripts/create-placeholder-assets.js
 */
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets', 'images');

// Minimal 1x1 transparent PNG (valid PNG bytes)
const MINIMAL_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
]);

// For icon/splash/adaptive we need larger images; Expo recommends 1024x1024 for icon.
// Use the same minimal PNG - Expo will scale; for dev it just needs the file to exist.
const files = [
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png',
  'notification-icon.png',
];

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

files.forEach((file) => {
  const filePath = path.join(ASSETS_DIR, file);
  fs.writeFileSync(filePath, MINIMAL_PNG);
  console.log('Created:', filePath);
});

console.log('Placeholder assets created. Replace with real images before release.');
