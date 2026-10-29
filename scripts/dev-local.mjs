import { spawnSync } from "node:child_process";
import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
const schemaPath = path.join(root, "prisma", ".schema.local.prisma");

async function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envText = await readFile(path.join(root, ".env"), "utf8");
  const line = envText.match(/^\s*DATABASE_URL\s*=\s*(.*?)\s*$/m)?.[1];
  return line?.replace(/^["']|["']$/g, "");
}

function runNode(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${path.basename(script)} exited with status ${result.status ?? "unknown"}.`);
}

async function main() {
  const databaseUrl = await readDatabaseUrl();
  if (!databaseUrl?.startsWith("file:")) {
    throw new Error("Local development requires DATABASE_URL to use a local SQLite file (file:...).");
  }

  const schema = await readFile(path.join(root, "prisma", "schema.prisma"), "utf8");
  const postgresProvider = /provider\s*=\s*"postgresql"/g;
  const localSchema = schema.replace(postgresProvider, 'provider = "sqlite"');
  if (localSchema === schema) {
    throw new Error("Could not create the local SQLite schema from prisma/schema.prisma.");
  }

  try {
    await writeFile(schemaPath, localSchema);
    runNode(prismaCli, ["generate", "--schema", schemaPath]);
    runNode(prismaCli, ["db", "push", "--schema", schemaPath]);
  } finally {
    await rm(schemaPath, { force: true });
  }

  runNode(nextCli, ["dev", ...process.argv.slice(2)]);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
