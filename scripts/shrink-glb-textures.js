// One-off asset optimization: downsizes oversized embedded PNG textures in
// our GLB models. Operates on the raw GLB binary container directly (not via
// gltf-transform's texture pipeline, which crashes on this machine's sharp
// build with "colourspace: parameter space not set" on some of these images)
// so the untouched draco-compressed geometry bufferViews are preserved
// byte-for-byte -- only oversized image bufferViews are replaced.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const MAX_DIM = 1024;
const MODELS_DIR = path.join(__dirname, "..", "public", "models");
const FILES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "case-main.glb",
      "motherboard.glb",
      "cpu.glb",
      "cooler.glb",
      "ram.glb",
      "gpu.glb",
      "psu.glb",
      "ssd.glb",
      "fan-1.glb",
      "case-side-armour.glb",
    ];

function align4(n) {
  return (n + 3) & ~3;
}

async function shrinkFile(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("Not a GLB file");

  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));

  const binChunkStart = 20 + jsonLen;
  const binLen = buf.readUInt32LE(binChunkStart);
  const binStart = binChunkStart + 8;
  const oldBin = buf.slice(binStart, binStart + binLen);

  const images = json.images ?? [];
  const bufferViews = json.bufferViews ?? [];

  // Build the new BIN chunk. Non-image bufferViews are copied byte-for-byte
  // at a (possibly shifted) offset; image bufferViews above the size
  // threshold are replaced with a resized re-encode.
  const chunks = [];
  let cursor = 0;
  let shrunkCount = 0;
  let originalImageBytes = 0;
  let newImageBytes = 0;

  const imageBufferViewIndices = new Set(
    images.map((img) => img.bufferView).filter((i) => i !== undefined),
  );

  for (let i = 0; i < bufferViews.length; i++) {
    const bv = bufferViews[i];
    const offset = bv.byteOffset || 0;
    let data = oldBin.slice(offset, offset + bv.byteLength);

    if (imageBufferViewIndices.has(i) && data.length > 150 * 1024) {
      originalImageBytes += data.length;
      try {
        const resized = await sharp(data)
          .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
          .png({ compressionLevel: 9 })
          .toBuffer();
        if (resized.length < data.length) {
          data = resized;
          shrunkCount++;
        }
      } catch (err) {
        console.warn(`  ! texture resize failed for bufferView ${i}, keeping original: ${err.message}`);
      }
      newImageBytes += data.length;
    }

    const paddedLen = align4(data.length);
    const padded = Buffer.concat([data, Buffer.alloc(paddedLen - data.length)]);
    chunks.push(padded);

    bv.byteOffset = cursor;
    bv.byteLength = data.length;
    cursor += paddedLen;
  }

  const newBin = Buffer.concat(chunks, cursor);
  delete json.buffers[0].byteLength; // recomputed below
  json.buffers[0].byteLength = newBin.length;

  const newJsonStr = JSON.stringify(json);
  const jsonPadded = Buffer.concat([
    Buffer.from(newJsonStr, "utf8"),
    Buffer.alloc(align4(Buffer.byteLength(newJsonStr, "utf8")) - Buffer.byteLength(newJsonStr, "utf8"), 0x20),
  ]);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // "JSON"

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(newBin.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4); // "BIN\0"

  const totalLength = 12 + 8 + jsonPadded.length + 8 + newBin.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // "glTF"
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const out = Buffer.concat([header, jsonChunkHeader, jsonPadded, binChunkHeader, newBin]);

  return { out, shrunkCount, originalImageBytes, newImageBytes };
}

async function main() {
  for (const name of FILES) {
    const filePath = path.join(MODELS_DIR, name);
    const before = fs.statSync(filePath).size;
    const { out, shrunkCount, originalImageBytes, newImageBytes } = await shrinkFile(filePath);
    fs.writeFileSync(filePath, out);
    const after = out.length;
    console.log(
      `${name}: ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB ` +
        `(${shrunkCount} textures resized, ${(originalImageBytes / 1e6).toFixed(1)}MB -> ${(newImageBytes / 1e6).toFixed(1)}MB)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
