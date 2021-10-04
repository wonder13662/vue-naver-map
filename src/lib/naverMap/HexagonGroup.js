import {
  h3SetToMultiPolygon, // https://h3geo.org/docs/api/regions#h3settolinkedgeo--h3settomultipolygon
} from 'h3-js';
import h3Helper from './h3Helper';

export const STYLE_RING = 'STYLE_RING'; // Hexagon 그룹의 테두리만 그림
export const STYLE_FILL = 'STYLE_FILL'; // Hexagon 그룹의 내부도 Hexagon 형태로 채움

/**
 * 선택 가능한 모든 영역의 테두리의 path 정보(polygon의 좌표 배열)를 가져옵니다
 * @param {object} naver - Naver 지도 클래스
 * @param {array} h3Indexes - Hexagon 그룹을 표현하는 h3 index들의 배열
 *
 * @return {array} polygon의 좌표 배열
 */
const getNaverPolygonPathOutline = (naver, h3Indexes) => {
  const multiPolygon = h3SetToMultiPolygon(h3Indexes);
  const polygonOutline = multiPolygon[0][0];
  return polygonOutline.map((v) => new naver.maps.LatLng(v[0], v[1]));
};

const getHexagonStyle = () => h3Helper.getStylePolygonBorder();
const getHexagonFocusStyle = () => h3Helper.getStylePolygonBorderFocus();

/**
 * H3 집합의 테두리를 지도에 그립니다
 * @param {object} naver - Naver 지도 클래스
 * @param {object} map - Naver 지도 클래스로 만든 Naver 지도 instance
 * @param {array} h3Indexes - Hexagon 그룹을 표현하는 h3 index들의 배열
 *
 * @return {object} Naver 지도의 polygon 객체
 */
const drawRing = (naver, map, h3Indexes) => {
  const paths = getNaverPolygonPathOutline(naver, h3Indexes);

  // https://navermaps.github.io/maps.js.ncp/docs/tutorial-3-polygon-simple.example.html
  /* eslint-disable no-new */
  const polygon = new naver.maps.Polygon({
    map,
    paths,
    clickable: true,
    ...getHexagonStyle(),
  });

  return polygon;
};

const setHexagonStyleBlur = (polygon) => polygon.setStyles(getHexagonStyle());
const setHexagonStyleFocus = (polygon) => polygon.setStyles(getHexagonFocusStyle());

/**
 * 추가 정보창에 쓰이는 Icon 객체를 만듭니다
 * @param {object} naver - Naver 지도 클래스
 * @param {string} html - 마커를 표현하는 HTML 문자열
 *
 * @return {object} Naver 지도의 marker 객체
 */
const getInfoMarkerIcon = (naver, html) => {
  const styleCustomInfoWindow = [
    'background: white;',
    'border:solid 1px rgba(0,0,0,.3);',
    'width: 150px;',
    'padding: 5px;',
    'font-size: .6rem;',
  ].join('');
  return {
    content: [
      `<div style="${styleCustomInfoWindow}">`,
      `${html}`,
      '</div>',
    ].join(''),
    anchor: new naver.maps.Point(-10, 0),
  };
};

/**
 * H3 집합의 추가정보를 지도에 그립니다
 * @param {object} naver - Naver 지도 클래스
 * @param {object} map - Naver 지도 클래스로 만든 Naver 지도 instance
 * @param {string} html - 마커를 표현하는 HTML 문자열
 *
 * @return {object} Naver 지도의 marker 객체
 */
const drawInfoMarker = (naver, map, bound, infoHtml) => {
  const { ne: { lat, lng } } = bound;
  return new naver.maps.Marker({
    position: new naver.maps.LatLng(lat, lng),
    map,
    icon: getInfoMarkerIcon(naver, infoHtml),
  });
};

const addEventListeners = (
  naver,
  listeners,
  hexGroupPolygon,
  infoMarker,
  onClick = () => {},
  onMouseover = () => {},
  onMouseout = () => {},
) => {
  const { addListener } = naver.maps.Event;
  if (hexGroupPolygon) {
    listeners.push(addListener(hexGroupPolygon, 'click', onClick));
    listeners.push(addListener(hexGroupPolygon, 'mouseover', onMouseover));
    listeners.push(addListener(hexGroupPolygon, 'mouseout', onMouseout));
  }
  if (infoMarker) {
    listeners.push(addListener(infoMarker, 'click', onClick));
    listeners.push(addListener(infoMarker, 'mouseover', onMouseover));
    listeners.push(addListener(infoMarker, 'mouseout', onMouseout));
  }
  return listeners;
};

/* eslint-disable max-len */
const removeListeners = (naver, listeners) => listeners.forEach((v) => naver.maps.Event.removeListener(v));

/* eslint-disable import/prefer-default-export */
export class HexagonGroup {
  /**
   * Hexagon 집합을 지도에 그리기 위해 필요한 정보를 받습니다.
   * @param {object} naver - Naver 지도 클래스
   * @param {object} map - Naver 지도 클래스로 만든 Naver 지도 instance
   * @param {string} style - Hexagon 그룹을 그리는 방식. STYLE_RING, STYLE_FILL 중에 하나를 선택
   * @param {array} h3Indexes - Hexagon 그룹을 표현하는 h3 index들의 배열
   * @param {string} infoHtml - Hexagon 그룹의 추가적인 정보를 표현하는 HTML. mouseout시에 모습
   * @param {string} infoFocusHtml - Hexagon 그룹의 추가적인 정보를 표현하는 HTML. mouseover시의 모습
   *
   * @return {void} 반환값 없음
   */
  constructor({
    naver = null,
    map = null,
    style = STYLE_RING,
    h3Indexes = [],
    infoHtml = '',
    infoFocusHtml = '',
  }) {
    this.naver = naver;
    this.map = map;
    this.style = style;
    this.h3Indexes = h3Indexes;
    this.infoHtml = infoHtml;
    this.infoFocusHtml = infoFocusHtml;
    this.hexGroupPolygon = null;
    this.infoMarker = null;
    this.listeners = [];
  }

  /**
   * Naver 지도 클래스를 설정합니다.
   *
   * @param {object} naver - Naver 지도 클래스
   *
   * @return {void} 반환값 없음
   */
  setNaver(naver) {
    this.naver = naver;
  }

  /**
   * Naver 지도 클래스의 인스턴스를 설정합니다.
   *
   * @param {object} map - Naver 지도 클래스로 만든 Naver 지도 instance
   *
   * @return {void} 반환값 없음
   */
  setMap(map) {
    this.map = map;
  }

  /**
   * Hexagon group을 지도에 그립니다
   *
   * @return {void} 반환값 없음
   */
  draw() {
    if (this.style === STYLE_RING) {
      this.hexGroupPolygon = drawRing(this.naver, this.map, this.h3Indexes);
      if (this.infoHtml) {
        this.infoMarker = drawInfoMarker(this.naver, this.map, this.getBound(), this.infoHtml);
        this.listeners = addEventListeners(
          this.naver,
          this.listeners,
          this.hexGroupPolygon,
          this.infoMarker,
          // onClick
          () => {
            /* eslint-disable no-console */
            console.log('onClick');
          },
          // onMouseover
          () => {
            /* eslint-disable no-console */
            console.log('onMouseover');
            this.focus();
          },
          // onMouseout
          () => {
            /* eslint-disable no-console */
            console.log('onMouseout');
            this.blur();
          },
        );
      }
    } else if (this.style === STYLE_FILL) {
      throw new Error('STYLE_FILL은 아직 구현되지 않았습니다.');
    } else {
      throw new Error('지원하지 않는 스타일입니다.');
    }
  }

  /**
   * Hexagon group을 focus합니다
   *
   * @return {void} 반환값 없음
   */
  focus() {
    if (!this.hexGroupPolygon) throw new Error('polygon 객체가 없습니다.');
    if (!this.infoFocusHtml) return;

    // focus 스타일로 교체합니다.
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Marker.html#setIcon__anchor
    setHexagonStyleFocus(this.hexGroupPolygon);
    this.infoMarker.setIcon(getInfoMarkerIcon(this.naver, this.infoFocusHtml));
  }

  /**
   * Hexagon group을 blur합니다
   *
   * @return {void} 반환값 없음
   */
  blur() {
    if (!this.hexGroupPolygon) throw new Error('polygon 객체가 없습니다.');
    if (!this.infoHtml) return;

    setHexagonStyleBlur(this.hexGroupPolygon);
    this.infoMarker.setIcon(getInfoMarkerIcon(this.naver, this.infoHtml));
  }

  /**
   * Hexagon group을 지도에서 지웁니다
   *
   * @return {void} 반환값 없음
   */
  remove() {
    if (!this.hexGroupPolygon) throw new Error('polygon 객체가 없습니다.');
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Polygon.html#setMap__anchor
    this.hexGroupPolygon.setMap(null);
    this.hexGroupPolygon = null;

    if (this.infoMarker) {
      this.infoMarker.setMap(null);
      this.infoMarker = null;
    }

    removeListeners(this.naver, this.listeners);
    this.listeners = [];
  }

  /**
   * Hexagon group의 좌표로 Bound 클래스의 인스턴스를 만들어 돌려줍니다.
   *
   * @return {Bound} Bound 클래스의 인스턴스
   */
  getBound() {
    return h3Helper.convertH3IndexToBound(this.h3Indexes);
  }
}
