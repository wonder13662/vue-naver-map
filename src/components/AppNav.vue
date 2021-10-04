<template>
  <v-card
    class="mx-auto"
    max-width="500"
    outlined
  >
    <v-card-text>
      <v-treeview
        hoverable
        dense
        activatable
        return-object
        :active="activeItems"
        :open="openItems"
        :items="items"
        @update:active="onChange"
      />
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  data: () => ({
    items: [
      {
        id: 10,
        name: '네이버 지도(기본)',
        url: '/default-map',
      },
      {
        id: 20,
        name: '네이버 지도(마커)',
        url: '/marker-map',
      },
      {
        id: 30,
        name: '네이버 지도(H3)',
        url: '/h3-map',
      },
    ],
    activeItems: [],
    openItems: [],
  }),
  created() {
    const { path } = this.$router.currentRoute;
    this.updateActiveItems(path);
  },
  methods: {
    updateActiveItems(path) {
      const openItems = [];
      const activeItems = [];
      this.items.forEach((parent) => {
        if (path === parent.url) {
          activeItems.push({
            ...parent,
          });
        }
        if (parent.children) {
          parent.children.forEach((child) => {
            if (path === child.url) {
              openItems.push({
                ...parent,
              });
              activeItems.push({
                ...child,
              });
            }
          });
        }
      });
      this.openItems = openItems;
      this.activeItems = activeItems;
    },
    onChange(activeItems) {
      if (!activeItems || activeItems.length === 0) return;

      const { url } = activeItems[0];
      if (!url) return;

      this.$router.push(url);
      this.updateActiveItems(url);
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
