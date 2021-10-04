import { v4 as uuidv4 } from 'uuid';
import {
  h3ToGeoBoundary, // https://h3geo.org/docs/api/indexing#h3togeoboundary
  polyfill, // https://h3geo.org/docs/api/regions#polyfill
  h3SetToMultiPolygon, // https://h3geo.org/docs/api/regions#h3settolinkedgeo--h3settomultipolygon
} from 'h3-js';
import GeoJSON from 'geojson';
import { add, subtract, round } from 'mathjs';

const H3_RESOLUTION = 9;
const MIN_ZOOM = 13;
const MIN_ZOOM_POLYGON_VISIBLE = 15;
const MAX_ZOOM = 21;
const Z_INDEX_HEXGON_USER_SELECT = 0;
const Z_INDEX_HEXGON_GRID = -200;
const Z_INDEX_POLYGON_BORDER = -100;
let currentZoomLevel = MIN_ZOOM;
let naver;

// TODO 사용자가 선택가능한 범위에 대한 Hexagon에 대해 관리해야 한다.

// TODO Hexagon의 h3Index 데이터를 관리해야 한다.
// 1. 사용자가 추가한 Hexagon
// 1-1. H3Index 그룹의 이름
// 1-2. H3Index 그룹의 h3Index 리스트 데이터

// TODO 관련 로직 테스트 코드 작성하기
// 서비스에서 선택가능한 h3Index들의 Set
const h3Config = {
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
// 서비스의 사용자가 선택한 h3Index들을 관리하는 Map 객체
const userSelectedH3Groups = {
  h3IndexGroupMapById: new Map(),
};

/**
 * h3Config에 h3Index들을 등록합니다. (TODO register로 이름 바꾸기)
 * @param {array} h3Indexes - h3Index 배열
 *
 * @return {void} 반환값 없음
 */
const addH3IndexesToServiceDataLayer = (h3Indexes) => {
  const { h3IndexSet } = h3Config;
  h3Indexes.forEach((h3Index) => h3IndexSet.add(h3Index));
};
// 완료!
const addH3IndexGroupToUserDataLayer = (h3IndexesToAdd, groupName) => {
  // TODO h3Index가 h3Config에 포함된 것만 필터링

  const h3IndexGroup = {
    id: uuidv4(), // TODO 나중에는 DB에서 생성하는 id로 바꿈
    groupName,
    h3Indexes: h3IndexesToAdd,
  };

  const {
    h3IndexGroupMapById,
  } = userSelectedH3Groups;

  h3IndexGroupMapById.set(h3IndexGroup.id, h3IndexGroup);

  return h3IndexGroup.id;
};
// 완료!
const removeH3IndexFromUserDataLayer = (groupId, h3IndexToRemove) => {
  const {
    h3IndexGroupMapById,
  } = userSelectedH3Groups;

  const h3IndexGroup = h3IndexGroupMapById.get(groupId);
  const { h3Indexes } = h3IndexGroup;
  h3IndexGroup.h3Indexes = h3Indexes.filter((h3Index) => h3Index !== h3IndexToRemove);
  h3IndexGroupMapById.set(groupId, h3IndexGroup);
};
// 완료!
const getH3Indexes = ({
  maxLat, maxLng, minLat, minLng,
}) => {
  const fixedPoint = 7;
  // https://mathjs.org/docs/expressions/syntax.html
  const latDiff = round(subtract(maxLat, minLat) * 0.1, fixedPoint);
  const maxLatExtened = round(add(maxLat, latDiff), fixedPoint);
  const minLatExtened = round(subtract(minLat, latDiff), fixedPoint);

  const lngDiff = round(subtract(maxLng, minLng) * 0.1, fixedPoint);
  const maxLngExtened = round(add(maxLng, lngDiff), fixedPoint);
  const minLngExtened = round(subtract(minLng, lngDiff), fixedPoint);

  const polygon = [
    [minLatExtened, minLngExtened],
    [maxLatExtened, minLngExtened],
    [maxLatExtened, maxLngExtened],
    [minLatExtened, maxLngExtened],
  ];

  const h3Indexes = polyfill(polygon, H3_RESOLUTION);
  return h3Indexes;
};
// 완료!
// 사용자가 선택한 범위 안의 Hexagon들의 h3Index의 배열을 가져옵니다.
// https://github.com/uber/h3-js#useful-algorithms
const getH3IndexesInBounds = (naverMapBounds) => {
  // 맵에서 전달한 범위보다 큰 Bounds로 변경
  const {
    _max: { _lat: maxLat, _lng: maxLng },
    _min: { _lat: minLat, _lng: minLng },
  } = naverMapBounds;

  return getH3Indexes({
    maxLat, maxLng, minLat, minLng,
  });
};
// 완료!
const getH3IndexesInPointBounds = (naverMapPointBounds) => {
  const {
    _max: { y: maxLat, x: maxLng },
    _min: { y: minLat, x: minLng },
  } = naverMapPointBounds;

  return getH3Indexes({
    maxLat, maxLng, minLat, minLng,
  });
};
// 완료!
const convertH3IndexToGeoJson = (h3Indexes, zIndex, properties = {}) => {
  const data = h3Indexes.map((hexagon) => {
    const hexBoundary = h3ToGeoBoundary(hexagon, true/* GeoJSON format으로 받음 */);
    return {
      polygon: [hexBoundary],
      h3Index: hexagon,
      style: {
        zIndex,
        onMouseOver: {
          strokeWeight: 8,
        },
        onMouseOut: {
          strokeWeight: 3,
        },
      },
      ...properties,
    };
  });

  const geoJSON = GeoJSON.parse(data, { Polygon: 'polygon' });
  return geoJSON;
};
// 완료!
const convertH3IndexToGeoJsonByUserSelect = (h3Indexes, h3IndexGroupId) => {
  const result = convertH3IndexToGeoJson(h3Indexes, Z_INDEX_HEXGON_USER_SELECT, { h3IndexGroupId });
  return result;
};
// 완료!
const setH3IndexesInBoundsToServiceDataLayer = (naverMapBounds) => {
  const {
    h3IndexSet: set,
    h3IndexesInBounds: arr,
    h3IndexesInBoundsSet: setInBounds,
  } = h3Config;

  // 1. 현재 화면에서 그려야할 영역 내의 모든 h3Index를 구함
  const h3IndexesInBounds = getH3IndexesInBounds(naverMapBounds);

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
  h3Config.h3IndexesInBounds = h3IndexesInBoundsNext;
  h3Config.h3IndexesInBoundsSet = h3IndexesInBoundsSetNext;
  h3Config.h3IndexesInBoundsToAdd = h3IndexesToAdd;
  h3Config.h3IndexesInBoundsToRemove = h3IndexesToRemove;
};
// 완료!
const getGeoJSONInBounds = () => {
  const { h3IndexesInBounds } = h3Config;
  return convertH3IndexToGeoJson(h3IndexesInBounds, Z_INDEX_HEXGON_GRID);
};
// 완료!
const getGeoJSONInBoundsToAdd = () => {
  const { h3IndexesInBoundsToAdd } = h3Config;
  return convertH3IndexToGeoJson(h3IndexesInBoundsToAdd, Z_INDEX_HEXGON_GRID);
};
// 완료!
const getGeoJSONInBoundsToRemove = () => {
  const { h3IndexesInBoundsToRemove } = h3Config;
  return convertH3IndexToGeoJson(h3IndexesInBoundsToRemove, Z_INDEX_HEXGON_GRID);
};
// 완료!
const getNaverPolygonPathOutlineServiceDataLayer = () => {
  if (!naver) throw new Error('naver api 객체가 없습니다.');

  const { h3IndexSet } = h3Config;
  const h3Indexes = Array.from(h3IndexSet);
  const multiPolygon = h3SetToMultiPolygon(h3Indexes);
  const polygonOutline = multiPolygon[0][0];
  const paths = polygonOutline.map((v) => new naver.maps.LatLng(v[0], v[1]));

  return paths;
};
// 완료!
const getMinZoom = () => MIN_ZOOM;
// 완료!
const getMaxZoom = () => MAX_ZOOM;
// 완료!
const setCurrentZoomLevel = (zoomLevel) => {
  currentZoomLevel = zoomLevel;
};
// 내부적으로만 사용되므로, 옮길 필요 없음
const getCurrentZoomLevel = () => currentZoomLevel;
// 완료!
const isZoomLevelPolygonVisible = () => {
  const zoomeLevel = getCurrentZoomLevel();
  const isEOGThanMinZoom = zoomeLevel >= MIN_ZOOM_POLYGON_VISIBLE;
  const isEOLThanMaxZoom = zoomeLevel <= MAX_ZOOM;

  return isEOGThanMinZoom && isEOLThanMaxZoom;
};
// 완료!
// https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Data.html#toc25__anchor
const getStylePolygonBorder = () => ({
  fillColor: '#00bf46',
  fillOpacity: 0.4,
  strokeWeight: 2,
  strokeColor: '#00bf46',
  zIndex: Z_INDEX_POLYGON_BORDER,
});

export default {
  setNaver(_naver) {
    naver = _naver;
  },
  addH3IndexesToServiceDataLayer,
  getH3IndexesInPointBounds,
  convertH3IndexToGeoJsonByUserSelect,
  addH3IndexGroupToUserDataLayer,
  removeH3IndexFromUserDataLayer,
  setH3IndexesInBoundsToServiceDataLayer,
  getGeoJSONInBounds,
  getGeoJSONInBoundsToAdd,
  getGeoJSONInBoundsToRemove,
  getNaverPolygonPathOutlineServiceDataLayer,
  getMinZoom,
  getMaxZoom,
  setCurrentZoomLevel,
  isZoomLevelPolygonVisible,
  getStylePolygonBorder,
};
