#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import { runMain } from '../../dist/cli.mjs'

globalThis.__develit_cli__ = {
    startTime: Date.now(),
    entry: fileURLToPath(import.meta.url),
}

runMain()