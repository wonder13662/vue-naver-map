import Vue from 'vue';
import plugins from '@/plugins';
import router from './router';
import store from './store';
import App from './App';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  ...plugins,
  render: (h) => h(App),
}).$mount('#app');
