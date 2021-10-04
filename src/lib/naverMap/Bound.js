import utils from '@/lib/utils';

/* eslint-disable import/prefer-default-export */
export class Bound {
  constructor(sw, ne) {
    if (!sw) {
      throw new Error('sw의 값이 유효하지 않습니다.');
    }
    if (!ne) {
      throw new Error('ne의 값이 유효하지 않습니다.');
    }
    if (!utils.isLatitude(sw.lat)) {
      throw new Error(`sw.lat:${sw.lat}이 유효한 범위가 아닙니다.`);
    }
    if (!utils.isLongitude(sw.lng)) {
      throw new Error(`sw.lng:${sw.lng}이 유효한 범위가 아닙니다.`);
    }
    if (!utils.isLatitude(ne.lat)) {
      throw new Error(`ne.lat:${ne.lat}이 유효한 범위가 아닙니다.`);
    }
    if (!utils.isLongitude(ne.lng)) {
      throw new Error(`ne.lng:${ne.lng}이 유효한 범위가 아닙니다.`);
    }
    if (sw.lat >= ne.lat) { // TODO 음수인 지역도 있다. 음수인 경우는 더 작은 것이 맞다. 절대값으로 처리하면 될까? 확인 필요.
      throw new Error(`sw.lat:${sw.lat}는 ne.lat:${ne.lat}보다 작아야 합니다`);
    }
    if (sw.lng >= ne.lng) { // TODO 음수인 지역도 있다. 음수인 경우는 더 작은 것이 맞다. 절대값으로 처리하면 될까? 확인 필요.
      throw new Error(`sw.lng:${sw.lng}는 ne.lng:${ne.lng}보다 같거나 작아야 합니다`);
    }

    this.sw = {
      lat: sw.lat,
      lng: sw.lng,
    };
    this.ne = {
      lat: ne.lat,
      lng: ne.lng,
    };
  }

  /**
   * 다른 bound의 영역과 자신의 영역을 합칩니다.
   *
   * @param {Bound} 합칠 대상이 되는 Bound 클래스의 인스턴스
   *
   * @return {Bound} Bound 클래스의 인스턴스
   */
  merge(bound) {
    const { sw, ne } = bound;
    const result = {
      sw: this.sw,
      ne: this.ne,
    };

    if (!result.sw.lat || result.sw.lat > sw.lat) {
      result.sw.lat = sw.lat;
    }
    if (!result.sw.lng || result.sw.lng > sw.lng) {
      result.sw.lng = sw.lng;
    }
    if (!result.ne.lat || result.ne.lat < ne.lat) {
      result.ne.lat = ne.lat;
    }
    if (!result.ne.lng || result.ne.lng < ne.lng) {
      result.ne.lng = ne.lng;
    }
    return new Bound(result.sw, result.ne);
  }

  // TODO 현재 경계보다 확대, 축소된 경계를 제공하는 기능이 필요함
}
