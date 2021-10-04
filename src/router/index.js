import Vue from 'vue';
import VueRouter from 'vue-router';
import map from './map';

Vue.use(VueRouter);

const routes = [
  ...map,
];
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
