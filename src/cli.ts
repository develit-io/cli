import { defineCommand, runMain } from 'citty'
import { createCommand } from './commands'

const main = defineCommand({
  meta: {
    name: 'develit',
    description: 'Develit CLI - Manage Service Workers',
  },
  subCommands: {
    'create': createCommand,
  },
})

runMain(main)
