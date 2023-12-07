import { writeFileSync } from 'fs'
import { CompilerOptions, createCompilerHost, createProgram } from 'typescript'
import { transformFileSync } from '@swc/core'
const entryFile = 'src/Headroom.tsx'

function compile (fileNames: string[], options: CompilerOptions): Record<string, string> {
  // Create a Program with an in-memory emit
  const createdFiles: Record<string, string> = {}
  const host = createCompilerHost(options)
  host.writeFile = (fileName: string, contents: string) => (createdFiles[fileName] = contents)

  // Prepare and emit the d.ts files
  const program = createProgram(fileNames, options, host)
  program.emit()

  // Loop through all the input files
  return createdFiles
}

// Run the compiler
const createdFiles = compile([entryFile], {
  allowJs: true,
  declaration: true,
  emitDeclarationOnly: true
})

const typescriptDeclaration = createdFiles[entryFile.replace('.tsx', '.d.ts')]
writeFileSync('./index.d.ts', typescriptDeclaration)
console.log('typescript declarations successfully emitted')

const transpiled = transformFileSync(entryFile, {
  minify: true
})?.code
if (transpiled) {
  writeFileSync('./index.js', transpiled)
  console.log('source code successfully emitted')
}
