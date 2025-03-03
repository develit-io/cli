import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { transformNameToClassName} from "./name"

async function replaceContent(filepath: string, replacer: (content: string) => string) {
  const content = await fs.readFile(filepath, 'utf8')
  await fs.writeFile(filepath, replacer(content))
}

export const execAsync = promisify(exec)

export const replaceWorkerTemplateContent = async (rootDir: string, projectName: string, className:string) => {
  const projectNameUpper = transformNameToClassName(projectName)

  await Promise.all([
    replaceContent(path.resolve(rootDir, 'package.json'), content => content.replace('template', projectName).replace('TemplateEnv',`${projectNameUpper}Env`)),
    replaceContent(path.resolve(rootDir, '@types/index.ts'), content => content.replaceAll('Template', className)),
    replaceContent(path.resolve(rootDir, 'src/index.ts'), content => content.replace('class Template', `class ${className}`).replace('TemplateEnv', `${projectNameUpper}Env`)),
    replaceContent(path.resolve(rootDir, 'wrangler.toml'), content => content.replace('template', `${projectName}`)),
    replaceContent(path.resolve(rootDir, 'worker-configuration.d.ts'), content => content.replace('TemplateEnv', `${projectNameUpper}Env`))
  ])
}

export const replaceNitroTemplateContent = async (rootDir: string, projectName: string)=> {
  await Promise.all([
      replaceContent(path.resolve(rootDir, 'wrangler.toml'), content => content.replace('template', projectName)),
      replaceContent(path.resolve(rootDir, 'package.json'), content => content.replace('template', projectName)),
  ])
}

