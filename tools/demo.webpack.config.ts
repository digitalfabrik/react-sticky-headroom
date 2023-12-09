import { resolve } from 'path'
import * as webpack from 'webpack'

const webpackConfig: webpack.Configuration = {
  mode: 'production',
  resolve: {
    modules: [resolve('./node_modules')],
    extensions: ['.js', '.ts', '.tsx']
  },
  context: resolve(__dirname, '../demo'),
  entry: './demo.tsx',
  output: {
    path: resolve(__dirname, '../docs/'),
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
        test: /\.tsx?$/,
        exclude: /node_modules\/.*/,
        loader: 'swc-loader',
        options: {
          jsc: {
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
          }
        }
      }
    ]
  }
}

export default webpackConfig
