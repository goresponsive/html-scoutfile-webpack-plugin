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

module.exports = {
  entry: 'index.js',

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'My App',
      filename: 'index.html',
      // Name your scoutfile here
      scoutFile: 'scoutfile.js'
    }),

    // It is important that the HtmlWebpackPlugin is added before this plugin
    new ScoutFileWebpackPlugin()
  ]
};
```

### Options

Additionally, an `options` object can be passed to `new ScoutFileWebpackPlugin()`.

#### assetPublicPathOverwrite

If you find yourself in the situation where you need to serve up your `index.html` file from an arbitrary path, the relative paths to your assets will simply not work. For instances like that, use this setting to overwrite the path to fit your needs:

```javascript
new ScoutFileWebpackPlugin({
  assetPublicPathOverwrite: '../../path/to/your/assets/'
});
```
