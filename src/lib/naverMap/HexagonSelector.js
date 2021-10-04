import { v4 as uuidv4 } from 'uuid';
import {
  h3SetToMultiPolygon, // https://h3geo.org/docs/api/regions#h3settolinkedgeo--h3settomultipolygon
} from 'h3-js';

import {
  MIN_ZOOM,
  MAX_ZOOM,
  Z_INDEX_HEXGON_GRID,
  MIN_ZOOM_POLYGON_VISIBLE,
} from './constants';
import h3Helper from './h3Helper';

// TODO 필요한 기능 목록
// BaseNaverMap은 H3Group 객체를 받아서 화면에 그린다
// H3Group은 다음과 같은 기능을 가진다
// 1. H3 index 배열을 주어서 테두리만 표시
// 2. 테두리에 mouseover시 이벤트를 받아서 콜백
// 3. mouseover시 자체적으로 가지고 있는 정보를 추가적으로 노출
/*
class HexagonGroup
{
  naver: null,
  map: null,
  style: ring | polygon
  h3Indexes: []
  infoHtml: '' // String raw html
  infoFocusHtml: '' // String raw html
  draw() {...}
  remove() {...}
}
*/

/* eslint-disable import/prefer-default-export */
export class HexagonSelector {
  constructor(naver, map, drawingManager) {
    this.naver = naver;
    this.map = map;
    this.drawingManager = drawingManager;
    this.setUserDataLayer(drawingManager);

    this.currentZoomLevel = MIN_ZOOM;

    // 서비스에서 선택가능한 h3Index들의 Set
    this.h3Config = {
      // 사용자가 선택 가능한 모든 h3Index들의 set
      h3IndexSet: new Set(),
      // 사용자가 선택 가능한 모든 h3Index를 감싸는 경계 h3Index들의 set
      h3IndexesInBoundsSet: new Set(),
      // 사용자가 선택 가능한 모든 h3Index를 감싸는 경계 h3Index들의 배열
      h3IndexesInBounds: [],
      // 사용자가 추가할 의도로 선택한 h3Index의 배열
      h3IndexesInBoundsToAdd: [],
      // 사용자가 제거할 의도로 선택한 h3Index의 배열
      h3IndexesInBoundsToRemove: [],
    };

    this.userSelectedH3Groups = {
      h3IndexGroupMapById: new Map(), // TODO h3GroupIdMap으로 이름 고쳐야 함
    };
  }

  /**
   * h3Config에 h3Index들(선택가능범위)을 등록합니다. (TODO addSelectableH3로 이름 바꾸기)
   * @param {array} h3Indexes - h3Index 배열
   *
   * @return {void} 반환값 없음
   */
  addH3IndexesToServiceDataLayer(h3Indexes) {
    const { h3IndexSet } = this.h3Config;
    h3Indexes.forEach((h3Index) => h3IndexSet.add(h3Index));
  }

  /**
   * h3Group에서 h3 1개를 제거합니다. (TODO removeH3FromH3Group로 이름 바꾸기)
   * @param {string} groupId - h3Index 그룹의 id
   * @param {string} h3IndexToRemove - 제거할 h3Index 배열
   *
   * @return {void} 반환값 없음
   */
  removeH3IndexFromUserDataLayer(groupId, h3IndexToRemove) {
    const {
      h3IndexGroupMapById,
    } = this.userSelectedH3Groups;

    const h3IndexGroup = h3IndexGroupMapById.get(groupId);
    const { h3Indexes } = h3IndexGroup;
    h3IndexGroup.h3Indexes = h3Indexes.filter((h3Index) => h3Index !== h3IndexToRemove);
    h3IndexGroupMapById.set(groupId, h3IndexGroup);
  }

  /**
   * h3Group를 userDataLayer에 추가합니다. (TODO addH3FromH3Group로 이름 바꾸기)
   * @param {array} h3IndexesToAdd - 추가할 h3Index 배열
   * @param {string} groupName - h3Index 그룹의 이름
   *
   * @return {string} group의 uuid
   */
  addH3IndexGroupToUserDataLayer(h3IndexesToAdd, groupName) {
    const h3IndexGroup = {
      id: uuidv4(), // TODO 나중에는 DB에서 생성하는 id로 바꿈
      groupName,
      h3Indexes: h3IndexesToAdd,
    };

    const {
      h3IndexGroupMapById,
    } = this.userSelectedH3Groups;

    h3IndexGroupMapById.set(h3IndexGroup.id, h3IndexGroup);

    return h3IndexGroup.id;
  }

  /**
   * h3Indexes를 userDataLayer에 추가하고 지도에 그립니다
   * @param {array} h3Indexes - 추가할 h3Index 배열
   * @param {string} groupName - h3Index 그룹의 이름
   *
   * @return {string} group의 uuid
   */
  addH3Group(h3Indexes, groupName) {
    /* eslint-disable no-console */

    console.log('addH3Group / 00');

    const h3IndexGroupId = this.addH3IndexGroupToUserDataLayer(h3Indexes, groupName);

    console.log('addH3Group / 00-1');
    const geoJSON = h3Helper.convertH3IndexToGeoJsonByUserSelect(
      h3Indexes,
      h3IndexGroupId,
    );

    console.log('addH3Group / 01');

    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Data.html
    const { map } = this;
    map.data.addGeoJson(geoJSON);

    console.log('addH3Group / 02');

    return h3IndexGroupId;
  }

  /**
   * Naver map 경계 객체를 받아 경계에 포함되는 H3들을 찾습니다.
   * 그리고 찾은 H3들을 h3Config에 업데이트합니다.
   *
   * @param {object} naverMapBounds - Naver 맵에서 선택한 경계(bound) 정보
   *
   * @return {void} 반환값 없음
   */
  setH3IndexesInBoundsToServiceDataLayer(naverMapBounds) {
    const {
      h3IndexSet: set,
      h3IndexesInBounds: arr,
      h3IndexesInBoundsSet: setInBounds,
    } = this.h3Config;

    // 1. 현재 화면에서 그려야할 영역 내의 모든 h3Index를 구함
    const h3IndexesInBounds = h3Helper.getH3IndexesInBounds(naverMapBounds);

    // 1-1. 서비스에서 관할하는 영역 바깥의 h3Index는 모두 제외
    const h3IndexesInService = h3IndexesInBounds.filter((h3Index) => set.has(h3Index));
    // 1-2. 서비스 관할 영역 내의 화면 안의 h3Index를 Set으로 추가
    const h3IndexesInBoundsSet = h3IndexesInService.reduce((acc, h3Index) => {
      acc.add(h3Index);
      return acc;
    }, new Set());

    // 2. 새로 구한 h3Index가 직전의 h3IndexSet에 없다면 새로 그릴 h3Index로 추가
    const h3IndexesToAdd = h3IndexesInService.filter((h3Index) => !setInBounds.has(h3Index));

    // 3-1. 화면에 이미 그려져 있고, 그대로 사용할 h3Index들을 찾음
    // 3-2. 화면에 이미 그려져 있지만, 지울 h3Index들을 찾음
    const h3IndexesToRemove = [];
    const h3IndexesToStay = [];
    arr.forEach((h3Index) => {
      if (h3IndexesInBoundsSet.has(h3Index)) {
        h3IndexesToStay.push(h3Index);
      } else {
        h3IndexesToRemove.push(h3Index);
      }
    });

    // 4. h3Config에 h3Index 배열과 Set을 업데이트
    const h3IndexesInBoundsNext = h3IndexesToStay.concat(h3IndexesToAdd);
    const h3IndexesInBoundsSetNext = h3IndexesInBoundsNext.reduce((acc, h3Index) => {
      acc.add(h3Index);
      return acc;
    }, new Set());
    this.h3Config.h3IndexesInBounds = h3IndexesInBoundsNext;
    this.h3Config.h3IndexesInBoundsSet = h3IndexesInBoundsSetNext;
    this.h3Config.h3IndexesInBoundsToAdd = h3IndexesToAdd;
    this.h3Config.h3IndexesInBoundsToRemove = h3IndexesToRemove;
  }

  /**
   * 사용자가 선택한 경계(bound)에 포함된 H3들을 GeoJSON으로 바꿔줍니다
   *
   * @return {object} GeoJSON 객체
   */
  getGeoJSONInBounds() {
    const { h3IndexesInBounds } = this.h3Config;
    return h3Helper.convertH3IndexToGeoJson(h3IndexesInBounds, Z_INDEX_HEXGON_GRID);
  }

  /**
   * 사용자가 추가하기 위해 선택한 H3들을 GeoJSON으로 바꿔줍니다
   *
   * @return {object} GeoJSON 객체
   */
  getGeoJSONInBoundsToAdd() {
    const { h3IndexesInBoundsToAdd } = this.h3Config;
    return h3Helper.convertH3IndexToGeoJson(h3IndexesInBoundsToAdd, Z_INDEX_HEXGON_GRID);
  }

  /**
   * 사용자가 제거하기 위해 선택한 H3들을 GeoJSON으로 바꿔줍니다
   *
   * @return {object} GeoJSON 객체
   */
  getGeoJSONInBoundsToRemove() {
    const { h3IndexesInBoundsToRemove } = this.h3Config;
    return h3Helper.convertH3IndexToGeoJson(h3IndexesInBoundsToRemove, Z_INDEX_HEXGON_GRID);
  }

  /**
   * 선택 가능한 모든 영역의 테두리의 path 정보(polygon의 좌표 배열)를 가져옵니다.
   *
   * @return {array} polygon의 좌표 배열
   */
  getNaverPolygonPathOutlineServiceDataLayer() {
    const { naver } = this;
    if (!naver) throw new Error('naver api 객체가 없습니다.');

    const { h3IndexSet } = this.h3Config;
    const h3Indexes = Array.from(h3IndexSet);

    const multiPolygon = h3SetToMultiPolygon(h3Indexes);
    const polygonOutline = multiPolygon[0][0];
    const paths = polygonOutline.map((v) => new naver.maps.LatLng(v[0], v[1]));

    return paths;
  }

  /**
   * 선택 가능한 H3 집합의 테두리를 지도에 그립니다.
   *
   * @return {void} 반환값 없음
   */
  drawSelectableH3OuterRing() {
    const paths = this.getNaverPolygonPathOutlineServiceDataLayer();

    const { naver, map } = this;
    /* eslint-disable no-new */
    new naver.maps.Polygon({
      map,
      paths,
      ...h3Helper.getStylePolygonBorder(),
    });
  }

  /**
   * Naver map에서 현재 사용중인 zoom level 값을 업데이트합니다.
   * 이 값은 H3 표시가 가능한 최소, 최대 zoom level을 제어하는 데 사용됩니다.
   *
   * @return {void} 리턴 값 없음
   */
  setCurrentZoomLevel(zoomLevel) {
    this.currentZoomLevel = zoomLevel;
  }

  /**
   * Naver map에서 H3 polygon을 표시할 수 있는 zoom level인지 판단합니다.
   *
   * @return {boolean} 표시 가능 zoom level 플래그 값
   */
  isZoomLevelPolygonVisible() {
    const zoomeLevel = this.currentZoomLevel;
    // TODO EOG, EOL의 정의 찾기. 무슨 뜻이었더라.
    const isEOGThanMinZoom = zoomeLevel >= MIN_ZOOM_POLYGON_VISIBLE;
    const isEOLThanMaxZoom = zoomeLevel <= MAX_ZOOM;

    return isEOGThanMinZoom && isEOLThanMaxZoom;
  }

  // TODO 아래 기능 동작하지 않음. 확인 필요!
  /**
   * 사용중인 Naver map에 DataLayer를 추가합니다? -> 맞나요? (TODO setDataLayer로 이름 바꾸기)
   * @param {array} h3Indexes - h3Index 배열
   *
   * @return {void} 반환값 없음
   */
  setUserDataLayer(drawingManager) {
    const { naver, map } = this;
    // 그리기 툴로 선택한 범위의 H3들을 등록합니다.
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.drawing.html#.DrawingEvent
    drawingManager.addListener(naver.maps.drawing.DrawingEvents.ADD, (overlay) => {
      // 맵에 그린 도형을 맵에서 삭제합니다.
      drawingManager.removeDrawing(overlay);

      const isZoomLevelPolygonVisible = this.isZoomLevelPolygonVisible();
      if (!isZoomLevelPolygonVisible) {
        /* eslint-disable no-console */
        console.log('폴리곤을 선택할 수 없는 줌레벨입니다. 확대해주세요.');
        return;
      }

      const h3Indexes = h3Helper.getH3IndexesInPointBounds(overlay.bounds);
      const groupName = 'groupName';
      const h3IndexGroupId = this.addH3IndexGroupToUserDataLayer(h3Indexes, groupName);
      const geoJSON = h3Helper.convertH3IndexToGeoJsonByUserSelect(
        h3Indexes,
        h3IndexGroupId,
      );

      // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Data.html
      const features = map.data.addGeoJson(geoJSON);
      /* eslint-disable no-console */
      console.log('화면에 선택된 Hexagon 목록');
      features.forEach((feature) => {
        const h3Index = feature.getProperty('h3Index');
        /* eslint-disable no-console */
        console.log('h3Index:', h3Index);
      });
    });

    map.data.addListener('click', ({ feature }) => {
      // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Feature.html
      const h3Index = feature.getProperty('h3Index');
      const h3IndexGroupId = feature.getProperty('h3IndexGroupId');

      // 사용자가 등록한 h3Index라면 삭제
      this.removeH3IndexFromUserDataLayer(h3IndexGroupId, h3Index);
      // TODO 사용자가 등록하지 않은 h3Index라면 추가
      map.data.removeFeature(feature);
    });
  }

  onBoundChanged(bounds) {
    const { map } = this;
    if (this.isZoomLevelPolygonVisible()) {
      // 폴리곤이 보이는 줌 레벨이라면 폴리곤 표시 업데이트
      this.setH3IndexesInBoundsToServiceDataLayer(bounds);

      // https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-DataLayer.html
      // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Data.html#toc25__anchor
      map.data.setStyle((feature) => {
        const style = feature.getProperty('style');
        return {
          zIndex: style.zIndex,
        };
      });

      map.data.removeGeoJson(this.getGeoJSONInBoundsToRemove());
      map.data.addGeoJson(this.getGeoJSONInBoundsToAdd());
    } else {
      // 폴리곤이 보이지 않는 줌 레벨이라면 폴리곤 모두 삭제
      map.data.removeGeoJson(this.getGeoJSONInBounds());
    }
  }

  /**
   * Naver map에서 표시하는 모든 객체 제거
   *
   * @return {void} 리턴 값 없음
   */
  remove() {
    const { map } = this;
    map.data.removeGeoJson(this.getGeoJSONInBounds());
  }
}
