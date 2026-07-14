/******************************************************************************
 * Section Screen
 ******************************************************************************/

/**
 * Render the currently selected assessment section.
 */
function renderSection(sectionIndex) {

    const app = document.getElementById('nbhas-app');

    if (!app) {
        return;
    }

    const sections = NBHAS.journey.activeSections;

    if (!sections.length) {
console.error(
    'No assessment sections are available for category:',
    NBHAS.selectedAssessmentCategory
);
return;
    }

    const section = sections[sectionIndex];

    if (!section) {
        showAssessmentError(
            'The requested assessment section was not found.'
        );
        return;
    }

    NBHAS.journey.screen = 'section';
    NBHAS.journey.currentSectionIndex = sectionIndex;

    const isLastSection =
        sectionIndex === sections.length - 1;

app.innerHTML = `
    <section class="nbhas-journey-screen">

        ${buildSectionHeader(section)}

        <div
            id="nbhas-section-body"
            class="nbhas-section-body"
        >
        </div>

        ${buildJourneyProgress(
            sectionIndex,
            false
        )}

        <div
            id="nbhas-section-footer"
            class="nbhas-section-footer"
        >
        </div>

    </section>
`;

renderSectionSymptoms(section);

renderSectionFooter(isLastSection);

attachJourneyScreenHandlers();

updateVisibleSectionSummary();

    app.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Build the section heading.
 */
function buildSectionHeader(section) {

    const icon = escapeHTML(
        section.Icon || ''
    );

    const title = escapeHTML(
        section.SectionName
    );

    return `
        <header class="nbhas-section-header">

            <div class="nbhas-section-title">

                <span class="nbhas-section-icon">
                    ${icon}
                </span>

                <h2>
                    ${title}
                </h2>

            </div>

            <p class="nbhas-section-intro">
                Select the option that best describes
                how strongly each symptom affects you.
            </p>

            <p
                id="nbhas-visible-summary"
                class="nbhas-visible-summary"
            >
                Answered: 0&nbsp;&nbsp;Score: 0
            </p>

        </header>
    `;
}

/**
 * Return the active symptom IDs for the selected
 * assessment category.
 */
function getSelectedCategorySymptomIDs() {

    const categoryID =
        NBHAS.selectedAssessmentCategory;

    if (!categoryID) {
        return new Set();
    }

    return new Set(
        (
            NBHAS.masterData?.assessmentSymptoms ||
            []
        )
            .filter(function (mapping) {
                return (
                    isActive(mapping) &&
                    mapping.CategoryID === categoryID
                );
            })
            .sort(function (a, b) {
                return (
                    Number(a.DisplayOrder || 0) -
                    Number(b.DisplayOrder || 0)
                );
            })
            .map(function (mapping) {
                return mapping.SymptomID;
            })
    );
}

/******************************************************************************
 * Section Symptom Rendering
 ******************************************************************************/

/**
 * Render all symptoms for the current section.
 */
function renderSectionSymptoms(section) {

    const container = document.getElementById(
        'nbhas-section-body'
    );

    if (!container) {
        return;
    }

const selectedSymptomIDs =
    getSelectedCategorySymptomIDs();

const symptoms = NBHAS.symptoms
    .filter(isActive)
    .filter(function (symptom) {
        return (
            symptom.SectionID === section.SectionID &&
            selectedSymptomIDs.has(symptom.SymptomID)
        );
    })
    .sort(sortByDisplayOrder);

    if (!symptoms.length) {

        container.innerHTML = `
            <p class="nbhas-empty-section">
                No symptoms are defined for this section.
            </p>
        `;

        return;
    }

    container.innerHTML = symptoms
        .map(buildSymptomHTML)
        .join('');

    restoreVisibleSectionAnswers();
}

/**
 * Build one symptom question.
 */
function buildSymptomHTML(symptom) {

    const symptomID = escapeAttribute(
        symptom.SymptomID
    );

    const symptomName = escapeHTML(
        symptom.DisplayName
    );

    return `

    <div class="nbhas-symptom-card">
        <fieldset
            class="nbhas-symptom"
            data-symptom-id="${symptomID}"
        >

            <legend class="nbhas-symptom-name">
                ${symptomName}
            </legend>

            <div class="nbhas-answer-options">

                ${buildAnswerOption(symptomID,0,'None')}
                ${buildAnswerOption(symptomID,1,'Mild')}
                ${buildAnswerOption(symptomID,2,'Moderate')}
                ${buildAnswerOption(symptomID,3,'Severe')}

            </div>

        </fieldset>
    </div>
    `;
}

/**
 * Build one radio option.
 */
function buildAnswerOption(
    symptomID,
    value,
    label
) {

    const inputID =
        `${symptomID}-${value}`;

    return `
        <label
            class="nbhas-answer-option"
            for="${inputID}"
        >

            <input
                id="${inputID}"
                type="radio"
                name="${symptomID}"
                value="${value}"
            >

            <span>${label}</span>

        </label>
    `;
}

/**
 * Restore previously selected answers when
 * returning to a section.
 */
function restoreVisibleSectionAnswers() {

    Object.entries(
        NBHAS.journey.answers
    ).forEach(function ([symptomID,value]) {

        const radio =
            document.querySelector(

                `input[name="${cssEscape(symptomID)}"][value="${value}"]`

            );

        if (radio) {
            radio.checked = true;
        }

    });

}

/******************************************************************************
 * Section Answer State and Totals
 ******************************************************************************/

/**
 * Save all selected answers currently visible on the section screen.
 */
function saveVisibleSectionAnswers() {

    const sectionBody = document.getElementById(
        'nbhas-section-body'
    );

    if (!sectionBody) {
        return;
    }

    const selectedAnswers = sectionBody.querySelectorAll(
        'input[type="radio"]:checked'
    );

    selectedAnswers.forEach(function (radio) {

        NBHAS.journey.answers[radio.name] =
            Number(radio.value);
    });

    recalculateJourneyTotals();
}

/**
 * Recalculate all journey totals from saved answers.
 */
function recalculateJourneyTotals() {

    const totals = {
        answered: 0,
        totalScore: 0,
        sections: {}
    };

    NBHAS.journey.activeSections.forEach(
        function (section) {

            totals.sections[section.SectionID] = {
                answered: 0,
                score: 0
            };
        }
    );

    NBHAS.symptoms
        .filter(isActive)
        .forEach(function (symptom) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    NBHAS.journey.answers,
                    symptom.SymptomID
                )
            ) {
                return;
            }

            const score = Number(
                NBHAS.journey.answers[symptom.SymptomID]
            );

            totals.answered += 1;
            totals.totalScore += score;

            const sectionTotals =
                totals.sections[symptom.SectionID];

            if (sectionTotals) {
                sectionTotals.answered += 1;
                sectionTotals.score += score;
            }
        });

    NBHAS.journey.totals = totals;
}

/**
 * Update the visible section summary.
 */
function updateVisibleSectionSummary() {

    saveVisibleSectionAnswers();

    const summary = document.getElementById(
        'nbhas-visible-summary'
    );

    if (!summary) {
        return;
    }

    const section =
        NBHAS.journey.activeSections[
            NBHAS.journey.currentSectionIndex
        ];

    if (!section) {
        return;
    }

    const sectionTotals =
        NBHAS.journey.totals.sections[
            section.SectionID
        ] || {
            answered: 0,
            score: 0
        };

    summary.textContent =
        `Answered: ${sectionTotals.answered}   ` +
        `Score: ${sectionTotals.score}`;
}

/******************************************************************************
 * Section Footer
 ******************************************************************************/

/**
 * Render Previous/Next controls for the visible section.
 */
function renderSectionFooter(isLastSection) {

    const footer = document.getElementById(
        'nbhas-section-footer'
    );

    if (!footer) {
        return;
    }

    const currentIndex =
        NBHAS.journey.currentSectionIndex;

    const totalSections =
        NBHAS.journey.activeSections.length;

    const nextButton = isLastSection
        ? `
            <button
                type="button"
                class="nbhas-button"
                data-journey-action="next"
            >
                🌿 Complete Assessment
            </button>
        `
        : `
            <button
                type="button"
                class="nbhas-button"
                data-journey-action="next"
            >
                Next →
            </button>
        `;

    footer.innerHTML = `
        <div class="nbhas-section-overall-progress">

            <span>
                Section ${currentIndex + 1}
                of ${totalSections}
            </span>

            <span id="nbhas-overall-answer-summary">
                Answered:
                ${NBHAS.journey.totals.answered}
                of ${getTotalActiveSymptomCount()}
            </span>

        </div>

        <div class="nbhas-journey-navigation">

            <button
                type="button"
                class="nbhas-button nbhas-previous-button"
                data-journey-action="previous"
            >
                ← Previous
            </button>

            ${nextButton}

        </div>
    `;
}

/**
 * Return the number of active symptoms in the assessment.
 */
function getTotalActiveSymptomCount() {

    return getSelectedCategorySymptomIDs().size;
}

/**
 * Refresh the overall answered count shown in the footer.
 */
function updateOverallAnswerSummary() {

    const summary = document.getElementById(
        'nbhas-overall-answer-summary'
    );

    if (!summary) {
        return;
    }

    summary.textContent =
        `Answered: ${NBHAS.journey.totals.answered} ` +
        `of ${getTotalActiveSymptomCount()}`;
}

