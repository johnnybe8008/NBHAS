/******************************************************************************
 *
 * NBHAS
 * Nature's Balance Hormone Assessment System
 *
 * Product Owner : John Boshoff
 *
 * Master Data is the single source of truth.
 *
 ******************************************************************************/

'use strict';



/******************************************************************************
 * Application Startup
 ******************************************************************************/

document.addEventListener('DOMContentLoaded', initializeNBHAS);

/******************************************************************************
 * Initialize NBHAS
 ******************************************************************************/

async function initializeNBHAS() {

    console.clear();

    console.log('=========================================');
    console.log(' NBHAS ' + NBHAS.version);
    console.log(" Nature's Balance Hormone Assessment System");
    console.log('=========================================');

    await loadMasterData();

}

/******************************************************************************
 * Load all Master Data
 ******************************************************************************/
const CONFIG = {
    masterDataPath: '../master-data/'
};

const NBHAS = {

    version: '0.1.0',

    masterDataPath: '../master-data/',

    sections: [],
    symptoms: [],
    categories: [],
    recommendations: [],
    resources: [],

    currentCategory: null,
    assessment: {}

};

async function loadMasterData() {

    console.log('Loading Master Data...');

    NBHAS.sections = parseCSV(await loadCSV(NBHAS.masterDataPath + 'master-section.csv'));
    NBHAS.symptoms = parseCSV(await loadCSV(NBHAS.masterDataPath + 'master-symptom.csv'));
    NBHAS.categories = parseCSV(await loadCSV(NBHAS.masterDataPath + 'master-category.csv'));
    NBHAS.recommendations = parseCSV(await loadCSV(NBHAS.masterDataPath + 'master-recommendation.csv'));
    NBHAS.resources = parseCSV(await loadCSV(NBHAS.masterDataPath + 'master-resource.csv'));

    console.log('Sections loaded:', NBHAS.sections.length);
    console.log('Symptoms loaded:', NBHAS.symptoms.length);
    console.log('Categories loaded:', NBHAS.categories.length);
    console.log('Recommendations loaded:', NBHAS.recommendations.length);
    console.log('Resources loaded:', NBHAS.resources.length);

    console.table(NBHAS.sections);
    renderAssessment();
    attachAssessmentHandlers();
    calculateScores();
}


/******************************************************************************
 * Load a CSV file as raw text
 ******************************************************************************/
async function loadCSV(filename) {

    console.log('Loading CSV:', filename);

    const response = await fetch(filename);

    if (!response.ok) {
        throw new Error('Unable to load CSV: ' + filename);
    }

    return await response.text();

}
function parseCSV(csvText) {

    const lines = csvText.trim().split(/\r?\n/);
    const headers = lines.shift().split(',');

    return lines.map(line => {
        const values = line.split(',');

        const row = {};

        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
        });

        return row;
    });

}

function renderAssessment() {
    const app = document.getElementById('nbhas-app');

    if (!app) {
        console.warn('NBHAS app container not found.');
        return;
    }

    app.innerHTML = '';

    NBHAS.sections
        .filter(section => section.Active === 'TRUE')
        .sort((a, b) => Number(a.DisplayOrder) - Number(b.DisplayOrder))
        .forEach(section => {
            const sectionSymptoms = NBHAS.symptoms
                .filter(symptom => symptom.Active === 'TRUE')
                .filter(symptom => symptom.SectionID === section.SectionID)
                .sort((a, b) => Number(a.DisplayOrder) - Number(b.DisplayOrder));

            const sectionEl = document.createElement('section');
            sectionEl.innerHTML = `<h2>${section.SectionName}</h2>`;

            sectionSymptoms.forEach(symptom => {
                sectionEl.innerHTML += `
                    <div>
                        <strong>${symptom.DisplayName}</strong>
                        <label><input type="radio" name="${symptom.SymptomID}" value="0"> None</label>
                        <label><input type="radio" name="${symptom.SymptomID}" value="1"> Mild</label>
                        <label><input type="radio" name="${symptom.SymptomID}" value="2"> Moderate</label>
                        <label><input type="radio" name="${symptom.SymptomID}" value="3"> Severe</label>
                    </div>
                `;
            });

            app.appendChild(sectionEl);
        });
}
/******************************************************************************
 * Attach assessment change handlers
 ******************************************************************************/
function attachAssessmentHandlers() {

    document.querySelectorAll('#nbhas-app input[type="radio"]').forEach(input => {
        input.addEventListener('change', calculateScores);
    });

}

/******************************************************************************
 * Calculate assessment scores
 ******************************************************************************/
function calculateScores() {

    let totalScore = 0;
    let answeredCount = 0;

    document.querySelectorAll('#nbhas-app input[type="radio"]:checked').forEach(input => {
        totalScore += Number(input.value);
        answeredCount++;
    });

    displayScores(totalScore, answeredCount);

}

/******************************************************************************
 * Display assessment scores
 ******************************************************************************/
function displayScores(totalScore, answeredCount) {

    const results = document.getElementById('nbhas-results');

    if (!results) return;

    results.innerHTML = `
        <h2>Assessment Summary</h2>
        <p><strong>Symptoms answered:</strong> ${answeredCount}</p>
        <p><strong>Total score:</strong> ${totalScore}</p>
    `;

}