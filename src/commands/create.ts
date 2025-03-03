import * as p from '@clack/prompts'
import { resolve } from 'pathe'
import { downloadTemplate } from 'giget'
import { defineCommand } from 'citty'
import { capitalize, replaceTemplateContent, execAsync } from '../utils'
import {checkTargetDirectory} from "../utils/overrideDirectory";

const DEFAULT_REGISTRY = 'github:develit-io/starter'

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
        options: [
          {
            label: 'Worker Entrypoint',
            value: 'worker-entrypoint'
          }
        ]
      })).toString()
    }

    const className = (await p.text({
      message: 'Enter class name',
      placeholder: projectName,
      defaultValue: projectName,
    })).toString()

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

      await replaceTemplateContent(__targetDir, projectName,className)

      copyTemplateSpinner.stop(`${projectName} Project created successfully!`)

      const installDeps = await p.confirm({
        message: 'Install dependencies ? ',
      })

      if (installDeps) {
        try {
          await p.tasks([
            {
              title: 'Installing dependencies via pnpm...',
              task: async (_) => {
                await execAsync('pnpm install', { cwd: __targetDir })
                return 'Installed dependencies via pnpm'
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
