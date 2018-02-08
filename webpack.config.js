const WebpackObfuscator = require('webpack-obfuscator');
const webpack = require('webpack');

module.exports = {
  // エントリーポイントの設定
  entry: {
  'dist/vendor': [
      './lib/base64url',
      './lib/js-sha256-master/src/sha256',
      './lib/propellerkit/dist/js/propeller.min',
      './lib/bootstrap.min',
      './node_modules/chart.js/dist/chart.min',
      './node_modules/ng-file-upload/dist/ng-file-upload'
    ],
  'dist/app': './js/app.js'
　},

  // 出力の設定
output: {
    // 出力するファイル
    path: __dirname,
    filename: '[name]-bundle.js',
    // 出力先のパス
},
module: {
    loaders: [
        { test: /\.html$/, loader: 'html-loader' },
        { test: /\.css$/, loaders: ['style-loader','css-loader'] },
        { test: /\.(jpg|png)$/,loaders: 'url-loader'},
    ]
},
// devtool: 'source-map',
plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'dist/vendor',
      filename: '[name]-bundle.js',
      minChunks: Infinity
    }),
    // new WebpackObfuscator ({
    //   rotateUnicodeArray: true,
    // }),
  // 　new webpack.optimize.UglifyJsPlugin({
  //    sourceMap: true
  //  　})
]
};
