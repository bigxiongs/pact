const path = require('path');

exports.default = {
  entry: './index.js',
  output: {
    path: path.resolve('../dist'),
    filename: "index.js",
    library: {
      name: 'Pact',
      type: 'umd',
    },
    globalObject: 'this',
  },
  mode: "production",
};
