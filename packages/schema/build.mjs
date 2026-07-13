import { readFile, readdir, rm } from "node:fs/promises"
import path from "node:path"
import { build } from "esbuild"

const source = path.resolve("src")

async function entries(directory) {
  const items = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    items.map((item) => {
      const file = path.join(directory, item.name)
      if (item.isDirectory()) return entries(file)
      if (!/\.(?:ts|tsx)$/.test(item.name) || /\.d\.ts$/.test(item.name)) return []
      return [file]
    }),
  )
  return nested.flat()
}

await rm("dist", { recursive: true, force: true })
await build({
  entryPoints: await entries(source),
  outdir: "dist",
  outbase: source,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  packages: "external",
  external: ["#sqlite", "#pty", "#fff"],
  entryNames: "[dir]/[name]",
  chunkNames: "_chunks/[name]-[hash]",
  assetNames: "_assets/[name]-[hash]",
  loader: {
    ".md": "text",
    ".txt": "text",
    ".wasm": "file",
    ".node": "file",
  },
  plugins: [
    {
      name: "text-import-attributes",
      setup(build) {
        build.onLoad({ filter: /\.tsx?$/ }, async (args) => ({
          contents: (await readFile(args.path, "utf8")).replace(
            /(\.(?:md|txt)["'])\s+with\s+\{\s*type:\s*["']text["']\s*\}/g,
            "$1",
          ),
          loader: args.path.endsWith(".tsx") ? "tsx" : "ts",
        }))
      },
    },
  ],
})
