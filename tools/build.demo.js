const path = require('path')
const webpack = require('webpack')
const babelConfig = require('../.babelrc.js')

const webpackConfig = {
  mode: 'production',
  resolve: {
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src')
    ]
  },
  context: path.resolve(__dirname, '../demo'),
  entry: './demo.js',
  output: {
    path: path.resolve(__dirname, '../docs/'),
    filename: 'demo.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({ minimize: true }),
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules\/.*/,
        loader: 'babel-loader',
        options: babelConfig
      }
    ]
  }
}

webpack(webpackConfig).run((err, stats) => {
  if (err) {
    throw err
  } else {
    console.log(stats.toString(webpackConfig.stats))
  }
})
