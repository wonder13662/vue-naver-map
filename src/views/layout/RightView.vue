<template>
  <div>
    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container
        fluid
        class="pa-0"
      >
        <router-view />
      </v-container>
    </v-main>
  </div>
</template>

<script>
export default {
  name: 'RightView',
};
</script>

<style lang="scss" scoped>
</style>
