/* eslint-disable no-undef */
import {
  scriptLoad,
} from './scriptLoader';
import markerFactory from './markerFactory';
import polylineFactory from './polylineFactory';

// TODO 정말 필요한 것인지 확인!
export const NaverMapSubModule = (() => {
  const object = {
    drawing: 'drawing',
    geocoder: 'geocoder',
    panorama: 'panorama',
    visualization: 'visualization',
  };
  Object.freeze(object);
  return object;
})();

const NAVER_MAPS_SRC_ID = 'naver-map-src';

/**
 * Naver map의 그리기 도구를 초기화합니다. 경계 그리기에 사용합니다.
 * https://navermaps.github.io/maps.js.ncp/docs/naver.maps.drawing.DrawingManager.html
 * https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-drawing-options.example.html
 *
 * @return {object} Naver 맵 drawingManager
 */
const setDrawingManager = (naver, map) => (new naver.maps.drawing.DrawingManager({
  map,
  drawingControl: [
    naver.maps.drawing.DrawingMode.RECTANGLE,
  ],
  drawingControlOptions: {
    position: naver.maps.Position.RIGHT_CENTER,
    style: naver.maps.drawing.DrawingStyle.VERTICAL,
  },
}));
export class NaverMap {
  constructor(mapId, document) {
    this.naver = null;
    this.map = null;
    this.mapId = mapId;
    this.document = document;
    this.polylinesOnMap = [];
    this.markersOnMap = [];
    this.hexagonGroupsOnMap = [];
    this.drawingManager = null;
  }

  initNaverMaps({
    onLoadingFinished,
    useGovAPI,
    subModules,
    clientId,
    mapOptions,
  }) {
    if (!clientId) throw new Error('clientId가 유효하지 않습니다.');

    // 1. 이미 naverMap이 DOM에 만들어져 있다면, 이것을 사용한다.
    if (this.hasNaverScriptLoaded()) {
      this.loadNaverMaps(onLoadingFinished, mapOptions);
      return;
    }

    // 2. naverMap이 DOM에 없다. 새로 만든다.
    const apiType = useGovAPI ? 'gov' : 'ncp';
    const subModulesQuery = subModules ? `submodules=${subModules.join(',')}` : '';
    const params = `${apiType}ClientId=${clientId}&${subModulesQuery}`;
    const url = `https://openapi.map.naver.com/openapi/v3/maps.js?${params}`;
    scriptLoad({
      id: NAVER_MAPS_SRC_ID,
      url,
      async: true,
      defer: true,
      onLoad: () => {
        window.naver.maps.onJSContentLoaded = () => {
          this.loadNaverMaps(onLoadingFinished, mapOptions);
        };
      },
      onError: null,
    });
  }

  loadNaverMaps(
    onLoadingFinished = () => {},
    mapOptions = null,
  ) {
    this.naver = window.naver;
    const { naver } = this;

    // size 옵션을 생략해야 map DOM 요소의 HTML 렌더링 크기로 자동으로 조정됨.
    this.map = new naver.maps.Map(
      this.mapId,
      mapOptions,
    );

    markerFactory.setNaver(naver);
    markerFactory.setMap(this.map);

    polylineFactory.setNaver(naver);
    polylineFactory.setMap(this.map);

    this.drawingManager = setDrawingManager(naver, this.map);

    naver.maps.Event.once(this.map, 'init_stylemap', () => {
      onLoadingFinished();
    });
  }

  /**
   * Naver 지도 클래스와 Naver 지도 객체가 준비되었는지 확인합니다.
   *
   * @return {boolean} 지도 클래스와 지도 객체가 있는지 알려주는 플래그
   */
  hasLoaded() {
    return !!this.naver && !!this.map;
  }

  hasNaverScriptLoaded() {
    return !!this.document.getElementById(NAVER_MAPS_SRC_ID);
  }

  // 두 구간의 거리를 표시해줍니다
  addPolylineDistances(coords) {
    if (!coords) throw new Error('지도에 그릴 폴리라인의 좌표 배열(coords)이 유효하지 않습니다.'); // TODO CUSTOM_ERROR 및 ERROR 매핑 작업 필요

    const found = coords.findIndex((item) => {
      const { start, end } = item;
      return !start || !end;
    });
    if (found > -1) throw new Error(`${found}번의 coord이 지도에 그릴 폴리라인의 시작점과 끝점이 유효하지 않습니다.`); // TODO CUSTOM_ERROR 및 ERROR 매핑 작업 필요

    this.polylinesOnMap = coords.map((v) => {
      const { start, end } = v;
      const {
        remove,
      } = polylineFactory.createDistanceLine({ start, end });

      return {
        ...v,
        remove,
      };
    });
  }

  addHexagonGroups(hexagonGroups) {
    const { naver, map } = this;
    if (!naver || !map) return;

    if (!hexagonGroups || hexagonGroups.length === 0) throw new Error('지도에 그릴 hexagonGroup 정보가 유효하지 않습니다.'); // TODO CUSTOM_ERROR 및 ERROR 매핑 작업 필요
    this.hexagonGroupsOnMap = hexagonGroups;
    this.hexagonGroupsOnMap.forEach((v) => {
      v.setNaver(naver);
      v.setMap(map);
      v.draw();
    });
  }

  addMarkers(markers) {
    if (!markers || markers.length === 0) throw new Error('지도에 그릴 마커 정보가 유효하지 않습니다.'); // TODO CUSTOM_ERROR 및 ERROR 매핑 작업 필요
    if (!naver) throw new Error('네이버 지도 Api가 유효하지 않습니다.');

    this.markersOnMap = markers.map((v) => {
      const {
        name,
        lat,
        lng,
        color,
        bgColor,
        info,
      } = v;

      // 1. 마커 추가
      const {
        remove,
        focus,
        blur,
        setAnimationBounce,
        removeAnimationBounce,
      } = markerFactory.createDefaultMarker({
        lat,
        lng,
        name,
        color,
        bgColor,
        info,
      });

      return {
        ...v,
        remove,
        focus,
        blur,
        setAnimationBounce,
        removeAnimationBounce,
      };
    });
  }

  removeAllHexagonGroups() {
    if (!this.hexagonGroupsOnMap || this.hexagonGroupsOnMap.length === 0) return;
    this.hexagonGroupsOnMap.forEach((v) => v.remove());
    this.hexagonGroupsOnMap = [];
  }

  removeAllMarkers() {
    if (!this.markersOnMap || this.markersOnMap.length === 0) return;
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.OverlayView.html
    // 지도에서 마커를 제거할 때는 setMap(null)을 사용합니다.
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.OverlayView.html#setMap__anchor
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Marker.html
    this.markersOnMap.forEach((item) => {
      item.remove();
    });
    this.markersOnMap = [];
  }

  removeAllPolylines() {
    if (!this.polylinesOnMap || this.polylinesOnMap.length === 0) return;

    this.polylinesOnMap.forEach((item) => {
      item.remove();
    });
    this.polylinesOnMap = [];
  }

  fitBounds(bound) {
    if (!bound) throw new Error('지도 경계 정보가 유효하지 않습니다.'); // TODO CUSTOM_ERROR 및 ERROR 매핑 작업 필요

    const { naver } = this;
    const {
      sw,
      ne,
    } = bound;
    this.map.fitBounds(
      new naver.maps.LatLngBounds(
        new naver.maps.LatLng(sw.lat, sw.lng),
        new naver.maps.LatLng(ne.lat, ne.lng),
      ),
    );
  }

  setCallbackOnBoundChanged(callback) { // TODO eventListener 제거 로직 필요
    if (!callback) return;
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Map.html#event:bounds_changed__anchor
    naver.maps.Event.addListener(this.map, 'bounds_changed', (bounds) => {
      callback(bounds);
    });
  }

  setCallbackOnZoomChanged(callback) { // TODO eventListener 제거 로직 필요
    if (!callback) return;
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Map.html#event:zoom_changed__anchor
    const { naver } = this;
    naver.maps.Event.addListener(this.map, 'zoom_changed', (v) => {
      callback(v);
    });
  }

  destroy() {
    this.removeAllMarkers();
    this.removeAllPolylines();
    this.removeAllHexagonGroups();
    if (!this.map) throw new Error('네이버 맵 객체가 유효하지 않습니다.'); // TODO CUSTOM_ERROR, ERROR_CODE 매핑
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Map.html
    this.map.destroy();
  }
}
