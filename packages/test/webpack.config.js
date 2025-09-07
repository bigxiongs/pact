const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env = {}) => {
  const entryName = env.entry || 'index';
  return {
    entry: `./${entryName}.jsx`,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.jsx$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [new HtmlWebpackPlugin()],
    devServer: {
      host: 'localhost',
      port: '3000',
    },
    mode: 'development',
    devtool: 'source-map',
  };
};
