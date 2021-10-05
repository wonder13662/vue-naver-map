<template>
  <BaseNaverMap
    :map-id="'sub-delivery-map'"
    :height="'100vh'"
    :width="'100%'"
    :draggable="true"
    :scroll-wheel="true"
    :hexagon-groups="hexagonGroups"
    :bound="bound"
  />
</template>

<script>
import hexagonGroupFactory from '@/lib/naverMap/hexagonGroupFactory';
import BaseNaverMap from '@/components/BaseNaverMap';
import sample from '@/assets/h3/sample.json';

export default {
  name: 'ControlRoomMapView',
  components: {
    BaseNaverMap,
  },
  computed: {
    physicalGroups() {
      const { directorGroups } = sample;
      const { DirectorGroupPhysicalGroups } = directorGroups[0];
      const result = [...DirectorGroupPhysicalGroups].map((v) => {
        const {
          name,
          physicalGroupId,
          type,
          PhysicalGroupH3Polygons,
        } = v.PhysicalGroup;
        const h3Indexes = PhysicalGroupH3Polygons.map((p) => (p.H3Polygon.h3Index));
        return {
          name,
          physicalGroupId,
          type,
          h3Indexes,
        };
      });

      return result;
    },
    hexagonGroups() {
      return this.physicalGroups.map((v) => (hexagonGroupFactory.createPhysicalGroup({
        h3Indexes: v.h3Indexes,
        physicalGroupName: v.name,
        driverCnt: 100, // TODO 임의로 넣어준 값. 나중에 서버와 연동해야 함.
        deliveryCnt: 100, // TODO 임의로 넣어준 값. 나중에 서버와 연동해야 함.
      })));
    },
    bound() {
      // TODO 경계 영역이 의도한 것도 다르게 동작하는 부분이 있음. 확인 필요!
      const bounds = this.hexagonGroups.map((v) => v.getBound());
      const mergedBound = bounds.reduce((acc, v) => {
        if (!acc) return v;
        return acc.merge(v);
      }, null);
      return mergedBound;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
