import { writeFileSync } from 'fs'
import { transformFileSync } from '@babel/core'
import { compiler, beautify } from 'flowgen'
import { CompilerOptions, createCompilerHost, createProgram } from 'typescript'

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

const flowdef = compiler.compileDefinitionString(typescriptDeclaration)
writeFileSync('./index.js.flow', beautify(flowdef))
console.log('flow declarations successfully emitted')

const transpiled = transformFileSync(entryFile)?.code
if (transpiled) {
  writeFileSync('./index.js', transpiled)
  console.log('source code successfully emitted')
}
