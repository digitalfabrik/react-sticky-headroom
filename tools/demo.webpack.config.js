import { resolve } from 'path'
import webpack from 'webpack'

/** @type {import('webpack').Configuration} */
const webpackConfig = {
  mode: 'production',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  context: resolve(import.meta.dirname, '../demo'),
  entry: './demo.tsx',
  devtool: 'source-map',
  output: {
    path: resolve(import.meta.dirname, '../docs/'),
    filename: 'demo.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.LoaderOptionsPlugin({ minimize: true }),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?|\.js$/,
        loader: 'swc-loader',
        options: {
          jsc: {
            experimental: {
              plugins: [
                [
                  '@swc/plugin-emotion',
                  {
                    displayName: false,
                    ssr: false,
                    sourceMap: false,
                  },
                ],
              ],
            },
          },
        },
      },
    ],
  },
}

export default webpackConfig
