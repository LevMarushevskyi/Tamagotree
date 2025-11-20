const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = '/Users/del/Downloads/New Piskel (27).png';
const outputDir = path.join(__dirname, '../public/decorations');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const SPRITE_SIZE = 8;
const SCALE_FACTOR = 4;
const COLS = 2;
const ROWS = 3;

const decorationNames = [
  'bow',
  'sun',
  'whale',
  'scissors',
  'globe',
  null
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
            kernel: 'nearest',
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
