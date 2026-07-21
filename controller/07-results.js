/******************************************************************************
 * Results
 ******************************************************************************/

/**
 * Show the final journey screen before results are generated.
 */
function showResultsReadyScreen() {

    const app = document.getElementById(
        'nbhas-app'
    );

    if (!app) {
        return;
    }

    NBHAS.journey.screen = 'results-ready';

    app.innerHTML = `
        <section class="nbhas-journey-screen">

            ${buildJourneyProgress(
                NBHAS.journey.activeSections.length - 1,
                true
            )}

            <div class="nbhas-results-ready-card">

                <div class="nbhas-results-ready-icon">
                    🌿
                </div>

                <h2>
                    Your Assessment Is Complete
                </h2>

                <p>
                    We have your responses and are ready to
                    prepare your personalized hormone balance results.
                </p>

                <div class="nbhas-results-ready-summary">

                    <span>
                        Answered:
                        ${NBHAS.journey.totals.answered}
                        of ${getTotalActiveSymptomCount()}
                    </span>

                    <span>
                        Total score:
                        ${NBHAS.journey.totals.totalScore}
                    </span>

                </div>

                <div class="nbhas-journey-navigation">

                    <button
                        type="button"
                        class="nbhas-button"
                        data-journey-action="previous"
                    >
                        ← Previous
                    </button>

                    <button
                        type="button"
                        class="nbhas-button"
                        data-journey-action="view-results"
                    >
                        🌿 View My Results
                    </button>

                </div>

            </div>

        </section>
    `;

    app.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Complete the assessment and send the saved answers
 * to the existing NBHAS engine.
 */
function completeAssessment() {

    saveVisibleSectionAnswers();
    recalculateJourneyTotals();

    const answers = collectAssessmentAnswers();

    const engineResults = NBHAS.engine.evaluate(
        answers.symptomAnswers
    );

    console.log(
        'Engine results:',
        engineResults
    );

    showAnalysisScreen();

    window.setTimeout(
        function () {
            renderResults(
                engineResults,
                answers
            );
        },
        CONFIG.analysisDelay
    );
}

/**
 * Build the same answer structure used by the Phase 3 controller.
 */
function collectAssessmentAnswers() {

    const answers = {
        symptomAnswers: {},
        symptoms: [],
        totalScore: 0,
        answeredCount: 0,
        sectionScores: {}
    };

    NBHAS.journey.activeSections.forEach(
        function (section) {

            answers.sectionScores[
                section.SectionID
            ] = {
                sectionName:
                    section.SectionName,
                answeredCount: 0,
                score: 0,
                symptoms: []
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
                NBHAS.journey.answers[
                    symptom.SymptomID
                ]
            );

            answers.symptomAnswers[
                symptom.SymptomID
            ] = score;

            answers.symptoms.push({
                symptomID:
                    symptom.SymptomID,
                symptomName:
                    symptom.DisplayName,
                sectionID:
                    symptom.SectionID,
                score: score
            });

            answers.totalScore += score;
            answers.answeredCount += 1;

            const sectionBucket =
                answers.sectionScores[
                    symptom.SectionID
                ];

            if (sectionBucket) {

                sectionBucket.answeredCount += 1;
                sectionBucket.score += score;

                sectionBucket.symptoms.push({
                    symptomID:
                        symptom.SymptomID,
                    symptomName:
                        symptom.DisplayName,
                    score: score
                });
            }
        });

    console.log(
        'Collected assessment answers:',
        answers
    );

    return answers;
}

/**
 * Show the existing analysis transition.
 */
function showAnalysisScreen() {

    const app = document.getElementById(
        'nbhas-app'
    );

    if (!app) {
        return;
    }

    NBHAS.journey.screen = 'analysis';

    app.innerHTML = `
        <section class="nbhas-analysis-screen">

        <div class="nbhas-analysis-card">

                <div class="nbhas-leaf">
                    🌿
                </div>

                <h2>
                    Understanding Your Symptoms
                </h2>

                <p>
                    We’re reviewing your answers and preparing
                    your personalized hormone balance results.
                </p>

                <div class="nbhas-analysis-progress-wrap">
                    <div class="nbhas-analysis-progress-bar"></div>
                </div>

                <p class="nbhas-analysis-note">
                    This only takes a moment.
                </p>

            </div>

        </section>
    `;
}


/**
 * Render the existing dashboard without changing
 * the engine, renderer, or dashboard implementation.
 */
function renderResults(
    engineResults,
    answers
) {

    const options = document.getElementById(
        'nb-assessment-options'
    );

    const hero = document.querySelector(
        '.nb-assessment-hero'
    );

    const beginButton = document.querySelector(
        '.nb-assessment-button'
    );

    const intro = document.querySelector(
        '.nbhas-assessment-intro-area'
    );

    const categoryHeading = document.querySelector(
        '.nbhas-category-heading'
    );

    const app = document.getElementById(
        'nbhas-app'
    );

    if (!app) {
        return;
    }

    if (beginButton) {
        beginButton.style.display = 'none';
    }

    if (intro) {
        intro.style.display = 'none';
    }

    if (categoryHeading) {
        categoryHeading.style.display = 'none';
    }

    if (options) {
        options.style.display = 'none';
    }

    app.innerHTML = `
        <div id="nbhas-results"></div>
    `;

    /*
 * Preserve the completed assessment for reporting,
 * downloading, and email delivery.
 *
 * Both Download Report and Email Results will read
 * this same object.
 */
NBHAS.completedAssessment = {
    category:
        NBHAS.selectedAssessmentCategory,

    categoryGroup:
        NBHAS.selectedCategoryGroup,

    answers:
        answers,

    results:
        engineResults,

    completedAt:
        new Date().toISOString()
};

    if (
        typeof window.renderDashboard ===
        'function'
    ) {
        window.renderDashboard(
            engineResults,
            'nbhas-results'
        );

        const editAnswersButton =
    document.getElementById(
        'nbhas-edit-answers'
    );

if (editAnswersButton) {

    editAnswersButton.addEventListener(
        'click',
        function () {

            goToSection(0);

        }
    );

}

    } else if (
        window.NBHASRenderer &&
        typeof window.NBHASRenderer.render ===
        'function'
    ) {
        window.NBHASRenderer.render(
            engineResults,
            'nbhas-results'
        );

    } else {

        console.error(
            'No NBHAS results renderer is available.'
        );

        app.innerHTML = `
            <section class="nbhas-error-screen">

                <div class="nbhas-error-card">

                    <h2>
                        Results unavailable
                    </h2>

                    <p>
                        Your assessment was completed,
                        but the results display could not
                        be loaded.
                    </p>

                </div>

            </section>
        `;

        return;
    }

    NBHAS.journey.screen = 'results';
    NBHAS.state.resultsRendered = true;

    window.dispatchEvent(
        new CustomEvent(
            'nbhas:results',
            {
                detail: {
                    category:
                        NBHAS.selectedAssessmentCategory,
                    categoryGroup:
                        NBHAS.selectedCategoryGroup,
                    answers: answers,
                    results: engineResults
                }
            }
        )
    );

    if (hero && app.parentNode) {
        hero.insertAdjacentElement(
            'afterend',
            app
        );
    }

    if (hero) {
        hero.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        app.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    console.log(
        '✅ Results rendered'
    );
}
