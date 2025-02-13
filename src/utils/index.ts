import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { transformNameToClassName} from "./name"

async function replaceContent(filepath: string, replacer: (content: string) => string) {
  const content = await fs.readFile(filepath, 'utf8')
  await fs.writeFile(filepath, replacer(content))
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const replaceTemplateContent = async (rootDir: string, projectName: string) => {
  const className = transformNameToClassName(projectName)

  await Promise.all([
    replaceContent(path.resolve(rootDir, 'package.json'), content => content.replace('template', projectName)),
    replaceContent(path.resolve(rootDir, '@types/index.ts'), content => content.replaceAll('Template', className)),
    replaceContent(path.resolve(rootDir, 'src/index.ts'), content => content.replace('class Template', `class ${className}`)),
    replaceContent(path.resolve(rootDir, 'wrangler.toml'), content => content.replace('template', `${projectName}`)),
    replaceContent(path.resolve(rootDir, 'worker-configuration.d.ts'), content => content.replace('TemplateEnv', `${className}Env`))
  ])
}

export const execAsync = promisify(exec)
