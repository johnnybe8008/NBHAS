const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MASTER_DIR = path.join(ROOT, "master-data");
const DIST_DIR = path.join(ROOT, "dist");
const OUT_FILE = path.join(DIST_DIR, "nbhas-master-data.json");
const ID_COLUMNS = {
  categories: "CategoryID",
  sections: "SectionID",
  symptoms: "SymptomID",
  resources: "ResourceID",
  recommendations: "RecommendationID",
  rules: "RuleID"
};
const FILES = {
  categories: "master-category.csv",
  sections: "master-section.csv",
  symptoms: "master-symptom.csv",
  resources: "master-resource.csv",
  recommendations: "master-recommendation.csv",
  rules: "master-rule.csv"
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
    const idColumn = ID_COLUMNS[name];
    const id = row[idColumn];

    if (!id) {
      console.log(`${name} row ${index + 2}:`, row);
      throw new Error(`${name}: missing id/code/key on row ${index + 2}`);
    }

    if (seen.has(id)) {
      throw new Error(`${name}: duplicate id ${id}`);
    }

    seen.add(id);
  });
}
function buildLookup(rows, idColumn) {
  const lookup = new Set();

  rows.forEach(row => {
    lookup.add(row[idColumn]);
  });

  return lookup;
}

function validateBoolean(value, fieldName, rowId) {
  if (value !== "TRUE" && value !== "FALSE") {
    throw new Error(
      `${rowId}: ${fieldName} must be TRUE or FALSE (found "${value}")`
    );
  }
}

function validateNumber(value, fieldName, rowId) {
  if (isNaN(Number(value))) {
    throw new Error(
      `${rowId}: ${fieldName} must be numeric (found "${value}")`
    );
  }
}
function validateRules(data) {

  const symptoms = buildLookup(data.symptoms, "SymptomID");
  const categories = buildLookup(data.categories, "CategoryID");

  data.rules.forEach(rule => {

    validateBoolean(rule.Active, "Active", rule.RuleID);

    validateNumber(rule.ScoreValue, "ScoreValue", rule.RuleID);

    validateNumber(rule.Multiplier, "Multiplier", rule.RuleID);

if (rule.Operation !== "ADD") {
    throw new Error(
        `${rule.RuleID}: unsupported Operation "${rule.Operation}"`
    );
}

    if (!symptoms.has(rule.SymptomID)) {
      throw new Error(
        `${rule.RuleID}: unknown SymptomID "${rule.SymptomID}"`
      );
    }

    if (!categories.has(rule.CategoryID)) {
      throw new Error(
        `${rule.RuleID}: unknown CategoryID "${rule.CategoryID}"`
      );
    }

  });

}
function validateRelationships(data) {
  const sections = buildLookup(data.sections, "SectionID");
  const recommendations = buildLookup(data.recommendations, "RecommendationID");

  data.symptoms.forEach(symptom => {
    if (!sections.has(symptom.SectionID)) {
      throw new Error(
        `${symptom.SymptomID}: unknown SectionID "${symptom.SectionID}"`
      );
    }
  });

  data.categories.forEach(category => {
    if (category.RecommendationID && !recommendations.has(category.RecommendationID)) {
      throw new Error(
        `${category.CategoryID}: unknown RecommendationID "${category.RecommendationID}"`
      );
    }
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

  validateRules(data);
  validateRelationships(data);

  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));

  console.log(`Generated ${OUT_FILE}`);
}

build();
