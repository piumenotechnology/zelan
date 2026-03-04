const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Compress an image file in-place.
 * Resizes to max 1200px width (preserving aspect ratio) and compresses quality.
 * @param {string} filePath - Path relative to project root, e.g. "uploads/images/abc.jpg"
 * @returns {Promise<void>}
 */
const compressImage = async (filePath) => {
    const fullPath = path.join(__dirname, '..', filePath);

    if (!fs.existsSync(fullPath)) return;

    const ext = path.extname(fullPath).toLowerCase();
    if (ext === '.gif') return;

    // Read file into buffer first to avoid Windows file locking issues
    const inputBuffer = await fs.promises.readFile(fullPath);

    let pipeline = sharp(inputBuffer).resize({ width: 1200, withoutEnlargement: true });

    if (ext === '.png') {
        pipeline = pipeline.png({ quality: 80 });
    } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 80 });
    } else {
        pipeline = pipeline.jpeg({ quality: 80 });
    }

    const output = await pipeline.toBuffer();
    await fs.promises.writeFile(fullPath, output);
};

module.exports = compressImage;
