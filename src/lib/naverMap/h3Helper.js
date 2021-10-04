import {
  h3ToGeoBoundary, // https://h3geo.org/docs/api/indexing#h3togeoboundary
  polyfill, // https://h3geo.org/docs/api/regions#polyfill
} from 'h3-js';
import GeoJSON from 'geojson';
import {
  add,
  subtract,
  round,
} from 'mathjs';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  H3_RESOLUTION,
  Z_INDEX_HEXGON_USER_SELECT,
  Z_INDEX_POLYGON_BORDER,
} from './constants';
import { Bound } from './Bound';

/**
 * H3를 좌표값 배열로 바꿔줍니다.
 *
 * @param {array} h3Indexes - GeoJSON으로 바꿀 H3 배열
 *
 * @return {object} Point{ lat, lng } 배열 객체
 */
const convertH3IndexToPoints = (h3Indexes) => {
  const points = [];
  h3Indexes.forEach((v) => {
    h3ToGeoBoundary(v).forEach((e) => {
      points.push({ lat: e[0], lng: e[1] });
    });
  });
  return points;
};

/**
 * 좌표값 배열을 경계(Bound) 객체로 바꿔줍니다.
 *
 * @param {array} points - Point{ lat, lng } 배열 객체
 *
 * @return {Bound} 경계 객체
 */
const convertPointsToBound = (points) => {
  const src = points.reduce((acc, v) => {
    const { lat, lng } = v;
    const result = {
      ...acc,
    };
    if (!result.maxLat || result.maxLat < lat) {
      result.maxLat = lat;
    }
    if (!result.minLat || result.minLat > lat) {
      result.minLat = lat;
    }
    if (!result.maxLng || result.maxLng < lng) {
      result.maxLng = lng;
    }
    if (!result.minLng || result.minLng > lng) {
      result.minLng = lng;
    }

    return result;
  }, {
    maxLat: null,
    minLat: null,
    maxLng: null,
    minLng: null,
  });

  const {
    maxLat,
    minLat,
    maxLng,
    minLng,
  } = src;

  return new Bound(
    {
      lat: minLat,
      lng: minLng,
    },
    {
      lat: maxLat,
      lng: maxLng,
    },
  );
};

export default {
  getMinZoom() {
    return MIN_ZOOM;
  },
  getMaxZoom() {
    return MAX_ZOOM;
  },

  /**
   * 최고 위도, 최고 경도, 최저 위도, 최저 경도값을 받아 이 범위에 포함되거나 걸쳐있는 모든 H3 배열을 구합니다
   * @param {number} maxLat - 최고 위도
   * @param {number} maxLng - 최고 경도
   * @param {number} minLat - 최저 위도
   * @param {number} minLng - 최저 경도
   *
   * @return {array} 범위에 포함되거나 걸쳐있는 모든 H3 배열
   */
  getH3Indexes({
    maxLat, maxLng, minLat, minLng,
  }) {
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

    // https://github.com/uber/h3-js#useful-algorithms
    const h3Indexes = polyfill(polygon, H3_RESOLUTION);
    return h3Indexes;
  },

  /**
   * 사용자가 선택한 범위 안의 Hexagon들의 h3Index의 배열을 가져옵니다.
   *
   * @param {object} naverMapBounds - Naver 맵에서 선택한 경계(bound) 정보
   *
   * @return {array} 범위에 포함되거나 걸쳐있는 모든 H3 배열
   */
  getH3IndexesInBounds(naverMapBounds) {
    // 맵에서 전달한 범위보다 큰 Bounds로 변경
    const {
      _max: { _lat: maxLat, _lng: maxLng },
      _min: { _lat: minLat, _lng: minLng },
    } = naverMapBounds;

    return this.getH3Indexes({
      maxLat, maxLng, minLat, minLng,
    });
  },

  /**
   * 사용자가 선택한 범위 안의 Hexagon들의 h3Index의 배열을 가져옵니다.
   *
   * @param {object} naverMapPointBounds - Naver 맵에서 선택한 좌표경계(point bound) 정보
   *
   * @return {array} 범위에 포함되거나 걸쳐있는 모든 H3 배열
   */
  getH3IndexesInPointBounds(naverMapPointBounds) {
    const {
      _max: { y: maxLat, x: maxLng },
      _min: { y: minLat, x: minLng },
    } = naverMapPointBounds;

    return this.getH3Indexes({
      maxLat, maxLng, minLat, minLng,
    });
  },

  /**
   * H3들을 GeoJSON 포맷으로 바꿉니다.(Naver 맵에 그릴 때, GeoJSON 포맷이 필요합니다)
   *
   * @param {array} h3Indexes - GeoJSON으로 바꿀 H3 배열
   * @param {number} zIndex - 화면에 표시될 때의 css z-index
   * @param {object} properties - GeoJSON의 추가적인 속성
   *
   * @return {object} Naver 맵에 그릴 GeoJSON 객체
   */
  convertH3IndexToGeoJson(h3Indexes, zIndex, properties = {}) {
    const data = h3Indexes.map((hexagon) => {
      const hexBoundary = h3ToGeoBoundary(hexagon, true/* GeoJSON format으로 받음 */);
      return {
        polygon: [hexBoundary],
        h3Index: hexagon,
        // https://navermaps.github.io/maps.js.ncp/docs/tutorial-1-datalayer.example.html
        // TODO style 정보는 외부에서 받아와야 할 수도 있다
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
  },

  /**
   * H3를 경계(Bound) 객체로 바꿔줍니다.
   *
   * @param {array} h3Indexes - GeoJSON으로 바꿀 H3 배열
   *
   * @return {Bound} 경계 객체
   */
  convertH3IndexToBound(h3Indexes) {
    const points = convertH3IndexToPoints(h3Indexes);
    return convertPointsToBound(points);
  },

  /**
   * convertH3IndexToGeoJson 메서드로 포워딩(전달)합니다.
   * 지정된 z-index값(Z_INDEX_HEXGON_USER_SELECT)을 설정해줍니다.
   *
   * @param {array} h3Indexes - GeoJSON으로 바꿀 H3 배열
   * @param {string} h3IndexGroupId - H3 group의 id
   *
   * @return {object} Naver 맵에 그릴 GeoJSON 객체
   */
  convertH3IndexToGeoJsonByUserSelect(h3Indexes, h3IndexGroupId) {
    return this.convertH3IndexToGeoJson(
      h3Indexes,
      Z_INDEX_HEXGON_USER_SELECT,
      { h3IndexGroupId },
    );
  },

  /**
   * Naver map의 폴리곤 경계의 스타일 값을 줍니다.
   * https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Data.html#toc25__anchor
   *
   * @return {object} Naver 맵의 폴리곤 경계의 스타일
   */
  getStylePolygonBorder: () => ({
    fillColor: '#00bf46',
    fillOpacity: 0.4,
    strokeWeight: 2,
    strokeColor: '#00bf46',
    zIndex: Z_INDEX_POLYGON_BORDER,
  }),

  /**
   * Naver map의 폴리곤 경계의 Focus 시의 스타일 값을 줍니다.
   *
   * @return {object} Naver 맵의 폴리곤 경계의 스타일
   */
  getStylePolygonBorderFocus: () => ({
    fillColor: '#FFCDD2', // Vuetify red lighten-4
    fillOpacity: 0.4,
    strokeWeight: 2,
    strokeColor: '#B71C1C', // Vuetify red darken-4
    zIndex: Z_INDEX_POLYGON_BORDER,
  }),
};
