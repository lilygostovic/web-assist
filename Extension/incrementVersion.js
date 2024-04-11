const fs = require("fs");

// Read manifest.json
const manifest = require("./manifest.json");

// Increment the minor version
const [major, minor, patch] = manifest.version.split(".").map(Number);
const newVersion = `${major}.${minor + 1}.${patch}`;

// Update the manifest with the new version
manifest.version = newVersion;

// Write back to manifest.json
fs.writeFileSync("./manifest.json", JSON.stringify(manifest, null, 2));
