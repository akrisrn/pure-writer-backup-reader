const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const context = path.join(__dirname, 'src');

module.exports = {
  node: false,
  target: 'node',
  externals: [
    nodeExternals(),
  ],
  context,
  entry: {
    main: './main.ts',
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@': context,
    },
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
};
