import { existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const backendDir = join(rootDir, "t4f");
const frontendDir = join(rootDir, "react-client");
const setupOnly = process.argv.includes("--setup-only");
const isWindows = process.platform === "win32";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const dockerCommand = process.platform === "win32" ? "docker.exe" : "docker";

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function main() {
  ensureEnvFile();
  ensureDockerAvailable();
  const installedBackendDependencies = ensureDependencies(
    "backend",
    backendDir,
  );
  ensureDependencies("frontend", frontendDir);
  if (installedBackendDependencies) {
    run(
      "Generating Prisma client",
      npmCommand,
      ["run", "prisma:generate"],
      backendDir,
    );
  }
  run(
    "Starting PostgreSQL",
    dockerCommand,
    ["compose", "up", "-d"],
    backendDir,
  );
  await waitForPostgres();
  run(
    "Applying Prisma migrations",
    npmCommand,
    ["run", "prisma:migrate:dev"],
    backendDir,
  );

  if (setupOnly) {
    console.log("\nSetup complete.");
    return;
  }

  console.log("\nStarting API and frontend. Press Ctrl+C to stop both.\n");
  const backend = spawn(npmCommand, ["run", "dev"], {
    cwd: backendDir,
    stdio: "inherit",
    shell: isWindows,
  });
  const frontend = spawn(npmCommand, ["start"], {
    cwd: frontendDir,
    stdio: "inherit",
    shell: isWindows,
  });

  const stop = () => {
    backend.kill("SIGTERM");
    frontend.kill("SIGTERM");
  };

  process.on("SIGINT", () => {
    stop();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    stop();
    process.exit(143);
  });

  await Promise.race([onceExit(backend), onceExit(frontend)]);
  stop();
}

function ensureEnvFile() {
  const envPath = join(backendDir, ".env");
  if (existsSync(envPath)) {
    return;
  }

  copyFileSync(join(backendDir, ".env.example"), envPath);
  console.log("Created t4f/.env from t4f/.env.example");
}

function ensureDockerAvailable() {
  const result = spawnSync(dockerCommand, ["info"], {
    cwd: backendDir,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error(
      "Docker is not available. Start Docker Desktop, wait until it is running, then run `npm run dev` again.",
    );
  }
}

function ensureDependencies(label, directory) {
  if (existsSync(join(directory, "node_modules"))) {
    return false;
  }

  run(`Installing ${label} dependencies`, npmCommand, ["install"], directory);
  return true;
}

async function waitForPostgres() {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = spawnSync(
      dockerCommand,
      [
        "compose",
        "exec",
        "-T",
        "postgres",
        "pg_isready",
        "-U",
        "t4f",
        "-d",
        "t4f",
      ],
      {
        cwd: backendDir,
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    if (result.status === 0) {
      return;
    }

    await sleep(1000);
  }

  throw new Error("PostgreSQL did not become ready in time.");
}

function run(label, command, args, cwd) {
  console.log(`\n${label}...`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: isWindows,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed.`);
  }
}

function onceExit(child) {
  return new Promise((resolve) => {
    child.once("exit", resolve);
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
