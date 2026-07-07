class NBHASEngine {
  constructor(masterData) {
    if (!masterData) {
      throw new Error("NBHASEngine requires masterData");
    }

    this.engineVersion = "1.0.0";
    this.masterData = masterData;

    this.context = {
      categories: new Map(),
      sections: new Map(),
      symptoms: new Map(),
      recommendations: new Map(),
      resources: new Map(),
      rules: [],
      rulesBySymptom: new Map(),
      maximumScores: new Map()
    };

    this.buildIndexes();
    this.calculateMaximumScores();
  }

 buildIndexes(){

  // Categories
  this.masterData.categories.forEach(category => {
    this.context.categories.set(category.CategoryID, category);
  });

  // Sections
  this.masterData.sections.forEach(section => {
    this.context.sections.set(section.SectionID, section);
  });

  // Symptoms
  this.masterData.symptoms.forEach(symptom => {
    this.context.symptoms.set(symptom.SymptomID, symptom);
  });

  // Recommendations
  this.masterData.recommendations.forEach(recommendation => {
    this.context.recommendations.set(
      recommendation.RecommendationID,
      recommendation
    );
  });

  // Resources
  this.masterData.resources.forEach(resource => {
    this.context.resources.set(resource.ResourceID, resource);
  });

  // Rules
  this.masterData.rules.forEach(rule => {

    this.context.rules.push(rule);

    if (!this.context.rulesBySymptom.has(rule.SymptomID)) {
      this.context.rulesBySymptom.set(rule.SymptomID, []);
    }

    this.context.rulesBySymptom
      .get(rule.SymptomID)
      .push(rule);

  });

}

 calculateMaximumScores() {
  this.context.rules.forEach(rule => {
    if (rule.Active !== "TRUE") return;
    if (rule.Operation !== "ADD") return;

    const categoryId = rule.CategoryID;
    const scoreValue = Number(rule.ScoreValue);
    const multiplier = Number(rule.Multiplier || 1);
    const maxContribution = scoreValue * multiplier * 4;

    const currentMax = this.context.maximumScores.get(categoryId) || 0;
    this.context.maximumScores.set(categoryId, currentMax + maxContribution);
  });
}
evaluate(answers) {
  const rawScores = this.applyRules(answers);
  const scores = this.calculateScorePercentages(rawScores);
  const recommendations = this.buildRecommendations(scores);

  return {
    meta: {
      engineVersion: this.engineVersion,
      knowledgeVersion: this.masterData.meta.version,
      evaluatedAt: new Date().toISOString()
    },
    scores,
    recommendations,
    warnings: [],
    errors: []
  };
}

applyRules(answers) {
  const rawScores = new Map();

  Object.entries(answers).forEach(([symptomId, answerValue]) => {
    const rules = this.context.rulesBySymptom.get(symptomId) || [];

    rules.forEach(rule => {
      if (rule.Active !== "TRUE") return;

      const categoryId = rule.CategoryID;
      const scoreValue = Number(rule.ScoreValue);
      const multiplier = Number(rule.Multiplier || 1);
      const answerMultiplier = Number(answerValue);

      const points = scoreValue * multiplier * answerMultiplier;
      const current = rawScores.get(categoryId) || 0;

      rawScores.set(categoryId, current + points);
    });
  });

  return rawScores;
}

calculateScorePercentages(rawScores) {
  const scores = {};

  rawScores.forEach((raw, categoryId) => {
    const max = this.context.maximumScores.get(categoryId) || 0;
    const percent = max > 0 ? (raw / max) * 100 : 0;
    const category = this.context.categories.get(categoryId);

    scores[categoryId] = {
      id: categoryId,
      title: category ? category.Title : categoryId,
      raw,
      max,
      percent: Math.round(percent * 10) / 10
    };
  });

  return scores;
}
buildRecommendations(scores) {
  const recommendations = [];

  Object.keys(scores).forEach(categoryId => {
    const category = this.context.categories.get(categoryId);
    if (!category || !category.RecommendationID) return;

    const recommendation = this.context.recommendations.get(category.RecommendationID);
    if (recommendation) {
    recommendations.push({
        id: recommendation.RecommendationID,
        name: recommendation.Name,
        shortDescription: recommendation.ShortDescription.replace(/^"|"$/g, ""),
        applicationInstructions: recommendation.ApplicationInstructions,
        emailTemplateId: recommendation.EmailTemplateID,
        pdfTemplateId: recommendation.PDFTemplateID,
        followUpDays: Number(recommendation.FollowUpDays)
    });
    }
  });

  return recommendations;
}
}
module.exports = NBHASEngine;