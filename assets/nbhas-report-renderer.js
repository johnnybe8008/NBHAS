/*
 * ------------------------------------------------------------
 * NBHAS Report Renderer
 * Version: 1.0.0
 * ------------------------------------------------------------
 */

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

                container.style.position =
                    'absolute';

                container.style.left =
                    '-10000px';

                container.style.top =
                    '0';

                container.style.width =
                    '800px';

                container.style.background =
                    '#ffffff';

                container.style.padding =
                    '40px';

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

        return `
            <h3>
                Assessment Summary
            </h3>
        `;
    }

    function renderIndicators(data) {

        return `
            <h3>
                Strongest Indicators
            </h3>
        `;
    }

    function renderRecommendation(data) {

        return `
            <h3>
                Recommended Support
            </h3>
        `;
    }

    function renderResources(data) {

        return `
            <h3>
                Helpful Resources
            </h3>
        `;
    }

    function renderSymptoms(data) {

        return `
            <h3>
                Completed Assessment
            </h3>
        `;
    }

    function renderFooter(data) {

        return `
            <hr>

            <p>
                NBHAS v1.0.0
            </p>
        `;
    }

    NBHAS.reportRenderer =
        reportRenderer;

})();
