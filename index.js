const path = require('path');
const fs = require('fs-extra');
const UglifyJS = require('uglify-js');

class ScoutFileHtmlWebpackPlugin {
  constructor(config = {}) {
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
    this.publicPathOverwrite = config.publicPathOverwrite;
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
                src: `${this.publicPathOverwrite || compiler.options.output.publicPath || ''}${filename}`
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

  generateTemplate(pluginData) {
    const assets = [];

    pluginData.head.forEach(asset => {
      assets.push(Object.assign({}, asset, { parent: 'head' }));
    });

    pluginData.body.forEach(asset => {
      assets.push(Object.assign({}, asset, { parent: 'body' }));
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
