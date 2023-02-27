const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  mode: 'development',
  entry: {
    main:'./main.js'
  },
  output: {
    path: 'C:/nlp/myChpter/BERT_NPM/',
    filename: 'bundle.js',
  },
  devServer: {
    port: 8090,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './index.html', to: 'index.html' }
      ]
    })
  ],
  devtool: 'inline-source-map',
  module: {
    rules: [
      // ... other rules
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
