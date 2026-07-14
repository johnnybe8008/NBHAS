/******************************************************************************
 * Navigation Validation
 ******************************************************************************/

/**
 * Return the currently visible section.
 */
function getCurrentSection() {

    return NBHAS.journey.activeSections[
        NBHAS.journey.currentSectionIndex
    ] || null;
}

/**
 * Return active symptoms for a section.
 */
function getSectionSymptoms(section) {

    if (!section) {
        return [];
    }

    return NBHAS.symptoms
        .filter(isActive)
        .filter(function (symptom) {
            return symptom.SectionID === section.SectionID;
        })
        .sort(sortByDisplayOrder);
}


function validateVisibleSection() {
    return true;
}
/**
 * Confirm that every symptom in the visible section has an answer. not true...
 */
function validateVisibleSectionOld() {

    saveVisibleSectionAnswers();

    const section = getCurrentSection();
    const symptoms = getSectionSymptoms(section);

    const firstUnanswered = symptoms.find(
        function (symptom) {
            return !Object.prototype.hasOwnProperty.call(
                NBHAS.journey.answers,
                symptom.SymptomID
            );
        }
    );

    clearSectionValidationMessage();

    if (!firstUnanswered) {
        return true;
    }

    showSectionValidationMessage(
        'Please answer every symptom in this section before continuing.'
    );

    const fieldset = document.querySelector(
        `[data-symptom-id="${cssEscape(firstUnanswered.SymptomID)}"]`
    );

    if (fieldset) {
        fieldset.classList.add('has-error');

        fieldset.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        const firstRadio = fieldset.querySelector(
            'input[type="radio"]'
        );

        if (firstRadio) {
            firstRadio.focus({
                preventScroll: true
            });
        }
    }

    return false;
}

/**
 * Show a section-level validation message.
 */
function showSectionValidationMessage(message) {

    const footer = document.getElementById(
        'nbhas-section-footer'
    );

    if (!footer) {
        return;
    }

    const existing = document.getElementById(
        'nbhas-section-validation'
    );

    if (existing) {
        existing.textContent = message;
        return;
    }

    footer.insertAdjacentHTML(
        'afterbegin',
        `
            <p
                id="nbhas-section-validation"
                class="nbhas-section-validation"
                role="alert"
            >
                ${escapeHTML(message)}
            </p>
        `
    );
}

/**
 * Clear previous validation styling and message.
 */
function clearSectionValidationMessage() {

    const message = document.getElementById(
        'nbhas-section-validation'
    );

    if (message) {
        message.remove();
    }

    document
        .querySelectorAll(
            '.nbhas-symptom.has-error'
        )
        .forEach(function (fieldset) {
            fieldset.classList.remove('has-error');
        });
}
