// scripts/copy-resources.js
// const fs = require("fs-extra");
import * as fs from "fs-extra";

async function copyResources() {
  try {
    await fs.copy("resource", "build/resource");
    console.log("Resources copied successfully!");
  } catch (err) {
    console.error("Error copying resources:", err);
  }
}

copyResources();
