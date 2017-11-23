# HTML Scoutfile Webpack Plugin

A Webpack plugin to create a single scoutfile for all your Webpack assets. Add a single small file that will inject all
your Webpack assets on load. It can be very useful in situations where your assets cannot be dynamically added to the
HTML file serving up your app/website. Add the scoutfile to your server-side template and ensure it is cache busted.

<!-- Blog post for this plugin coming... -->

Dependent on the [`html-webpack-plugin`](https://github.com/ampedandwired/html-webpack-plugin)

## Installation

Install with `npm`

```bash
npm i -D html-scoutfile-webpack-plugin
```

or with `yarn`

```bash
yarn add --dev html-scoutfile-webpack-plugin
```

## Usage

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScoutFileWebpackPlugin = require('html-scoutfile-webpack-plugin');

var webpackConfig = {
  entry: 'index.js',

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'My App',
      filename: 'assets/admin.html',
      // Name your scoutfile here
      scoutFile: 'scoutfile.js'
    }),

    // It is important that the HtmlWebpackPlugin is added before this plugin
    new ScoutFileWebpackPlugin()
  ]
};
```
