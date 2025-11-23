const path = require('path');
const PrerenderSpaPlugin = require('prerender-spa-plugin');

// Read version from package.json with error handling
let packageVersion = 'unknown';
try {
  const packageJson = require('./package.json');
  if (packageJson && packageJson.version && typeof packageJson.version === 'string') {
    packageVersion = packageJson.version;
  } else {
    console.warn('Warning: Invalid or missing version in package.json, using fallback version');
  }
} catch (error) {
  console.warn('Warning: Could not read package.json, using fallback version:', error.message);
}

const productionPlugins = [
  new PrerenderSpaPlugin({
    staticDir: path.join(__dirname, 'dist'),
    routes: ['/', '/sites'],
    postProcess(renderedRoute) {
      renderedRoute.html = renderedRoute.html
        .replace(/<script (.*?)>/g, '<script $1 defer>')
        .replace('id="app"', 'id="app" data-server-rendered="true"');

      return renderedRoute;
    },
    renderer: new PrerenderSpaPlugin.PuppeteerRenderer({
      inject: {},
      renderAfterElementExists: '[data-view]',
    }),
  }),
];

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/sass/injected.scss";
        `,
      },
    },
  },
  configureWebpack: (config) => {
    // Add DefinePlugin to inject version constant
    const { DefinePlugin } = require('webpack');
    config.plugins.push(
      new DefinePlugin({
        __VERSION__: JSON.stringify(packageVersion),
      })
    );

    // Add rule to handle CSV files as raw text
    config.module.rules.push({
      test: /\.csv$/,
      use: 'raw-loader',
    });

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(...productionPlugins);
    }
  },
};
