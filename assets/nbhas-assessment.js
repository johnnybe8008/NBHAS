/*
 * NBHAS Assessment Connector
 * Phase 2
 * Reads the assessment form, normalizes answers, and passes them to the NBHAS engine.
 */

window.NBHASAssessment = {
  collectAnswers() {
    const answers = {};

    console.log("NBHAS assessment collection started");

    return answers;
  },

  runAssessment() {
    const answers = this.collectAnswers();

    console.log("NBHAS answers:", answers);

    if (!window.NBHASEngine) {
      console.error("NBHAS engine not found");
      return;
    }

    const results = window.NBHASEngine.run(answers);

    console.log("NBHAS results:", results);

    if (window.NBHASRenderer) {
      window.NBHASRenderer.render(results);
    }

    return results;
  }
};