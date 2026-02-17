const path = require('path');
const fs = require('fs');
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

// Extract blog post slugs from txt-posts.js for prerendering
function getTxtRoutes() {
  const routes = ['/txt'];
  try {
    const content = fs.readFileSync(path.join(__dirname, 'src/txt-posts.js'), 'utf-8');
    const slugMatches = content.match(/slug:\s*['"]([^'"]+)['"]/g);
    if (slugMatches) {
      slugMatches.forEach((match) => {
        const slug = match.match(/slug:\s*['"]([^'"]+)['"]/)[1];
        routes.push(`/txt/${slug}`);
      });
    }
  } catch (error) {
    console.warn('Warning: Could not read txt-posts.js for prerender routes:', error.message);
  }
  return routes;
}

const productionPlugins = [
  new PrerenderSpaPlugin({
    staticDir: path.join(__dirname, 'dist'),
    routes: ['/', '/sites', ...getTxtRoutes()],
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
