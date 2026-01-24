import fs from 'fs';
const content = fs.readFileSync('home.html', 'utf8');
const regex = /https:\/\/aluoferta\.com\/wp-content\/uploads\/[^\s"'>]+\.(jpg|png|webp|jpeg)/g;
const matches = content.match(regex);
if (matches) {
    const uniqueMatches = [...new Set(matches)];
    console.log(uniqueMatches.join('\n'));
} else {
    console.log("No images found");
}
