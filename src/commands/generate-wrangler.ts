import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import * as fs from 'node:fs/promises'
import { resolve } from 'pathe'
import {
    execAsync
} from '../utils'
import { pathToFileURL } from 'node:url'

export const generateWranglerCommand = defineCommand({
  meta: {
    name: 'generate-wrangler',
    description: `Generate 'wrangler.jsonc' from 'wrangler.ts' file.`,
  },
  args: {
    types: {
      type: 'boolean',
      description: 'Generate Cloudflare types after creating wrangler.jsonc',
      default: false,
    },
  },
  async run({ args }) {
    p.intro('🚀 Develit CLI')

    const __workingDir = resolve(process.cwd())
    const copyTemplateSpinner = p.spinner()

    try {
      copyTemplateSpinner.start('Generating worker wrangler...')

      const wranglerTsPath = resolve(process.cwd(), './wrangler.ts')
      const wranglerPath = resolve(process.cwd(), './wrangler.jsonc')
      const tempDir = resolve(process.cwd(), '.wrangler-tmp')

      // Create temp directory
      await fs.mkdir(tempDir, { recursive: true })

      // Bundling wrangler.ts to clean ESM
      const buildResult = await Bun.build({
        entrypoints: [wranglerTsPath],
        outdir: tempDir,
        target: 'node',
        format: 'esm',
      })

      if (!buildResult.success) {
        const errors = buildResult.logs.filter(log => log.level === 'error')
        throw new Error(`Failed to bundle wrangler.ts: ${errors.map(e => e.message).join(', ')}`)
      }

      // Get the actual output file path from build result
      const wranglerJsPath = buildResult.outputs[0]?.path
      if (!wranglerJsPath) {
        throw new Error('Build succeeded but no output file was created')
      }

      const header = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT.
      // To make changes, update wrangler.ts and re-run the generation script.
      \n`

      const wranglerModule = await import(pathToFileURL(wranglerJsPath).href)
      const wranglerConfig = wranglerModule.default

      const body = JSON.stringify(wranglerConfig, null, 2)

      await fs.writeFile(wranglerPath, header + body)
      console.log(`✅ Generated wrangler.jsonc at '${wranglerPath}'.`)

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true })

      copyTemplateSpinner.stop(`The file 'wrangler.jsonc' created successfully!`)

      let cfTypegen: boolean | symbol = false
      if (args.types === true) {
        cfTypegen = true
      } else {
        cfTypegen = await p.confirm({
          message: 'bun cf:typegen? ',
        })
      }

      if (cfTypegen === true) {
        try {
          await p.tasks([
            {
              title: 'Generating Cloudflare types...',
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
      copyTemplateSpinner.stop(`Failed to generate 'wrangler.jsonc' file.`)
      p.log.error(`${error}`)
    }
  },
})
