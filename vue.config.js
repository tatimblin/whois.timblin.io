module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/sass/injected.scss";
        `
      }
    }
  }
}