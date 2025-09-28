import { runMain as _runMain, defineCommand } from 'citty'
import { createCommand, generateWranglerCommand } from './commands'

export const main = defineCommand({
  meta: {
    name: 'develit',
    description: 'Develit CLI - Manage Service Workers',
  },
  subCommands: {
    'create': createCommand,
    'wrangler:generate': generateWranglerCommand,
  },
})

export const runMain = () => _runMain(main)
