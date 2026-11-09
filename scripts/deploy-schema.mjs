import { spawnSync } from "node:child_process";

if (process.env.VERCEL !== "1") process.exit(0);

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["prisma", "db", "push"],
  { stdio: "inherit", shell: process.platform === "win32" },
);

if (result.error) {
  console.error("Failed to synchronize the Prisma schema:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
