import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/index'],
  declaration: true,
  rollup: {
    dts: {
      respectExternal: false,
    },
    inlineDependencies: true,
    resolve: {
      exportConditions: ['production', 'node'],
    },
  },
  failOnWarn: false,
  externals: [
    '@nuxt/test-utils',
    'fsevents',
    'node:url',
    'node:buffer',
    'node:path',
    'node:child_process',
    'node:process',
    'node:path',
    'node:os',
  ],
})
