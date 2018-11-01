const fs = require('fs')
const babel = require('@babel/core')

const transpiled = babel.transformFileSync('./src/Headroom.js').code

fs.writeFileSync('./index.js', transpiled)

fs.copyFileSync('./src/Headroom.js', './index.js.flow')
