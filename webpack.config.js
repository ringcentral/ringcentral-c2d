const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    library: 'RingCentralC2DInject',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  externals: {
    'libphonenumber-js': {
      commonjs: 'libphonenumber-js',
      commonjs2: 'libphonenumber-js',
      amd: 'libphonenumber-js',
      root: 'libphonenumber'
    }
  },
  resolve: {
    extensions: ['.ts', '.js' ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src/styles.css', to: 'styles.css' },
    ])
  ],
  optimization: {
    minimize: false
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
};
