const masterData = require("../dist/nbhas-master-data.json");
const NBHASEngine = require("./nbhas-engine");

const engine = new NBHASEngine(masterData);

const result = engine.evaluate({
  "SYM-0001": 4,
  "SYM-0002": 2,
  "SYM-0003": 1
});

console.log("NBHAS RESULT");
console.log("------------");

Object.values(result.scores).forEach(score => {
  console.log(`${score.title}: ${score.percent}% (${score.raw}/${score.max})`);
});

console.log("\nRECOMMENDATIONS");
console.log("---------------");

result.recommendations.forEach(rec => {
  console.log(`${rec.name}: ${rec.shortDescription}`);
});