import { spawnSync } from "node:child_process"

const packages = [
  "schema",
  "protocol",
  "effect-drizzle-sqlite",
  "effect-sqlite-node",
  "llm",
  "core",
  "server",
  "client",
  "sdk-next",
]

for (const packageName of packages) {
  const result = spawnSync("node", ["build.mjs"], {
    cwd: new URL(`../packages/${packageName}/`, import.meta.url),
    stdio: "inherit",
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
