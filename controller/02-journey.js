
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

    console.log('Clicked element:', event.target);
console.log('Matched card:', card);
console.log('Matched card dataset:', card?.dataset);
console.log(
    'data-assessment-category:',
    card?.getAttribute('data-assessment-category')
);

    if (!card) {
        return;
    }

    event.preventDefault();
    const categoryGroup = String(
        card.dataset.assessmentCategory || ''
    ).trim();

        console.log(
        'Resolved categoryGroup:',
        categoryGroup
    );


    if (!categoryGroup) {
        console.warn(
            'Selected group has no category value.'
        );
        return;
    }

    if (!categoryGroup) {
        console.warn(
            'Selected card has no assessment category value.',
            card
        );
        return;
    }

    NBHAS.selectedCategoryGroup = categoryGroup;
    NBHAS.selectedAssessmentCategory = null;

    console.log(
    'After assignment:',
    NBHAS.selectedCategoryGroup
);

    NBHAS.journey.currentSectionIndex = 0;
    NBHAS.journey.answers = {};

const categories =
    getAssessmentCategoriesForGroup(categoryGroup);

if (categories.length === 1) {

    const categoryID =
        categories[0].CategoryID;

    NBHAS.selectedAssessmentCategory =
        categoryID;

    NBHAS.journey.activeSections =
        buildActiveSections(categoryID);

    NBHAS.journey.currentSectionIndex = 0;

    goToSection(0);
    return;
}

if (categories.length > 1) {
    showAssessmentCategoryScreen();
    return;
}

console.error(
    'No assessment categories found for group:',
    categoryGroup
);

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

    if (
        NBHAS.journey.screen ===
        'results-ready'
    ) {
        goToSection(
            NBHAS.journey.activeSections.length - 1
        );
        return;
    }

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

    if (!validateVisibleSection()) {
        return;
    }

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

