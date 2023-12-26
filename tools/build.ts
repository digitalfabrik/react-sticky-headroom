import { writeFileSync, copyFileSync } from 'fs'
import { CompilerOptions, createCompilerHost, createProgram } from 'typescript'
import { transformFileSync } from '@swc/core'

function compile (fileNames: string[], options: CompilerOptions): Record<string, string> {
  // Create a Program with an in-memory emit
  const createdFiles: Record<string, string> = {}
  const host = createCompilerHost(options)
  host.writeFile = (fileName: string, contents: string) =>
    (createdFiles[fileName] = contents)

  // Prepare and emit the d.ts files
  const program = createProgram(fileNames, options, host)
  program.emit()

  // Loop through all the input files
  return createdFiles
}

// We generate these files:
// * index.tsx (a copy of src/Headroom.tsx)                                             - using typescript
// * index.d.ts (which is the typescript declaration)                                   - using typescript
// * index.d.ts.map (the source map for index.d.ts)                                     - using typescript
// * index.js (which strips the typescript annotations and optimizes styled-components) - using swc
// * index.js.map (the source map for index.js)                                         - using swc
// * index.cjs (a CommonJS version of index.js for legacy tooling)                      - using swc
// * index.cjs.map (the source map for index.cjs)                                       - using swc

{
  // Generating index.tsx, index.d.ts, and index.d.ts.map

  copyFileSync('src/Headroom.tsx', 'index.tsx')
  console.log('emitted index.tsx')

  const createdFiles = compile(['index.tsx'], {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
    declarationMap: true
  })

  const declarationFileName = 'index.d.ts'
  if (!(declarationFileName in createdFiles)) {
    throw Error('Failed to generate index.d.ts')
  }
  writeFileSync('./index.d.ts', createdFiles[declarationFileName])
  console.log('emitted index.d.ts')

  const declarationMapFileName = 'index.d.ts.map'
  if (!(declarationMapFileName in createdFiles)) {
    throw Error('Failed to generate index.d.ts.map')
  }
  writeFileSync('./index.d.ts.map', createdFiles[declarationMapFileName])
  console.log('emitted index.d.ts.map')
}

{
  // Generating index.js and index.js.map
  const transpiled = transformFileSync('index.tsx', {
    minify: false,
    module: {
      type: 'es6'
    },
    jsc: {
      target: 'es2022',
      experimental: {
        plugins: [
          [
            '@swc/plugin-styled-components',
            {
              displayName: false,
              ssr: false
            }
          ]
        ]
      }
    },
    sourceMaps: true
  })

  if (!transpiled) {
    throw Error('Failed to generate index.js')
  }
  const codeWithSourceMapUrl = transpiled.code + '//# sourceMappingURL=index.js.map'

  writeFileSync('./index.js', codeWithSourceMapUrl)
  console.log('emitted index.js')

  const sourceMap = transpiled.map
  if (!sourceMap) {
    throw Error('Failed to generate index.js.map')
  }
  writeFileSync('./index.cjs.map', sourceMap)
  console.log('emitted index.js.map')
}

{
  // Generating index.cjs and index.cjs.map
  const transpiled = transformFileSync('index.tsx', {
    minify: false,
    module: {
      type: 'commonjs'
    },
    jsc: {
      target: 'es2022',
      experimental: {
        plugins: [
          [
            '@swc/plugin-styled-components',
            {
              displayName: false,
              ssr: false
            }
          ]
        ]
      }
    },
    sourceMaps: true
  })

  if (!transpiled) {
    throw Error('Failed to generate index.cjs')
  }
  const codeWithSourceMapUrl = transpiled.code + '//# sourceMappingURL=index.cjs.map'

  writeFileSync('./index.cjs', codeWithSourceMapUrl)
  console.log('emitted index.cjs')

  const sourceMap = transpiled.map
  if (!sourceMap) {
    throw Error('Failed to generate index.cjs.map')
  }
  writeFileSync('./index.cjs.map', sourceMap)
  console.log('emitted index.cjs.map')
}
