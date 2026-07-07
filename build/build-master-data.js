const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "master-data");
const DIST_DIR = path.join(ROOT, "dist");
const OUT_FILE = path.join(DIST_DIR, "nbhas-master-data.json");

const FILES = {
  categories: "master-category.csv",
  sections: "master-section.csv",
  symptoms: "master-symptom.csv",
  resources: "master-resource.csv",
  recommendations: "master-recommendation.csv"
};

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => row[h] = values[i] || "");
    return row;
  });
}

function loadCSV(filename) {
  const filePath = path.join(MASTER_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filename}`);
  }

  return parseCSV(fs.readFileSync(filePath, "utf8"));
}

function validateIds(name, rows) {
  const seen = new Set();

  rows.forEach((row, index) => {
    const id = row.id || row.code || row.key;

    if (!id) {
      throw new Error(`${name}: missing id/code/key on row ${index + 2}`);
    }

    if (seen.has(id)) {
      throw new Error(`${name}: duplicate id ${id}`);
    }

    seen.add(id);
  });
}

function build() {
  const data = {
    meta: {
      project: "NBHAS",
      generated_at: new Date().toISOString(),
      version: "1.0.0"
    }
  };

  Object.entries(FILES).forEach(([key, file]) => {
    const rows = loadCSV(file);
    validateIds(key, rows);
    data[key] = rows;
  });

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));

  console.log(`Generated ${OUT_FILE}`);
}

build();
