/******************************************************************************
 *
 * NBHAS
 * Nature's Balance Hormone Assessment System
 *
 * Phase 4A Controller
 * Assessment Journey
 *
 ******************************************************************************/

'use strict';

(function () {

    /**
     * Prevent the controller from loading more than once.
     */
    if (window.NBHAS_CONTROLLER_LOADED) {
        console.warn('NBHAS controller is already loaded.');
        return;
    }

    window.NBHAS_CONTROLLER_LOADED = true;

    /**
     * Single NBHAS application object.
     */
    const NBHAS = window.NBHAS = window.NBHAS || {};

    Object.assign(NBHAS, {
        version: '4.0.0',

        masterData: null,
        engine: null,

        sections: [],
        symptoms: [],
        categories: [],
        recommendations: [],
        resources: [],

        selectedCategoryGroup: null,
        selectedAssessmentCategory: null,

        journey: {
            screen: 'category-group',
            currentSectionIndex: 0,
            activeSections: [],
            answers: {}
        },

        state: {
            initialized: false,
            loading: false,
            assessmentRendered: false,
            resultsRendered: false,
            handlersAttached: false
        }
    });

    const CONFIG = {
        masterJsonPath: window.NBHAS_MASTER_JSON_URL,
        analysisDelay: 800
    };

    console.log('🚀 NBHAS Phase 4A controller loaded');
    console.log('NBHAS JSON URL:', CONFIG.masterJsonPath);

    /**
     * Start after the page DOM is ready.
     */
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initializeNBHAS
        );
    } else {
        initializeNBHAS();
    }

    /**
     * Main application startup.
     */
    async function initializeNBHAS() {

        if (
            NBHAS.state.initialized ||
            NBHAS.state.loading
        ) {
            return;
        }

        NBHAS.state.loading = true;

        console.log('initializeNBHAS called');

        try {
            validateEnvironment();

            await loadMasterData();

            prepareJourney();

            NBHAS.state.initialized = true;

            console.log('✅ NBHAS initialization complete');
            console.log('Sections:', NBHAS.sections.length);
            console.log('Symptoms:', NBHAS.symptoms.length);
            console.log('Categories:', NBHAS.categories.length);
            console.log(
                'Recommendations:',
                NBHAS.recommendations.length
            );
            console.log('Resources:', NBHAS.resources.length);

            window.dispatchEvent(
                new CustomEvent('nbhas:ready', {
                    detail: {
                        version: NBHAS.version,
                        masterData: NBHAS.masterData
                    }
                })
            );

        } catch (error) {
            console.error(
                '❌ NBHAS initialization failed:',
                error
            );

            showInitializationError(
                'The hormone assessment could not be loaded. ' +
                'Please refresh the page and try again.'
            );

        } finally {
            NBHAS.state.loading = false;
        }
    }

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

    validateMasterData(masterData);

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

/******************************************************************************
 * Journey Setup and State
 ******************************************************************************/

function prepareJourney() {

    const options = document.getElementById(
        'nb-assessment-options'
    );

    if (!options) {
        console.warn(
            'nb-assessment-options not found.'
        );
        return;
    }

    if (
        options.dataset.nbhasReady ===
        'true'
    ) {
        return;
    }

    options.dataset.nbhasReady = 'true';

    options.addEventListener(
        'click',
        handleCategoryGroupClick
    );

    console.log('✅ Journey ready');
}

/**
 * Handle the first three category-group cards already
 * rendered by the Shopify page.
 */
function handleCategoryGroupClick(event) {

    const card = event.target.closest(
        '[data-assessment-category]'
    );

    if (!card) {
        return;
    }

    event.preventDefault();

    const categoryGroup = String(
        card.dataset.assessmentCategory || ''
    ).trim();

    if (!categoryGroup) {
        console.warn(
            'Selected group has no category value.'
        );
        return;
    }

    NBHAS.selectedCategoryGroup =
        categoryGroup;

    NBHAS.selectedAssessmentCategory =
        null;

    NBHAS.journey.currentSectionIndex = 0;
    NBHAS.journey.answers = {};

    showAssessmentCategoryScreen();
}

/**
 * Display the main application container and hide
 * the original category-group choices.
 */
function enterJourney() {

    const options = document.getElementById(
        'nb-assessment-options'
    );

    const app = document.getElementById(
        'nbhas-app'
    );

    if (options) {
        options.style.display = 'none';
    }

    if (app) {
        app.style.display = 'block';
    }
}

/**
 * Return to the original category-group choices.
 */
function returnToCategoryGroups() {

    const options = document.getElementById(
        'nb-assessment-options'
    );

    const app = document.getElementById(
        'nbhas-app'
    );

    NBHAS.selectedCategoryGroup = null;
    NBHAS.selectedAssessmentCategory = null;

    NBHAS.journey.screen =
        'category-group';

    NBHAS.journey.currentSectionIndex = 0;
    NBHAS.journey.answers = {};

    if (app) {
        app.innerHTML = '';
        app.style.display = 'none';
    }

    if (options) {
        options.style.display = '';

        options.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Move to a specific assessment section.
 */
function goToSection(sectionIndex) {

    const maxIndex =
        NBHAS.journey.activeSections.length - 1;

    const safeIndex = Math.max(
        0,
        Math.min(sectionIndex, maxIndex)
    );

    NBHAS.journey.currentSectionIndex =
        safeIndex;

    NBHAS.journey.screen = 'section';

    renderSection(safeIndex);
}

/**
 * Move to the previous journey screen.
 */
function goPrevious() {

    const currentIndex =
        NBHAS.journey.currentSectionIndex;

    if (currentIndex > 0) {
        goToSection(currentIndex - 1);
        return;
    }

    showAssessmentCategoryScreen();
}

/**
 * Move to the next section or results review.
 */
function goNext() {

    saveVisibleSectionAnswers();

    const currentIndex =
        NBHAS.journey.currentSectionIndex;

    const lastIndex =
        NBHAS.journey.activeSections.length - 1;

    if (currentIndex < lastIndex) {
        goToSection(currentIndex + 1);
        return;
    }

    showResultsReadyScreen();
}

/******************************************************************************
 * Progress Bar and Milestones
 ******************************************************************************/

/**
 * Build the journey progress indicator from section data.
 */
function buildJourneyProgress(currentSectionIndex, showResultsMilestone) {

    const sections = NBHAS.journey.activeSections;

    if (!sections.length) {
        return '';
    }

    const completedThrough = showResultsMilestone
        ? sections.length
        : currentSectionIndex;

    const progressPercent = showResultsMilestone
        ? 100
        : ((currentSectionIndex + 1) / sections.length) * 100;

    const milestoneHTML = sections
        .map(function (section, index) {

            const position =
                ((index + 1) / (sections.length + 1)) * 100;

            const icon = section.Icon
                ? escapeHTML(section.Icon)
                : '';

            const sectionName = escapeHTML(
                section.SectionName
            );

            let statusClass = 'is-future';

            if (index < completedThrough) {
                statusClass = 'is-complete';
            }

            if (
                !showResultsMilestone &&
                index === currentSectionIndex
            ) {
                statusClass = 'is-current';
            }

            return `
                <div
                    class="nbhas-milestone ${statusClass}"
                    style="left: ${position}%"
                    aria-label="${sectionName}"
                    title="${sectionName}"
                >
                    <span class="nbhas-milestone-circle">
                        <span class="nbhas-milestone-icon">
                            ${icon}
                        </span>
                    </span>
                </div>
            `;
        })
        .join('');

    const resultsClass = showResultsMilestone
        ? 'is-current'
        : 'is-future';

    return `
        <div class="nbhas-journey-progress">

            <div class="nbhas-progress-track">
                <div
                    class="nbhas-progress-fill"
                    style="width: ${progressPercent}%"
                ></div>
            </div>

            <div class="nbhas-milestones">
                ${milestoneHTML}

                <div
                    class="nbhas-milestone nbhas-results-milestone ${resultsClass}"
                    style="left: 112.5%"
                    aria-label="View My Results"
                    title="View My Results"
                >
                    <span class="nbhas-milestone-circle">
                        <span class="nbhas-milestone-icon">
                            🌿
                        </span>
                    </span>
                </div>
            </div>

        </div>
    `;
}

/******************************************************************************
 * Assessment Category Screen
 ******************************************************************************/

/**
 * Show the assessment-category choices for the selected category group.
 */
function showAssessmentCategoryScreen() {

    enterJourney();

    NBHAS.journey.screen =
        'assessment-category';

    const app = document.getElementById(
        'nbhas-app'
    );

    if (!app) {
        return;
    }

    const categories = getAssessmentCategoriesForGroup(
        NBHAS.selectedCategoryGroup
    );

    if (!categories.length) {
        showAssessmentError(
            'No assessment categories were found for this selection.'
        );
        return;
    }

    const categoryCards = categories
        .map(function (category) {

            const categoryID = escapeAttribute(
                category.CategoryID
            );

    const categoryName = escapeHTML(
        category.Title ||
        category.CategoryID
        );

const cleanDescription = String(
    category.Description || ''
)
    .trim()
    .replace(/^"(.*)"$/, '$1');

const categoryDescription = cleanDescription
    ? `
        <p class="nbhas-category-card-description">
            ${escapeHTML(cleanDescription)}
        </p>
    `
    : '';

            return `
                <button
                    type="button"
                    class="nbhas-category-card"
                    data-category-id="${categoryID}"
                >
                    <span class="nbhas-category-card-title">
                        ${categoryName}
                    </span>

                    ${categoryDescription}
                </button>
            `;
        })
        .join('');

    app.innerHTML = `
        <section class="nbhas-journey-screen">

            <header class="nbhas-journey-header">
                <p class="nbhas-journey-step">
                    Step 2
                </p>

                <h2>
                    Choose Your Assessment Category
                </h2>

                <p>
                    Select the option that best describes
                    your current situation.
                </p>
            </header>

            <div class="nbhas-category-grid">
                ${categoryCards}
            </div>

            <div class="nbhas-journey-navigation">
                <button
                    type="button"
                    class="button button--secondary"
                    data-journey-action="back-to-groups"
                >
                    Previous
                </button>
            </div>

        </section>
    `;

    attachJourneyScreenHandlers();

    app.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Return categories belonging to the selected top-level group.
 *
 * DisplayCode values use the format:
 * 1-1, 1-2, 1-3
 * 2-1, 2-2, 2-3
 * 3-1, etc.
 */
function getAssessmentCategoriesForGroup(categoryGroup) {

    const selectedGroup = String(
        categoryGroup || ''
    )
        .trim()
        .replace(/^group[-_\s]*/i, '');

    return NBHAS.categories
        .filter(isActive)
        .filter(function (category) {

            const displayCode = String(
                category.DisplayCode || ''
            ).trim();

            const codeGroup =
                displayCode.split('-')[0];

            return codeGroup === selectedGroup;
        })
        .sort(sortByDisplayOrder);
}

/**
 * Attach handlers for content rendered inside #nbhas-app.
 */
function attachJourneyScreenHandlers() {

    const app = document.getElementById(
        'nbhas-app'
    );

    if (
        !app ||
        NBHAS.state.handlersAttached
    ) {
        return;
    }

    app.addEventListener(
        'click',
        handleJourneyClick
    );

    app.addEventListener(
        'change',
        handleJourneyChange
    );

    NBHAS.state.handlersAttached = true;

    console.log(
        '✅ Journey screen handlers attached'
    );
}

/**
 * Handle journey navigation and category selection.
 */
function handleJourneyClick(event) {

    const categoryCard = event.target.closest(
        '[data-category-id]'
    );

    if (categoryCard) {
        event.preventDefault();

        const categoryID = String(
            categoryCard.dataset.categoryId || ''
        ).trim();

        if (!categoryID) {
            return;
        }

        NBHAS.selectedAssessmentCategory =
            categoryID;

        NBHAS.journey.currentSectionIndex = 0;

        goToSection(0);
        return;
    }

    const actionButton = event.target.closest(
        '[data-journey-action]'
    );

    if (!actionButton) {
        return;
    }

    event.preventDefault();

    const action =
        actionButton.dataset.journeyAction;

    if (action === 'back-to-groups') {
        returnToCategoryGroups();
        return;
    }

    if (action === 'previous') {
        goPrevious();
        return;
    }

    if (action === 'next') {
        goNext();
        return;
    }

    if (action === 'view-results') {
        completeAssessment();
    }
}

/**
 * Handle radio changes on section screens.
 */
function handleJourneyChange(event) {

    if (!event.target.matches(
        'input[type="radio"]'
    )) {
        return;
    }

    saveVisibleSectionAnswers();
    updateVisibleSectionSummary();
}