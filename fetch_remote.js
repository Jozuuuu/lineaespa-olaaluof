import fetch from 'node-fetch';
import fs from 'fs';

async function getImages() {
    try {
        const response = await fetch('https://aluoferta.com/');
        const text = await response.text();
        const regex = /https:\/\/aluoferta\.com\/wp-content\/uploads\/[^\s"'>]+\.(jpg|png|webp|jpeg)/g;
        const matches = text.match(regex);
        if (matches) {
            const unique = [...new Set(matches)];
            console.log(unique.join('\n'));
        } else {
            console.log("No matches found");
        }
    } catch (e) {
        console.error(e);
    }
}

getImages();
