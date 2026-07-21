// build-manifest.js
// Scans video/ and audio/ folders, generates media-manifest.json
// Run before deploy: node build-manifest.js

const fs = require('fs');
const path = require('path');

const videoDir = './video';
const audioDir = './audio';
const outputFile = './media-manifest.json';

const videoExts = ['.mp4', '.webm', '.mov'];
const audioExts = ['.mp3', '.mpa', '.ogg', '.wav', '.m4a'];

function scanDir(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => exts.some(e => f.toLowerCase().endsWith(e)))
    .map(f => path.join(dir, f).replace(/\\/g, '/'));
}

const videos = scanDir(videoDir, videoExts);
const audios = scanDir(audioDir, audioExts);
const manifest = [...videos, ...audios];

fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
console.log(`Generated ${outputFile} with ${videos.length} video(s) and ${audios.length} audio(s)`);