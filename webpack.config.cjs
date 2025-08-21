const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "index.js",
    library: {
      name: 'Pact',
      type: 'umd',
    },
    globalObject: 'this',
  },
  module: { rules: [] },
  plugins: [],
  devServer: {
    host: "localhost",
    port: "3000",
  },
  mode: "production",
  // devtool: "source-map",
};
