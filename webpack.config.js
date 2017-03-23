const path = require('path');

module.exports = {
  entry: './src/index.es',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'StateEncodeRouterPresetSchemapack',
    libraryTarget: 'umd',
  },
  externals: [
    'lodash',
    'schemapack',
  ],
  module: {
    loaders: [
      { test: /\.es$/, loader: "babel-loader" },
    ],
  },
};
