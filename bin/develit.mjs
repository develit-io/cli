#!/usr/bin/env bun

import { fileURLToPath } from 'node:url'
import { runMain } from '../dist/index.mjs'

globalThis.__develit_cli__ = {
    startTime: Date.now(),
    entry: fileURLToPath(import.meta.url),
}

runMain()
