var path = require('path')
var PrerenderSpaPlugin = require('prerender-spa-plugin')

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
  configureWebpack: config => {
    if (process.env.NODE_ENV !== 'production') return

    return {
      plugins: [
        new PrerenderSpaPlugin(
          // Absolute path to compiled SPA
          path.resolve(__dirname, 'dist'),
          // List of routes to prerender
          [ '/', '/sites', ],
        ),
      ]
    }
  }
}