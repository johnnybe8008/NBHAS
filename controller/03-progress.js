
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
    : ((currentSectionIndex + 1) / (sections.length + 1)) * 100;
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

