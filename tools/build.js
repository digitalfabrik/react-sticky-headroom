const fs = require('fs')
const babel = require('@babel/core')

const transpiled = babel.transformFileSync('./src/Headroom.js').code

if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist')
}
fs.writeFileSync('./dist/index.js', transpiled)

fs.copyFileSync('./src/Headroom.js', './dist/index.js.flow')
