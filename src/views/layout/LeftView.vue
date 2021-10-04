<template>
  <div
    class="left-view--container"
  >
    <v-container
      fluid
      class="pa-0"
    >
      <AppNav />
    </v-container>
  </div>
</template>

<script>
import AppNav from '@/components/AppNav';

export default {
  name: 'LeftView',
  components: {
    AppNav,
  },
};
</script>

<style lang="scss" scoped>
.left-view--container {
  position: fixed;
  height: 100vh;
  width: 360px; /* FIX ME SCSS 변수 참조하도록 변경 */
  overscroll-behavior: contain ; /* Prevent SCROLL-CHAINING to parent elements. */
};
</style>
