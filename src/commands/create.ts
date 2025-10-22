import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { downloadTemplate } from 'giget'
import { resolve } from 'pathe'
import {
    execAsync,
    replaceTemplateContent,
} from '../utils'
import { checkTargetDirectory } from "../utils/overrideDirectory"

const DEFAULT_REGISTRY = 'github:develit-io/starter'

// String values are branch names inside develit-starter
export enum Template {
  WORKER = 'worker-entrypoint',
  NITRO = 'nitro-orchestrator',
  MONO = 'monorepository'
}

const TEMPLATE_OPTIONS = [
  {
    label: 'Worker Entrypoint',
    value: Template.WORKER
  },
  {
    label: 'Nitro Orchestrator',
    value: Template.NITRO,
  },
  {
    label: 'Monorepository',
    value: Template.MONO,
  }
]

export const createCommand = defineCommand({
  meta: {
    name: 'create-worker',
    description: 'Create a New Develit Project',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Name of the project (folder)',
      required: false,
    },
    template: {
      type: 'string',
      alias: 't',
      description: 'The template for project',
      valueHint: 'worker-entrypoint',
      required: false,
    }
  },
  async run(ctx) {
    p.intro('🚀Develit CLI')

    let projectName = ctx.args.name
    let template = ctx.args.template

    if(!ctx.args.name) {
      projectName = (await p.text({
        message: 'Enter project name(folder)',
        placeholder: 'my-project',
      })).toString()
    }

    if(!ctx.args.template) {
      template = (await p.select({
        message: 'Select template',
        options: TEMPLATE_OPTIONS,
      })).toString()
    }

    let className = ''
    if(template === Template.WORKER) {
      className = (await p.text({
        message: 'Enter class name',
        placeholder: projectName,
        defaultValue: projectName,
      })).toString()
    }

    const __targetDir = resolve(process.cwd(), projectName)

    const override = await checkTargetDirectory(__targetDir)

    if(!override)
      process.exit(1)

    const copyTemplateSpinner = p.spinner()

    try {
      copyTemplateSpinner.start('Creating new Service Worker...')
      await downloadTemplate(`${DEFAULT_REGISTRY}#${template}`, {
        force: true,
        dir: __targetDir
      })

      await replaceTemplateContent(__targetDir, projectName, className)

      copyTemplateSpinner.stop(`${projectName} Project created successfully!`)

      const installDeps = await p.confirm({
        message: 'Install dependencies ? ',
      })

      if (installDeps) {
        try {
          await p.tasks([
            {
              title: 'Installing dependencies via Bun...',
              task: async (_) => {
                await execAsync('bun install', { cwd: __targetDir })
                return 'Installed dependencies via Bun.'
              },
            },
          ])
        }
        catch (error) {
          p.log.error(`${error}`)
          p.outro('Operation failed.')
        }
      }

      p.outro(`Navigate to ${projectName} and start building! 🚀`)
    }
    catch (error) {
      copyTemplateSpinner.stop('Failed to create Service Worker.')
      p.log.error(`${error}`)
    }
  },
})
