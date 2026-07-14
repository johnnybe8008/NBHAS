
/******************************************************************************
 * Assessment Category Screen
 ******************************************************************************/

/**
 * Show the assessment-category choices for the selected category group.
 */
function showAssessmentCategoryScreen() {
console.log(
    'Entering category screen:',
    NBHAS.selectedCategoryGroup
);
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
console.error(
    '❌ Unable to load assessment category screen.',
    {
        selectedCategoryGroup:
            NBHAS.selectedCategoryGroup,

        journey:
            NBHAS.journey,

        masterData:
            NBHAS.masterData
    }
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
                    class="nbhas-button"
                    data-journey-action="back-to-groups"
                >
                   ← Previous
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

    const categories =
        NBHAS.masterData?.categories || [];

    return categories
        .filter(function (category) {

            if (!isActive(category)) {
                return false;
            }

            const displayCode =
                String(category.DisplayCode || '').trim();

            if (categoryGroup === 'ovaries-uterus') {
                return displayCode.startsWith('1-');
            }

            if (categoryGroup === 'ovaries-no-uterus') {
                return displayCode.startsWith('2-');
            }

            if (categoryGroup === 'no-ovaries') {
                return (
                    displayCode === '3' ||
                    displayCode.startsWith('3-')
                );
            }

            return false;
        })
        .sort(function (a, b) {
            return (
                Number(a.DisplayOrder || 0) -
                Number(b.DisplayOrder || 0)
            );
        });
}

/**
 * Return only the sections containing symptoms that
 * apply to the selected assessment category.
 */
function buildActiveSections(categoryID) {

const applicableSymptomIDs = new Set(
    (NBHAS.masterData?.assessmentSymptoms || [])
        .filter(function (mapping) {
            return (
                isActive(mapping) &&
                mapping.CategoryID === categoryID
            );
        })
        .map(function (mapping) {
            return mapping.SymptomID;
        })
);

    const applicableSectionIDs = new Set(
        NBHAS.symptoms
            .filter(isActive)
            .filter(function (symptom) {
                return applicableSymptomIDs.has(
                    symptom.SymptomID
                );
            })
            .map(function (symptom) {
                return symptom.SectionID;
            })
    );

    return NBHAS.sections
        .filter(isActive)
        .filter(function (section) {
            return applicableSectionIDs.has(
                section.SectionID
            );
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

NBHAS.journey.activeSections =
    buildActiveSections(categoryID);

NBHAS.journey.currentSectionIndex = 0;

if (!NBHAS.journey.activeSections.length) {
    showAssessmentError(
        'No assessment sections are available for this category.'
    );
    return;
}

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
    clearSectionValidationMessage();
    updateVisibleSectionSummary();
}
