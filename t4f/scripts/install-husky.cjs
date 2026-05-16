const { existsSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { execFileSync } = require("node:child_process");

const repoRoot = resolve(__dirname, "..", "..");

if (!existsSync(join(repoRoot, ".git"))) {
  process.exit(0);
}

const huskyBin = join(__dirname, "..", "node_modules", "husky", "bin.js");

execFileSync(process.execPath, [huskyBin, ".husky"], {
  cwd: repoRoot,
  stdio: "inherit",
});
