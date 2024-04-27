import Vue from 'vue';
import VueMeta from 'vue-meta';
import router from './router';
import App from './App.vue';
import '@/assets/sass/main.scss';

Vue.config.productionTip = false;

Vue.config.ignoredElements = [
  "spotify-player",
];

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true,
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
