/*
 * ------------------------------------------------------------
 * NBHAS Report Renderer
 * Version: 1.0.0
 * ------------------------------------------------------------
 */
console.log('✅ nbhas-report-renderer.js loaded');

(function () {

    if (!window.NBHAS) {
        window.NBHAS = {};
    }

    const reportRenderer = {

        render() {

            if (!NBHAS.report ||
                !NBHAS.report.hasAssessment()) {

                console.warn(
                    'No completed assessment.'
                );

                return;
            }

            const data =
                NBHAS.report.buildReportData();

            let container =
                document.getElementById(
                    'nbhas-hidden-report'
                );

            if (!container) {

                container =
                    document.createElement('div');

                container.id =
                    'nbhas-hidden-report';

container.style.position = 'absolute';
container.style.left = '-10000px';
container.style.top = '0';
container.style.width = '800px';
container.style.background = '#ffffff';
container.style.padding = '40px';

                document.body.appendChild(
                    container
                );
            }

            container.innerHTML = `

                ${renderHeader(data)}

                ${renderSummary(data)}

                ${renderIndicators(data)}

                ${renderRecommendation(data)}

                ${renderResources(data)}

                ${renderSymptoms(data)}

                ${renderFooter(data)}

            `;

            return container;

        }

    };

    function renderHeader(data) {

        return `
            <h1>
                Nature's Balance
            </h1>

            <h2>
                Hormone Assessment Report
            </h2>
        `;
    }

 function renderSummary(data) {

    const scores =
        Object.values(
            data.results?.scores || {}
        );

    const primaryScore =
        scores[0] || null;

    const completedDate =
        new Date(
            data.completedAt
        ).toLocaleDateString();

    return `
        <section class="nbhas-report-section">

            <h3>
                Assessment Summary
            </h3>

            <p>
                <strong>Assessment completed:</strong>
                ${completedDate}
            </p>

            <p>
                <strong>Symptoms answered:</strong>
                ${data.answers?.answeredCount || 0}
            </p>

            <p>
                <strong>Total symptom score:</strong>
                ${data.answers?.totalScore || 0}
            </p>

            ${
                primaryScore
                    ? `
                        <p>
                            <strong>
                                Primary assessment result:
                            </strong>

                            ${primaryScore.title}
                        </p>

                        <p>
                            <strong>Assessment score:</strong>
                            ${primaryScore.percent}%
                            (${primaryScore.raw} of
                            ${primaryScore.max})
                        </p>
                    `
                    : ''
            }

        </section>
    `;
}

function renderIndicators(data) {

    const symptoms =
        data.answers?.symptoms || [];

    const indicators =
        symptoms
            .filter(
                symptom =>
                    Number(symptom.score) >= 2
            )
            .sort(
                (a, b) =>
                    Number(b.score) -
                    Number(a.score)
            );

    if (!indicators.length) {

        return `
            <section class="nbhas-report-section">

                <h3>
                    Strongest Indicators
                </h3>

                <p>
                    No moderate or severe symptoms
                    were recorded.
                </p>

            </section>
        `;
    }

    return `
        <section class="nbhas-report-section">

            <h3>
                Strongest Indicators
            </h3>

            <ul>
                ${
                    indicators
                        .map(
                            symptom => `
                                <li>
                                    ${escapeHTML(
                                        symptom.symptomName
                                    )}
                                    —
                                    ${getSeverityLabel(
                                        symptom.score
                                    )}
                                </li>
                            `
                        )
                        .join('')
                }
            </ul>

        </section>
    `;
}

function renderRecommendation(data) {

    const recommendations =
        data.results?.recommendations || [];

    if (!recommendations.length) {

        return `
            <section class="nbhas-report-section">

                <h3>
                    Recommended Support
                </h3>

                <p>
                    No specific recommendation
                    was generated.
                </p>

            </section>
        `;
    }

    return `
        <section class="nbhas-report-section">

            <h3>
                Recommended Support
            </h3>

            ${
                recommendations
                    .map(
                        recommendation => {

                            const productURL =
                                recommendation
                                    .shopifyProductHandle
                                    ? `/products/${
                                        recommendation
                                            .shopifyProductHandle
                                    }`
                                    : '';

                            return `
                                <div class="
                                    nbhas-report-recommendation
                                ">

                                    <h4>
                                        ${escapeHTML(
                                            recommendation
                                                .assessmentTitle ||
                                            recommendation.name
                                        )}
                                    </h4>

                                    <p>
                                        ${escapeHTML(
                                            recommendation
                                                .description ||
                                            ''
                                        )}
                                    </p>

                                    ${
                                        recommendation
                                            .productTitle
                                            ? `
                                                <p>
                                                    <strong>
                                                        Recommended product:
                                                    </strong>

                                                    ${
                                                        escapeHTML(
                                                            recommendation
                                                                .productTitle
                                                        )
                                                    }
                                                </p>
                                            `
                                            : ''
                                    }

                                    ${
                                        recommendation
                                            .productSummary
                                            ? `
                                                <p>
                                                    ${
                                                        escapeHTML(
                                                            recommendation
                                                                .productSummary
                                                        )
                                                    }
                                                </p>
                                            `
                                            : ''
                                    }

                                    ${
                                        productURL
                                            ? `
                                                <p>
                                                    <a
                                                        href="${productURL}"
                                                        target="_blank"
                                                        rel="noopener"
                                                    >
                                                        View Product
                                                    </a>
                                                </p>
                                            `
                                            : ''
                                    }

                                    ${
                                        recommendation
                                            .educationPage
                                            ? `
                                                <p>
                                                    <a
                                                        href="${
                                                            recommendation
                                                                .educationPage
                                                        }"
                                                        target="_blank"
                                                        rel="noopener"
                                                    >
                                                        Learn More
                                                    </a>
                                                </p>
                                            `
                                            : ''
                                    }

                                </div>
                            `;
                        }
                    )
                    .join('')
            }

        </section>
    `;
}

function renderSymptoms(data) {

    const sections =
        Object.values(
            data.answers?.sectionScores || {}
        );

    const populatedSections =
        sections.filter(
            section =>
                Array.isArray(section.symptoms) &&
                section.symptoms.length
        );

    if (!populatedSections.length) {

        return `
            <section class="nbhas-report-section">

                <h3>
                    Completed Assessment
                </h3>

                <p>
                    No symptom responses were recorded.
                </p>

            </section>
        `;
    }

    return `
        <section class="nbhas-report-section">

            <h3>
                Completed Assessment
            </h3>

            ${
                populatedSections
                    .map(
                        section => `
                            <div class="
                                nbhas-report-symptom-section
                            ">

                                <h4>
                                    ${escapeHTML(
                                        section.sectionName
                                    )}
                                </h4>

                                <p>
                                    Answered:
                                    ${section.answeredCount}

                                    &nbsp;|&nbsp;

                                    Score:
                                    ${section.score}
                                </p>

                                <ul>
                                    ${
                                        section.symptoms
                                            .map(
                                                symptom => `
                                                    <li>
                                                        ${
                                                            escapeHTML(
                                                                symptom
                                                                    .symptomName
                                                            )
                                                        }

                                                        —
                                                        ${
                                                            getSeverityLabel(
                                                                symptom.score
                                                            )
                                                        }
                                                    </li>
                                                `
                                            )
                                            .join('')
                                    }
                                </ul>

                            </div>
                        `
                    )
                    .join('')
            }

        </section>
    `;
}

function renderResources(data) {

    const recommendations =
        data.results?.recommendations || [];

    const resources = [];

    recommendations.forEach(
        recommendation => {

            if (
                recommendation
                    .educationPage
            ) {
                resources.push({
                    title:
                        `Learn more about ${
                            recommendation
                                .assessmentTitle ||
                            recommendation.name
                        }`,
                    url:
                        recommendation
                            .educationPage
                });
            }

            if (
                recommendation
                    .shopifyProductHandle
            ) {
                resources.push({
                    title:
                        recommendation
                            .productTitle ||
                        'View Recommended Product',
                    url:
                        `/products/${
                            recommendation
                                .shopifyProductHandle
                        }`
                });
            }
        }
    );

    if (!resources.length) {

        return `
            <section class="nbhas-report-section">

                <h3>
                    Helpful Resources
                </h3>

                <p>
                    No additional resources
                    were generated.
                </p>

            </section>
        `;
    }

    return `
        <section class="nbhas-report-section">

            <h3>
                Helpful Resources
            </h3>

            <ul>
                ${
                    resources
                        .map(
                            resource => `
                                <li>
                                    <a
                                        href="${resource.url}"
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        ${escapeHTML(
                                            resource.title
                                        )}
                                    </a>
                                </li>
                            `
                        )
                        .join('')
                }
            </ul>

        </section>
    `;
}

function renderFooter(data) {

    const completedDate =
        data.completedAt
            ? new Date(
                data.completedAt
            ).toLocaleString()
            : '';

    const engineVersion =
        data.results?.meta
            ?.engineVersion || '1.0.0';

    const knowledgeVersion =
        data.results?.meta
            ?.knowledgeVersion || '';

    return `
        <footer class="nbhas-report-footer">

            <hr>

            <p>
                This assessment is intended
                for educational purposes only
                and is not a medical diagnosis.
            </p>

            ${
                completedDate
                    ? `
                        <p>
                            Completed:
                            ${escapeHTML(
                                completedDate
                            )}
                        </p>
                    `
                    : ''
            }

            <p>
                NBHAS Engine
                ${escapeHTML(
                    engineVersion
                )}

                ${
                    knowledgeVersion
                        ? `
                            &nbsp;|&nbsp;
                            Knowledge Base
                            ${escapeHTML(
                                knowledgeVersion
                            )}
                        `
                        : ''
                }
            </p>

            <p>
                Nature's Balance
            </p>

        </footer>
    `;
}

    function getSeverityLabel(score) {

    const labels = {
        0: 'None',
        1: 'Mild',
        2: 'Moderate',
        3: 'Severe'
    };

    return labels[
        Number(score)
    ] || 'Not answered';
}

function escapeHTML(value) {

    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


    NBHAS.reportRenderer =
        reportRenderer;

})();
