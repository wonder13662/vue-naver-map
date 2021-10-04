<template>
  <BaseNaverMap
    :map-id="'default-map'"
    :height="'100vh'"
    :width="'100%'"
    :bounds="bounds"
    :markers="markers"
  />
</template>

<script>
import BaseNaverMap from '@/components/BaseNaverMap';

export default {
  name: 'DefaultMap',
  components: {
    BaseNaverMap,
  },
  data() {
    return {
      pickupPoint: {
        pickupPointLatitude: 37.51727487001841,
        pickupPointLongitude: 127.0396204383569,
      },
      dropPoint: {
        dropPointLatitude: 37.525102,
        dropPointLongitude: 127.0404008,
      },
    };
  },
  computed: {
    markers() {
      const {
        pickupPointLatitude,
        pickupPointLongitude,
      } = this.pickupPoint;

      const {
        dropPointLatitude,
        dropPointLongitude,
      } = this.dropPoint;

      return [
        {
          name: '픽업지',
          lat: pickupPointLatitude,
          lng: pickupPointLongitude,
        },
        {
          name: '배송지',
          lat: dropPointLatitude,
          lng: dropPointLongitude,
        },
      ];
    },
    bounds() {
      const {
        pickupPointLatitude,
        pickupPointLongitude,
      } = this.pickupPoint;

      const {
        dropPointLatitude,
        dropPointLongitude,
      } = this.dropPoint;

      const bounds = {
        sw: {
          lat: Math.min(pickupPointLatitude, dropPointLatitude),
          lng: Math.min(pickupPointLongitude, dropPointLongitude),
        },
        ne: {
          lat: Math.max(pickupPointLatitude, dropPointLatitude),
          lng: Math.max(pickupPointLongitude, dropPointLongitude),
        },
      };

      // 픽업지부터 도착지의 너비만큼 Padding offset을 추가해준다.
      // (픽업지와 도착지가 화면의 가운데에 보이도록 하기 위한 목적)
      // 1. latitude(위도) offset 구하기
      const latDiff = bounds.ne.lat - bounds.sw.lat;
      // 2. longitude(경도) offset 구하기
      const lngDiff = bounds.ne.lng - bounds.sw.lng;

      const {
        sw,
        ne,
      } = bounds;
      return {
        sw: {
          lat: sw.lat - latDiff,
          lng: sw.lng - lngDiff,
        },
        ne: {
          lat: ne.lat + latDiff,
          lng: ne.lng + lngDiff,
        },
      };
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
