import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/cli'],
  outDir: 'dist',
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  failOnWarn: false,
})
