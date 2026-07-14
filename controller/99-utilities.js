/******************************************************************************
 * Utilities (temporary)
 ******************************************************************************/

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function isActive(record) {
    return (
        record.Active === true ||
        String(record.Active).toUpperCase() === 'TRUE' ||
        String(record.Active) === '1'
    );
}

function sortByDisplayOrder(a, b) {
    return (
        Number(a.DisplayOrder || 0) -
        Number(b.DisplayOrder || 0)
    );
}

function escapeAttribute(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function cssEscape(value) {
    const stringValue = String(value ?? '');

    if (
        window.CSS &&
        typeof window.CSS.escape === 'function'
    ) {
        return window.CSS.escape(stringValue);
    }

    return stringValue.replace(
        /[^a-zA-Z0-9_-]/g,
        character => `\\${character}`
    );
}

function showAssessmentError(message) {

    console.error(message);

    const app = document.getElementById('nbhas-app');

    if (!app) {
        return;
    }

    app.innerHTML = `
        <section class="nbhas-journey-screen">
            <div class="nbhas-error">
                <h2>Something went wrong</h2>
                <p>${escapeHTML(message)}</p>

                <button
                    type="button"
                    class="nbhas-button"
                    onclick="location.reload()">
                    Start Again
                </button>
            </div>
        </section>
    `;
}

})();
