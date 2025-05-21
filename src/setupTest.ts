// @flow

import 'raf/polyfill'

// $FlowFixMe
console.error = error => {
  throw Error(error)
}

// $FlowFixMe
console.warn = warn => {
  throw Error(warn)
}
