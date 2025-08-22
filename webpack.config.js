import path from 'path';

export default {
  entry: './index.js',
  output: {
    path: path.resolve('./dist'),
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
};
