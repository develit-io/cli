import { defineCommand, runMain as _runMain } from 'citty'
import { createCommand } from './commands'

export const main = defineCommand({
  meta: {
    name: 'develit',
    description: 'Develit CLI - Manage Service Workers',
  },
  subCommands: {
    'create': createCommand,
  },
})

export const runMain = _runMain(main)
