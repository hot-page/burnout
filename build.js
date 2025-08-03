import * as fs from 'fs/promises'
import * as path from 'path'

(async function buildPrompts() {
  const parts = await readDir('./parts')
  const prompts = await readDir('./prompts')
  const compiled = Object.keys(prompts).reduce((output, promptName) => {
    output[promptName] = prompts[promptName].replace(/\{\{(\w+)\}\}/g, (match, partName) => {
      if (parts[partName]) {
        return parts[partName]
      }
      console.error(`Part '${partName}' not found, leaving placeholder: ${match}`)
      return match
    })
    return output
  }, {})
  fs.writeFile('./prompts.json', JSON.stringify(compiled, null, 2))
})()

async function readDir(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true })
  const output = {}
  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith('.md')) continue
    try {
      output[path.basename(file.name, '.md')] = await fs.readFile(
        path.join(file.parentPath, file.name),
        'utf-8',
      )
    } catch (error) {
      console.error(`Error reading file ${file.name}:`, error);
    }
  }
  return output
}

