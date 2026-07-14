const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const SYMPTOM_FILE = path.join(
    ROOT_DIR,
    'master-data',
    'master-symptom.csv'
);

const CONFIG_FILE = path.join(
    __dirname,
    'assessment-category-rules.json'
);

const OUTPUT_FILE = path.join(
    ROOT_DIR,
    'master-data',
    'master-assessment-symptom.csv'
);

function parseCSV(text) {

    const lines = text
        .trim()
        .split(/\r?\n/);

    const headers = lines
        .shift()
        .split(',')
        .map(function (header) {
            return header.trim();
        });

    return lines.map(function (line) {

        const values = line
            .split(',')
            .map(function (value) {
                return value.trim();
            });

        const row = {};

        headers.forEach(function (header, index) {
            row[header] = values[index] || '';
        });

        return row;
    });
}

function readCSV(filePath) {

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Missing file: ${filePath}`
        );
    }

    return parseCSV(
        fs.readFileSync(filePath, 'utf8')
    );
}

function isActive(row) {
    return String(row.Active || '')
        .trim()
        .toUpperCase() === 'TRUE';
}

function escapeCSV(value) {
    const text = String(value ?? '');

    if (
        text.includes(',') ||
        text.includes('"') ||
        text.includes('\n')
    ) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

function buildRows() {
    const symptoms = readCSV(SYMPTOM_FILE)
        .filter(isActive);

    const symptomByID = new Map(
        symptoms.map(function (symptom) {
            return [
                symptom.SymptomID,
                symptom
            ];
        })
    );

    const rules = JSON.parse(
        fs.readFileSync(CONFIG_FILE, 'utf8')
    );

    const rows = [];
    let mappingNumber = 1;

    Object.entries(rules).forEach(
        function ([categoryID, rule]) {

            let selectedSymptoms = [];

            if (rule.mode === 'list') {
                selectedSymptoms =
                    rule.symptoms.map(function (symptomID) {

                        const symptom =
                            symptomByID.get(symptomID);

                        if (!symptom) {
                            throw new Error(
                                `${categoryID}: unknown symptom ID "${symptomID}"`
                            );
                        }

                        return symptom;
                    });
            } else if (rule.mode === 'all') {
                selectedSymptoms = [...symptoms];
            } else if (
                rule.mode === 'excludeSections'
            ) {
                const excludedSectionIDs =
                    new Set(rule.sectionIDs || []);

                selectedSymptoms =
                    symptoms.filter(function (symptom) {
                        return !excludedSectionIDs.has(
                            symptom.SectionID
                        );
                    });
            } else {
                throw new Error(
                    `${categoryID}: unknown mode "${rule.mode}"`
                );
            }

            selectedSymptoms.sort(
                function (a, b) {

                    const sectionCompare =
                        String(a.SectionID)
                            .localeCompare(
                                String(b.SectionID)
                            );

                    if (sectionCompare !== 0) {
                        return sectionCompare;
                    }

                    return (
                        Number(a.DisplayOrder || 0) -
                        Number(b.DisplayOrder || 0)
                    );
                }
            );

            selectedSymptoms.forEach(
                function (symptom, index) {

                    rows.push({
                        AssessmentSymptomID:
                            `ASM-${String(mappingNumber)
                                .padStart(4, '0')}`,

                        CategoryID:
                            categoryID,

                        SymptomID:
                            symptom.SymptomID,

                        DisplayOrder:
                            (index + 1) * 10,

                        Active:
                            'TRUE'
                    });

                    mappingNumber += 1;
                }
            );
        }
    );

    return rows;
}

function writeCSV(rows) {
    const columns = [
        'AssessmentSymptomID',
        'CategoryID',
        'SymptomID',
        'DisplayOrder',
        'Active'
    ];

    const lines = [
        columns.join(',')
    ];

    rows.forEach(function (row) {
        lines.push(
            columns
                .map(function (column) {
                    return escapeCSV(row[column]);
                })
                .join(',')
        );
    });

    fs.writeFileSync(
        OUTPUT_FILE,
        `${lines.join('\n')}\n`,
        'utf8'
    );
}

const rows = buildRows();

writeCSV(rows);

console.log(
    `Generated ${rows.length} assessment-symptom mappings.`
);

console.log(
    `Output: ${OUTPUT_FILE}`
);