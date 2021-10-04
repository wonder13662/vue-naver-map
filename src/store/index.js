import Vue from 'vue';
import Vuex from 'vuex';
import error from './modules/error';

Vue.use(Vuex);

const store = new Vuex.Store({
  // https://vuex.vuejs.org/guide/strict.html#strict-mode
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    error,
  },
});

export default store;
