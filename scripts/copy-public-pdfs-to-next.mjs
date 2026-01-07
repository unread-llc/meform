import fs from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()
const publicDir = path.join(projectRoot, "public")
const nextDir = path.join(projectRoot, ".next")

async function exists(dirPath) {
  try {
    await fs.access(dirPath)
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await exists(nextDir))) {
    return
  }
  if (!(await exists(publicDir))) {
    return
  }

  const entries = await fs.readdir(publicDir, { withFileTypes: true })
  const pdfFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf"))
    .map((e) => e.name)

  await Promise.all(
    pdfFiles.map(async (fileName) => {
      const from = path.join(publicDir, fileName)
      const to = path.join(nextDir, fileName)
      await fs.copyFile(from, to)
    })
  )
}

await main()
