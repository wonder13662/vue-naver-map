<template>
  <v-app>
    <v-container
      fluid
      class="pa-0"
    >
      <v-row no-gutters>
        <v-col
          cols="4"
          class="left-col flex-grow-1 flex-shrink-0"
        >
          <LeftView />
        </v-col>
        <v-col
          cols="4"
          style=""
          class="right-col flex-grow-1 flex-shrink-0 right-col v-col--right"
        >
          <RightView />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import LeftView from './LeftView';
import RightView from './RightView';

export default {
  name: 'AdminLayout',
  components: {
    LeftView,
    RightView,
  },
};
</script>

<style lang="scss" scoped>
.left-col {
  min-width: 360px;
  max-width: 360px;
}
.right-col {
  max-width: 100%;
}
</style>
