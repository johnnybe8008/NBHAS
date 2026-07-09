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

    engine: null,

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
  
// ------------------------------------------------------------
// Bootstrap NBHAS Engine
// ------------------------------------------------------------

const masterData = await loadJSON('../dist/nbhas-master-data.json');

NBHAS.engine = new NBHASEngine(masterData);

console.log('✅ NBHAS Engine Ready');
console.log(NBHAS.engine);

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
async function loadJSON(filename) {

    console.log('Loading JSON:', filename);

    const response = await fetch(filename);

    if (!response.ok) {
        throw new Error('Unable to load JSON: ' + filename);
    }

    return await response.json();

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

    NBHAS.sections
        .filter(section => section.Active === 'TRUE')
        .sort((a, b) => Number(a.DisplayOrder) - Number(b.DisplayOrder))
        .forEach(section => {
            const sectionSymptoms = NBHAS.symptoms
                .filter(symptom => symptom.Active === 'TRUE')
                .filter(symptom => symptom.SectionID === section.SectionID)
                .sort((a, b) => Number(a.DisplayOrder) - Number(b.DisplayOrder));

            const sectionEl = document.createElement('section');
 sectionEl.innerHTML = `
  <div class="nbhas-section-header"
       style="display:flex;justify-content:flex-start;align-items:center;gap:24px;">
    <h2 style="margin:0;">${section.SectionName}</h2>
    <span id="${section.SectionID}-summary"
          style="font-size:1.6rem;font-weight:bold;color:#8b1f1f;">
      Answered: 0   Score: 0
    </span>
  </div>
`;
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
let answered = 0;
let score = 0;

function updateSectionTotals() {

    NBHAS.sections.forEach(section => {

        let answered = 0;
        let score = 0;

        NBHAS.symptoms
            .filter(symptom => symptom.SectionID === section.SectionID)
            .forEach(symptom => {

                const selected = document.querySelector(
                    `input[name="${symptom.SymptomID}"]:checked`
                );

                if (selected) {
                    answered++;
                    score += Number(selected.value);
                }

            });

        const span = document.getElementById(section.SectionID + '-summary');

        if (span) {
            span.textContent = `Answered: ${answered}   Score: ${score}`;
        }

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

    const answers = collectAssessmentAnswers();

    displayScores(answers.totalScore, answers.answeredCount);
    updateSectionTotals();

    if (NBHAS.engine) {

        const engineResults = NBHAS.engine.evaluate(
            answers.symptomAnswers
        );

        console.log("ENGINE RESULTS");
        console.log(engineResults);

        if (window.renderDashboard) {
            renderDashboard(engineResults, 'nbhas-results');
        }

        if (window.NBHASRenderer) {
            NBHASRenderer.render(engineResults);
        }

    }

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

function collectAssessmentAnswers() {

    const answers = {
        symptomAnswers: {},
        symptoms: [],
        totalScore: 0,
        answeredCount: 0,
        sectionScores: {}
    };

    NBHAS.sections.forEach(section => {

        answers.sectionScores[section.SectionID] = {
            sectionName: section.SectionName,
            answeredCount: 0,
            score: 0,
            symptoms: []
        };

    });

    NBHAS.symptoms.forEach(symptom => {

        const selected = document.querySelector(
            `input[name="${symptom.SymptomID}"]:checked`
        );

        if (!selected) return;

        const score = Number(selected.value);
        answers.symptomAnswers[symptom.SymptomID] = score;

        answers.symptoms.push({
            symptomID: symptom.SymptomID,
            symptomName: symptom.DisplayName,
            sectionID: symptom.SectionID,
            score: score
        });

        answers.totalScore += score;
        answers.answeredCount++;

        if (answers.sectionScores[symptom.SectionID]) {
            answers.sectionScores[symptom.SectionID].answeredCount++;
            answers.sectionScores[symptom.SectionID].score += score;
            answers.sectionScores[symptom.SectionID].symptoms.push({
                symptomID: symptom.SymptomID,
                symptomName: symptom.DisplayName,
                score: score
            });
        }

    });

    console.log('Collected assessment answers:', answers);

    return answers;
}
