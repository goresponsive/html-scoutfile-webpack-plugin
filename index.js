const path = require('path');
const fs = require('fs-extra');
const UglifyJS = require('uglify-js');

class ScoutFileHtmlWebpackPlugin {
  constructor(config = {}) {
    this._assetPublicPathOverwrite = config.assetPublicPathOverwrite;
    this._scoutFileTemplate = `
    function injectElement(options) {
      options = options || {};
      var parent = options.parent || 'body';
      var parentElement = document[parent] || document.getElementsByTagName(parent)[0];
      var el = document.createElement(options.tagName);

      for (var attr in options.attributes) {
        if (options.attributes.hasOwnProperty(attr)) {
          el.setAttribute(attr, options.attributes[attr]);
        }
      }
      parentElement.appendChild(el);
    }
    `;
  }

  apply(compiler) {
    // Hook into the html-webpack-plugin processing
    compiler.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData, callback) => {
        // Skip if the plugin configuration didn't set `scoutFile`
        if (!htmlPluginData.plugin.options.scoutFile) {
          return callback(null, htmlPluginData);
        }

        const filename = htmlPluginData.plugin.options.scoutFile;
        const result = Object.assign({}, htmlPluginData, {
          head: [],
          body: [
            {
              tagName: 'script',
              closeTag: true,
              attributes: {
                type: 'text/javascript',
                src: `${compiler.options.output.publicPath || ''}${filename}`
              }
            }
          ]
        });

        this.createScoutFile(compiler, filename, htmlPluginData)
          .then(() => callback(null, result))
          .catch(callback);
      });
    });
  }

  createScoutFile(compiler, filename, pluginData) {
    return new Promise((resolve, reject) => {
      fs
        .outputFile(path.resolve(compiler.options.output.path, filename), this.generateTemplate(pluginData))
        .then(resolve)
        .catch(reject);
    });
  }

  getAssetAttributes(asset) {
    if (typeof this._assetPublicPathOverwrite !== 'string') {
      return asset.attributes;
    }

    const { attributes } = asset;

    const sourceAttribute = attributes.hasOwnProperty('src') ? 'src' : 'href';
    const source = attributes[sourceAttribute];
    const filename = source ? source.split('/').pop() : 'SOURCE_NOT_FOUND';
    return Object.assign(attributes, { [sourceAttribute]: path.join(this._assetPublicPathOverwrite, filename) });
  }

  generateTemplate(pluginData) {
    const assets = [];

    pluginData.head.forEach(asset => {
      assets.push(Object.assign({}, asset, { parent: 'head', attributes: this.getAssetAttributes(asset) }));
    });

    pluginData.body.forEach(asset => {
      assets.push(Object.assign({}, asset, { parent: 'body', attributes: this.getAssetAttributes(asset) }));
    });

    return UglifyJS.minify(
      `(function() {${assets.reduce(
        (template, asset) => template.concat(`\ninjectElement(${JSON.stringify(asset)});`),
        this._scoutFileTemplate
      )}\n})();`
    ).code;
  }
}

module.exports = ScoutFileHtmlWebpackPlugin;
