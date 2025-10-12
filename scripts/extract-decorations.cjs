const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = '/Users/del/Downloads/New Piskel (27).png';
const outputDir = path.join(__dirname, '../public/decorations');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// The image is 16x24, so we'll extract 8x8 sprites
// That gives us 2 columns and 3 rows = 6 decorations
const SPRITE_SIZE = 8;
const SCALE_FACTOR = 4; // Upscale to 32x32 for better visibility
const COLS = 2;
const ROWS = 3;

const decorationNames = [
  'bow',      // was whale
  'sun',      // was scissors
  'whale',    // was globe
  'scissors', // was bow
  'globe',    // was sun
  null        // 6th sprite not used
];

async function extractSprites() {
  console.log('Reading input image...');
  const image = sharp(inputImage);
  const metadata = await image.metadata();

  console.log(`Image size: ${metadata.width}x${metadata.height}`);

  let index = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const left = col * SPRITE_SIZE;
      const top = row * SPRITE_SIZE;
      const name = decorationNames[index];

      if (name) {
        console.log(`Extracting sprite ${index + 1}: ${name} at (${left}, ${top})`);

        await sharp(inputImage)
          .extract({
            left: left,
            top: top,
            width: SPRITE_SIZE,
            height: SPRITE_SIZE
          })
          .resize(SPRITE_SIZE * SCALE_FACTOR, SPRITE_SIZE * SCALE_FACTOR, {
            kernel: 'nearest', // Use nearest neighbor to preserve pixel art style
          })
          .toFile(path.join(outputDir, `${name}.png`));

        console.log(`✓ Saved ${name}.png (${SPRITE_SIZE * SCALE_FACTOR}x${SPRITE_SIZE * SCALE_FACTOR})`);
      } else {
        console.log(`Skipping sprite ${index + 1} at (${left}, ${top})`);
      }
      index++;
    }
  }

  console.log(`\nSuccessfully extracted ${index} decoration sprites!`);
}

extractSprites().catch(console.error);
