import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import * as fs from 'node:fs/promises'
import { resolve } from 'pathe'

import {
    execAsync
} from '../utils'

export const generateWranglerCommand = defineCommand({
  meta: {
    name: 'generate-wrangler',
    description: 'Generate Wrangler jsonc from wrangler.ts',
  },
  async run() {
    p.intro('🚀Develit CLI')

    const __workingDir = resolve(process.cwd())
    const copyTemplateSpinner = p.spinner()

    try {
      copyTemplateSpinner.start('Generating worker wrangler...')


      const wranglerTsPath = resolve(process.cwd(), './wrangler.ts')
      const wranglerPath = resolve(process.cwd(), './wrangler.jsonc')

      // Execute the wrangler.ts file using tsx and capture the output
      const { stdout } = await execAsync(`bunx tsx ${wranglerTsPath}`, { cwd: process.cwd() })
      const wranglerConfig = JSON.parse(stdout)

      const header = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT.
      // To make changes, update wrangler.ts and re-run the generation script.
      \n`

      const body = JSON.stringify(wranglerConfig, null, 2)

      await fs.writeFile(wranglerPath, header + body)
      console.log(`✅ Generated wrangler.jsonc at ${wranglerPath}`)


      copyTemplateSpinner.stop(`wrangler.jsonc created successfully!`)

      const cfTypegen = await p.confirm({
        message: 'bun cf:typegen? ',
      })

      if (cfTypegen) {
        try {
          await p.tasks([
            {
              title: 'generatin cloudflare types...',
              task: async (_) => {
                await execAsync('bun cf:typegen', { cwd: __workingDir })
                return 'Done! Cloudflare types generated successfully.'
              },
            },
          ])
        }
        catch (error) {
          p.log.error(`${error}`)
          p.outro('Operation failed.')
        }
      }

      p.outro(`Everything is ready to go! 🚀`)
    }
    catch (error) {
      copyTemplateSpinner.stop('Failed to generate wrangler.jsons')
      p.log.error(`${error}`)
    }
  },
})
