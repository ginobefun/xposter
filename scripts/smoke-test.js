const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const manifest = readJson("manifest.json");
const pkg = readJson("package.json");

assert.equal(manifest.manifest_version, 3, "manifest must be MV3");
assert.equal(manifest.name, "xPoster", "manifest name must stay xPoster");
assert.equal(pkg.version, manifest.version, "package and manifest versions must match");

const requiredFiles = [
  "sidepanel.html",
  "sidepanel.css",
  "sidepanel.js",
  "diagnostics.html",
  "diagnostics.css",
  "diagnostics.js",
  "src/background.js",
  "src/content.js",
  "src/main-world.js",
  "src/shared.js",
  "fixtures/live-x-smoke.md",
  "assets/icon-16.png",
  "assets/icon-32.png",
  "assets/icon-48.png",
  "assets/icon-128.png"
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} is missing`);
}

for (const contentScript of manifest.content_scripts || []) {
  for (const file of contentScript.js || []) {
    assert.ok(fs.existsSync(path.join(root, file)), `content script ${file} is missing`);
  }
}

for (const resourceGroup of manifest.web_accessible_resources || []) {
  for (const file of resourceGroup.resources || []) {
    assert.ok(fs.existsSync(path.join(root, file)), `web resource ${file} is missing`);
  }
}

const shared = require(path.join(root, "src/shared.js"));
const fixture = fs.readFileSync(path.join(root, "fixtures/live-x-smoke.md"), "utf8");
const parsed = shared.parseMarkdown(fixture);
const counts = shared.segmentCounts(parsed.segments);
const plan = shared.buildPastePlan(parsed.segments);

assert.equal(parsed.title, "xPoster live smoke test", "frontmatter title should parse");
assert.ok(parsed.cover, "cover should parse");
assert.ok(counts.image >= 1, "fixture should include an image");
assert.ok(counts.table >= 1, "fixture should include a table");
assert.ok(counts.tweet >= 1, "fixture should include a tweet");
assert.ok(counts.code >= 1, "fixture should include a code block");
assert.ok(counts.divider >= 1, "fixture should include a divider");
assert.ok(plan.html.includes("__XPOSTER_"), "paste plan should include replacement markers");

console.log("xPoster smoke test passed");
