import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

import '@/assets/sass/main.scss'
import router from './router'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

// During pre-rendering the initial state is
// injected into the global scope, here we
// fill the store with the initial state.
if (window.__INITIAL_STATE__) store.replaceState(window.__INITIAL_STATE__);

router.beforeResolve(async (to, from, next) => {
  try {
    const components = router.getMatchedComponents(to);

    // By using `await` we make sure to wait
    // for the API request made by the `fetch()`
    // method to resolve before rendering the view.
    await Promise.all(components.map(x => x.fetch && x.fetch({ store })));

    // The `injectInitialState()` function injects
    // the current state as a global variable
    // `__INITIAL_STATE__` if the page is currently
    // pre-rendered.
    if (window.__PRERENDER_INJECTED) injectInitialState(store.state);
  } catch (error) {
    // This is the place for error handling in
    // case the API request fails for example.
    console.log(error);
  }

  return next();
});

app.$mount('#app');
