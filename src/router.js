import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/sites',
      name: 'sites',
      component: () => import('./views/Sites.vue'),
    },
    {
      path: '/txt',
      name: 'txt',
      component: () => import('./views/Txt.vue'),
    },
    {
      path: '/txt/:slug',
      name: 'txt-post',
      component: () => import('./views/TxtPost.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
});
