var path = require('path')
var PrerenderSpaPlugin = require('prerender-spa-plugin')

const productionPlugins = [
  new PrerenderSpaPlugin({
    staticDir: path.join(__dirname, `dist`),
    routes: [`/`, `/sites`],
    postProcess(renderedRoute) {
      // eslint-disable-next-line no-param-reassign
      renderedRoute.html = renderedRoute.html
        .replace(/<script (.*?)>/g, `<script $1 defer>`)
        .replace(`id="app"`, `id="app" data-server-rendered="true"`);

      return renderedRoute;
    },
    renderer: new PrerenderSpaPlugin.PuppeteerRenderer({
      // We need to inject a value so we're able to
      // detect if the page is currently pre-rendered.
      inject: {},
      // Our view component is rendered after the API
      // request has fetched all the necessary data,
      // so we create a snapshot of the page after the
      // `data-view` attribute exists in the DOM.
      renderAfterElementExists: `[data-view]`,
    }),
  }),
];

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/sass/injected.scss";
        `
      }
    }
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(...productionPlugins);
    }
  },
}
