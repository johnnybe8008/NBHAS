const NBHAS_CONFIG = {
  products: {
    estProgBundle: {
      handle: "bio-identical-estradiol-and-progesterone-cream-pack"
    }
  },
  bundles: {
    estProg: {
      handle: "bio-identical-estradiol-and-progesterone-cream-pack"
    }
  }
};

function renderDashboard(result, targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = `
    <div class="nbhas-dashboard">
      ${renderHeaderCard(result)}
      ${renderAssessmentCard(result)}
      ${renderRecommendationCard(result)}
      ${renderIndicatorsCard(result)}
      ${renderNextStepsCard(result)}
      ${renderFooterCard()}
    </div>
  `;
  loadProductImages();
  document
    .getElementById('nbhas-start-again')
    ?.addEventListener('click', function () {

      if (!confirm(
        'Start a new assessment? Your current results will be cleared.'
      )) {
        return;
      }

      window.location.reload();

    });
}

function renderAssessment(result, targetId) {
  renderDashboard(result, targetId);
}

async function getShopifyProduct(handle) {
  try {
    const response = await fetch(`/products/${handle}.js`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn("NBHAS product fetch failed:", handle, error);
    return null;
  }
}

function getPrimaryRecommendation(result) {
  return result?.recommendations?.[0] || null;
}

function getScorePercent(result) {
  const firstCategory = Object.values(result.scores || {})[0];
  return Math.round(Number(firstCategory?.percent || 0));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderHeaderCard(result) {
  const score = getScorePercent(result);
console.table(result);
  return `
    <div class="nbhas-card nbhas-header-card">
      <h2 class="nbhas-card-heading">Your Hormone Assessment Results</h2>

      <p class="nbhas-subtitle">Based on your assessment</p>

      <div class="nbhas-bar">
        <div class="nbhas-bar-fill" style="width:${score}%">&nbsp;</div>
      </div>

      <div class="nbhas-score-row">
        <span>Assessment Score</span>
        <strong>${score}%</strong>
      </div>
    </div>
  `;
}

function renderAssessmentCard(result) {
  const recommendations = result?.recommendations || [];

  const hasEst = recommendations.some(r => r.id === "REC-EST");
  const hasProg = recommendations.some(r => r.id === "REC-PROG");

  let title = "";
  let description = "";

  if (hasEst && hasProg) {
    title = "Low Estrogen + Low Progesterone";
    description = "Your responses suggest that both low estrogen and low progesterone may be contributing to your symptoms.";
  } else {
    const rec = getPrimaryRecommendation(result);
    if (!rec) return "";

    title = rec.assessmentTitle || rec.name || rec.id;
    description = rec.description || "";
  }

  return `
    <div class="nbhas-card nbhas-assessment-card">
      <h3 class="nbhas-card-heading">What Your Assessment Suggests</h3>
      <h2 class="nbhas-result-title">${escapeHtml(title)}</h2>
      ${description ? `<p>${escapeHtml(description)}</p>` : ""}
    </div>
  `;
}

function renderRecommendationCard(result) {
  const recommendations = result?.recommendations || [];

  if (recommendations.length === 0) return "";

  const hasEst = recommendations.some(r => r.id === "REC-EST");
  const hasProg = recommendations.some(r => r.id === "REC-PROG");
  const hasMel = recommendations.some(r => r.id === "REC-MEL");
  const product = null; //  await getShopifyProduct(productHandle);

  let productHandle = "";
  let productTitle = "";
  let productSummary = "";
  let productUrl = "#";
  let educationPage = "#";

  if (hasEst && hasProg) {
 productHandle = "bio-identical-estradiol-and-progesterone-cream-pack";
  productTitle = "Nature's Balance Bio-Identical Estradiol & Progesterone Cream Pack";
  productSummary = "Recommended when your assessment suggests support for both estrogen and progesterone balance.";
  productUrl = `/products/${productHandle}`;
  educationPage = "/pages/understanding-hormone-balance";
} else {
  const rec = getPrimaryRecommendation(result);
  if (!rec) return "";

  productHandle = rec.shopifyProductHandle || "";
  productTitle = rec.productTitle || rec.name || "Recommended Support";
  productSummary = rec.productSummary || "Supports healthy hormone balance based on your assessment.";
  productUrl = productHandle ? `/products/${productHandle}` : "#";
  educationPage = rec.educationPage || "#";
}

  return `
    <div class="nbhas-card">
      <h3 class="nbhas-card-heading">Recommended Support</h3>

      <div class="nbhas-product-card">
        <div class="nbhas-product-image" data-product-handle="${escapeHtml(productHandle)}">
          &nbsp;
        </div>
        <div class="nbhas-product-info">
          <h2 class="nbhas-product-title">${escapeHtml(productTitle)}</h2>

          <p>${escapeHtml(productSummary)}</p>

          <div class="nbhas-button-row">
            <a class="nbhas-button" 
              href="${productUrl}"
              target="_blank"
              rel="noopener noreferrer"
              >
              View Product
            </a>

            <a class="nbhas-button nbhas-button-secondary" 
            href="${educationPage}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
async function loadProductImages() {
  const imageBoxes = document.querySelectorAll(".nbhas-product-image[data-product-handle]");

  imageBoxes.forEach(async box => {
    const handle = box.dataset.productHandle;
    if (!handle) return;

    const product = await getShopifyProduct(handle);
    if (!product || !product.featured_image) return;

    const productUrl = `/products/${handle}`;
    const title = product.title || "";
console.log({
    title: product.title,
    featured_image: product.featured_image,
    images: product.images
});
    box.innerHTML = `
      <a href="${productUrl}"
          target="_blank"
          rel="noopener noreferrer"
      >
        <img
          src="${product.featured_image}"
          alt="${escapeHtml(title)}"
          width="140"
          height="140"
          loading="lazy">
      </a>
    `;
  });
}

function renderIndicatorsCard(result) {
  return `
    <div class="nbhas-card">
      <h3 class="nbhas-card-heading">Why This Recommendation?</h3>
      <p>Your strongest indicators were:</p>

      <div class="nbhas-check-list">
        <div>✓ PMS before your period starts</div>
        <div>✓ Sleep disruption</div>
        <div>✓ Mood changes</div>
        <div>✓ Anxiety or irritability</div>
      </div>
    </div>
  `;
}

function renderNextStepsCard(result) {

  return `
    <div class="nbhas-card" >

      <h3 class="nbhas-card-heading">
        Next Steps
      </h3>

        <div
          class="nbhas-button-row"
          style="display: flex; justify-content: center; gap: 10px;">

          <button
            type="button"
            class="nbhas-button nbhas-button-secondary"
            id="nbhas-download-report">
            Download Report
          </button>

          <button
            type="button"
            class="nbhas-button nbhas-button-secondary"
            id="nbhas-email-results">
            Email Results
          </button>

          <button
            type="button"
            class="nbhas-button nbhas-button-secondary"
            id="nbhas-start-again"
            data-action="start-again">
            Start Again
          </button>

        </div>
    </div>
  `;
 
}

function renderFooterCard() {
  return `
    <div class="nbhas-footer-note">
      <strong>Important:</strong>
      This assessment is based solely on the symptoms you reported and is intended as an educational screening tool.
      It is not a medical diagnosis and should not replace advice from a qualified healthcare professional.
    </div>
  `;
}

if (typeof window !== "undefined") {
  window.renderDashboard = renderDashboard;
  window.renderAssessment = renderAssessment;
}

NBHAS.reportRenderer.render();