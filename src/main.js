import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

import '@/assets/sass/main.scss'
import router from './router'
import VueMeta from 'vue-meta'

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
