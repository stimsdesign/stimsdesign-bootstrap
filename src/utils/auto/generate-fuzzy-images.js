import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// CONFIGURATION: Easily edit which directories to ignore when scanning for images.
// These are matched relative to src/assets/images/ at the root level.
const IGNORED_DIRS = [
    'fuzzy-image', // Ignore our own destination directory
    'icons',       // SVGs / raw icons don't need fuzzy loaders
    'logo',        // Brand logos are usually SVGs or small assets
    'sprites'      // Sprite sheets are SVGs
];

// Extensions of raster images we want to process
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

const imagesDir = path.resolve('src/assets/images');
const fuzzyDir = path.resolve('src/assets/images/fuzzy-image');

/**
 * Recursively scans directory for images, skipping ignored ones
 */
function scanDir(dir, relativePath = '') {
    const absolutePath = path.join(dir, relativePath);
    if (!fs.existsSync(absolutePath)) return;
    
    const files = fs.readdirSync(absolutePath, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory()) {
            // Check if directory is ignored (only apply top-level ignore check)
            if (relativePath === '' && IGNORED_DIRS.includes(file.name)) {
                continue;
            }
            scanDir(dir, path.join(relativePath, file.name));
        } else if (file.isFile()) {
            const ext = path.extname(file.name).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
                processImage(path.join(relativePath, file.name));
            }
        }
    }
}

/**
 * Resizes image based on orientation and writes it to the fuzzy-image directory
 */
async function processImage(relativeFilePath) {
    const sourcePath = path.join(imagesDir, relativeFilePath);
    
    // Construct target path under fuzzy-image/, preserving base folder structures
    // and changing file extension to .png
    const lastDot = relativeFilePath.lastIndexOf('.');
    const relativePngPath = (lastDot !== -1 ? relativeFilePath.substring(0, lastDot) : relativeFilePath) + '.png';
    const outputPath = path.join(fuzzyDir, relativePngPath);

    if (fs.existsSync(outputPath)) {
        // Placeholder already exists, skip
        return;
    }

    try {
        // Ensure output directory exists (supports nested folders in fuzzy-image)
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Read metadata to determine orientation
        const metadata = await sharp(sourcePath).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        let resizeOptions = {};
        if (width >= height) {
            // Landscape or Square: Target height 20px, keep aspect ratio
            resizeOptions = { height: 20 };
        } else {
            // Portrait: Target width 20px, keep aspect ratio
            resizeOptions = { width: 20 };
        }

        await sharp(sourcePath)
            .resize(resizeOptions)
            .png({ quality: 60, compressionLevel: 9 }) // Small compressed PNG
            .toFile(outputPath);

        console.log(`[Fuzzy Image Gen] Generated: ${relativePngPath} (original: ${width}x${height})`);
    } catch (err) {
        console.error(`[Fuzzy Image Gen] Error processing image ${relativeFilePath}:`, err);
    }
}

// Execute scanning
if (!fs.existsSync(imagesDir)) {
    console.error(`[Fuzzy Image Gen] Images directory not found at ${imagesDir}`);
    process.exit(1);
}

scanDir(imagesDir);
