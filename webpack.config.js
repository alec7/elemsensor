const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  target: 'electron',
  entry: [
    './src/app.js',
    './src/app.scss',
    './node_modules/chartist/dist/chartist.min.css',
    './node_modules/vex-js/dist/css/vex.css',
    './node_modules/vex-js/dist/css/vex-theme-os.css'
  ],
  plugins: [
    new WebpackNotifierPlugin()
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js'
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'sass-loader'
        }]
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
        }
      }
    ]
  }
};
