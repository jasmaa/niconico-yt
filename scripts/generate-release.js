const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { program } = require("commander");

program
  .description("Generate release bundle")
  .option("--release-dir <releaseDir>", "Directory containing releases");

program.parse();

const options = program.opts();

const version = JSON.parse(fs.readFileSync("package.json")).version;

const releaseDir = options.releaseDir || ".";

// Validate dist and current version are the same.
// This is to prevent accidentally releasing old dists.
const distVersion = JSON.parse(fs.readFileSync("dist/manifest.json")).version;
if (distVersion !== version) {
  throw new Error(
    `error: dist version and package version are mismatched (${distVersion} != ${version}). Regenerate the dist.`
  );
}

console.log(`Generating release ${version}...`);

// Create dist bundle
console.log(`Generating release bundle...`);
const distOutputPath = path.join(releaseDir, `niconico-yt-${version}.zip`);
const distOutput = fs.createWriteStream(distOutputPath);
const distArchive = archiver("zip");
distArchive.pipe(distOutput);
distArchive.directory("dist", false);
distArchive.finalize();

// Create source code bundle
console.log(`Generating source bundle...`);
const sourceOutputPath = path.join(
  releaseDir,
  `niconico-yt-${version}-source.zip`
);
const sourceOutput = fs.createWriteStream(sourceOutputPath);
const sourceArchive = archiver("zip");
sourceArchive.pipe(sourceOutput);
for (const filePath of [
  "jest.config.js",
  "LICENSE",
  "package.json",
  "README.md",
  "sample.env",
  "tsconfig.json",
  "webpack.config.js",
  "yarn.lock",
]) {
  sourceArchive.file(filePath, { name: filePath });
}
for (const dirPath of ["src", "docs"]) {
  sourceArchive.directory(dirPath, dirPath);
}
sourceArchive.finalize();

console.log(`Done!`);
