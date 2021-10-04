<template>
  <BaseNaverMap
    :map-id="'default-map'"
    :height="'100vh'"
    :width="'100%'"
    :bound="bound"
    :markers="markers"
    :polyline-distances="polylineDistances"
    :draggable="true"
    :scroll-wheel="true"
    :zoom-control="true"
  />
</template>

<script>
import BaseNaverMap from '@/components/BaseNaverMap';
import boundFactory from '@/lib/naverMap/boundFactory';

export default {
  name: 'MarkerMap',
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
        info: pickupPointInfo,
      } = this.pickupPoint;

      const {
        dropPointLatitude,
        dropPointLongitude,
        info: dropPointInfo,
      } = this.dropPoint;

      return [
        {
          name: '출발',
          lat: pickupPointLatitude,
          lng: pickupPointLongitude,
          color: 'red',
          bgColor: 'black',
          info: pickupPointInfo,
        },
        {
          name: '도착',
          lat: dropPointLatitude,
          lng: dropPointLongitude,
          color: 'yellow',
          bgColor: 'grey',
          info: dropPointInfo,
        },
      ];
    },
    polylineDistances() {
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
          start: {
            lat: pickupPointLatitude,
            lng: pickupPointLongitude,
          },
          end: {
            lat: dropPointLatitude,
            lng: dropPointLongitude,
          },
        },
      ];
    },
    bound() { // TODO SubDeliveryMap.vue와 DeliveryMap.vue가 같은 로직을 공유하고 있음. 한군데서 모아서 활용 필요.
      const {
        pickupPointLatitude,
        pickupPointLongitude,
      } = this.pickupPoint;

      const {
        dropPointLatitude,
        dropPointLongitude,
      } = this.dropPoint;

      const bound = {
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
      const latDiff = bound.ne.lat - bound.sw.lat;
      // 2. longitude(경도) offset 구하기
      const lngDiff = bound.ne.lng - bound.sw.lng;

      const {
        sw,
        ne,
      } = bound;

      const result = {
        sw: {
          lat: sw.lat - latDiff,
          lng: sw.lng - lngDiff,
        },
        ne: {
          lat: ne.lat + latDiff,
          lng: ne.lng + lngDiff,
        },
      };

      return boundFactory.createBound(result.sw, result.ne);
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
