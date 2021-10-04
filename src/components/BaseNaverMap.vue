<template>
  <div
    :id="mapId"
    class="mainmap"
    :style="{ height: height, width: width }"
  />
</template>

<script>
import {
  NaverMapSubModule,
  NaverMap,
} from '@/lib/naverMap';
import { HexagonGroup } from '@/lib/naverMap/HexagonGroup';
import { Bound } from '@/lib/naverMap/Bound';

// TODO 정말 필요한 것인지 확인!
const mapSubModules = [
  NaverMapSubModule.drawing,
  NaverMapSubModule.geocoder,
  NaverMapSubModule.panorama,
  NaverMapSubModule.visualization,
];
export default {
  name: 'BaseNaverMap',
  props: {
    mapId: {
      type: String,
      required: true,
      validator(v) {
        // TODO kebab-case이어야 함. ex) id="naver-map-main"
        return !!v;
      },
    },
    height: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
    onLoaded: {
      type: Function,
      default: () => {},
    },
    onBoundChanged: {
      type: Function,
      default: () => {},
    },
    onZoomChanged: {
      type: Function,
      default: () => {},
    },
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.html#toc15__anchor
    // 지도의 초기 좌표 경계입니다.
    // 이 값을 설정하면 지도 옵션 중 center와 zoom 옵션을 무시하고,
    // 지정한 좌표 경계에 맞게 지도를 생성합니다.
    bound: {
      type: Bound,
      default: null,
    },
    // 마우스 또는 손가락을 이용한 지도 이동(패닝) 허용 여부입니다.
    draggable: {
      type: Boolean,
      default: false,
    },
    // 키보드 방향 키를 이용한 지도 이동(패닝) 허용 여부입니다.
    keyboardShortcuts: {
      type: Boolean,
      default: false,
    },
    // NAVER 로고 컨트롤의 표시 여부입니다. (항상 노출로 변경)
    logoControl: {
      type: Boolean,
      default: false,
    },
    // 지도 데이터 저작권 컨트롤의 표시 여부입니다.
    mapDataControl: {
      type: Boolean,
      default: false,
    },
    // 지도 유형 컨트롤의 표시 여부입니다.
    mapTypeControl: {
      type: Boolean,
      default: false,
    },
    // 핀치 제스처를 이용한 지도 확대/축소 허용 여부입니다.
    pinchZoom: {
      type: Boolean,
      default: false,
    },
    // 지도 축척 컨트롤의 표시 여부입니다.
    scaleControl: {
      type: Boolean,
      default: false,
    },
    // 마우스 스크롤 휠을 이용한 지도 확대/축소 허용 여부입니다.
    scrollWheel: {
      type: Boolean,
      default: false,
    },
    // 줌 컨트롤의 표시 여부입니다.
    zoomControl: {
      type: Boolean,
      default: false,
    },
    // 마커 배열
    markers: {
      type: Array,
      default: () => ([]),
      validator(v) {
        // TODO 마커의 데이터를 고도화해야 함
        return !v.find((item) => !item);
      },
    },
    // 거리 polyline 배열
    polylineDistances: {
      type: Array,
      default: () => ([]),
      validator(v) {
        // TODO Naver의 coord 타입이 맞는지 확인필요
        return !v.find((item) => {
          if (!item) return false;
          if (!item.lat || !item.lng) return false;
          return true;
        });
      },
    },
    // HexagonGroup class의 instance 배열
    hexagonGroups: {
      type: Array,
      default: () => ([]),
      validator(v) {
        if (!v || v.length === 0) return true;
        const found = v.find((e) => !(e instanceof HexagonGroup));
        return !found;
      },
    },
  },
  data() {
    return {
      naverMap: null,
    };
  },
  watch: {
    markers(val) {
      this.naverMap.removeAllMarkers();
      if (val && val.length > 0) {
        this.naverMap.addMarkers(val);
      }
    },
    polylineDistances(val) {
      this.naverMap.removeAllPolylines();
      if (val && val.length > 0) {
        this.naverMap.addPolylineDistances(val);
      }
    },
    bound(val) {
      if (val && this.naverMap.hasLoaded()) {
        this.naverMap.fitBounds(val);
      }
    },
    hexagonGroups(val) {
      this.naverMap.removeAllHexagonGroups();
      if (val && val.length > 0) {
        this.naverMap.addHexagonGroups(val);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initMaps();
      document.getElementsByTagName('html')[0].style = 'overflow: hidden';
    });
  },
  beforeDestroy() {
    document.getElementsByTagName('html')[0].style = '';
    if (this.naverMap) this.naverMap.destroy();
  },
  methods: {
    initMaps() {
      this.naverMap = new NaverMap(this.mapId, document);
      this.naverMap.initNaverMaps({
        onLoadingFinished: this.onMapLoadingFinished,
        useGovAPI: false,
        subModules: mapSubModules,
        clientId: process.env.VUE_APP_NAVER_MAP_API_KEY || '',
        mapOptions: {
          draggable: this.draggable,
          keyboardShortcuts: this.keyboardShortcuts,
          logoControl: this.logoControl,
          mapDataControl: this.mapDataControl,
          mapTypeControl: this.mapTypeControl,
          pinchZoom: this.pinchZoom,
          scaleControl: this.scaleControl,
          scrollWheel: this.scrollWheel,
          zoomControl: this.zoomControl,
        },
      });
    },
    onMapLoadingFinished() {
      this.onLoaded();
      this.setCallbackOnBoundChanged(this.onBoundChanged);
      this.setCallbackOnZoomChanged(this.onZoomChanged);

      // Naver map이 로딩된 이후의 해야할 일들을 진행한다.
      if (this.bound && this.naverMap.hasLoaded()) {
        this.naverMap.fitBounds(this.bound);
      }
      this.naverMap.removeAllMarkers();
      this.naverMap.removeAllPolylines();

      if (this.markers && this.markers.length > 0) {
        this.naverMap.addMarkers(this.markers);
      }
      if (this.polylineDistances) {
        this.naverMap.addPolylineDistances(this.polylineDistances);
      }
      if (this.hexagonGroups && this.hexagonGroups.length > 0) {
        this.naverMap.addHexagonGroups(this.hexagonGroups);
      }
    },
    setCallbackOnBoundChanged(callback) {
      this.naverMap.setCallbackOnBoundChanged(callback);
    },
    setCallbackOnZoomChanged(callback) {
      this.naverMap.setCallbackOnZoomChanged(callback);
    },
  },
};
</script>

<style lang="scss" scoped>
.mainmap {
  border: solid 0.05em rgba(0, 0, 0, 0.6);
}
</style>
