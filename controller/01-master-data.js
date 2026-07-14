
/******************************************************************************
 * Environment Validation
 ******************************************************************************/

function validateEnvironment() {

    if (!CONFIG.masterJsonPath) {
        throw new Error(
            'window.NBHAS_MASTER_JSON_URL is missing.'
        );
    }

    if (typeof NBHASEngine !== 'function') {
        throw new Error(
            'NBHASEngine is not available. ' +
            'Confirm nbhas-engine.js loads before nbhas-assessment-v4.js.'
        );
    }

    const app = document.getElementById('nbhas-app');

    if (!app) {
        throw new Error(
            'The #nbhas-app container was not found.'
        );
    }
}

/******************************************************************************
 * Master Data
 ******************************************************************************/

async function loadMasterData() {

    console.log('Loading NBHAS master data...');

    const response = await fetch(
        CONFIG.masterJsonPath,
        {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store'
        }
    );

    if (!response.ok) {
        throw new Error(
            `Unable to load master data. HTTP ${response.status}`
        );
    }

    const masterData = await response.json();

//    validateMasterData(masterData);

    NBHAS.masterData = masterData;

    NBHAS.sections =
        Array.isArray(masterData.sections)
            ? masterData.sections
            : [];

    NBHAS.symptoms =
        Array.isArray(masterData.symptoms)
            ? masterData.symptoms
            : [];

    NBHAS.categories =
        Array.isArray(masterData.categories)
            ? masterData.categories
            : [];

    NBHAS.recommendations =
        Array.isArray(masterData.recommendations)
            ? masterData.recommendations
            : [];

    NBHAS.resources =
        Array.isArray(masterData.resources)
            ? masterData.resources
            : [];

    NBHAS.engine = new NBHASEngine(masterData);

    NBHAS.journey.activeSections = NBHAS.sections
        .filter(isActive)
        .sort(sortByDisplayOrder);

    console.log('✅ Master data loaded');
    console.log('✅ Engine created');
}

