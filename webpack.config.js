// TODO: final test
const path = require('path');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    library: 'RingCentralC2D',
    libraryTarget: 'umd',
    libraryExport: 'RingCentralC2D',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: false,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.png|\.svg/i,
        use: 'url-loader',
      },
      {
        test: /\.sass|\.scss/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: `[path]_[name]_[local]_[hash:base64:5]`,
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [autoprefixer],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, 'src/themes')],
                outputStyle: 'expanded',
              },
            },
          },
        ],
      },
    ],
  },
};
