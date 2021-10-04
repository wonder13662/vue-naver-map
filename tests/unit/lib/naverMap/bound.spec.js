import boundFactory from '@/lib/naverMap/boundFactory';

describe('lib/naverMap/bound.js', () => {
  test('#1 Bound.merge - 두개의 bound가 합쳐져 더 넓은 영역의 bound를 만듭니다', () => {
    const boundA = boundFactory.createBound({ lat: 20, lng: 20 }, { lat: 30, lng: 30 });
    const boundB = boundFactory.createBound({ lat: 10, lng: 10 }, { lat: 40, lng: 40 });
    const boundC = boundA.merge(boundB);

    expect(boundC.sw.lat).toBe(10);
    expect(boundC.sw.lng).toBe(10);

    expect(boundC.ne.lat).toBe(40);
    expect(boundC.ne.lng).toBe(40);
  });

  test('#2-1 예외상황: sw 값이 유효하지 않음', () => {
    const sw = null;
    const ne = { lat: 30, lng: 30 };
    // https://github.com/jest-community/eslint-plugin-jest/blob/v23.3.0/docs/rules/no-try-expect.md
    expect(() => boundFactory.createBound(sw, ne)).toThrow('sw의 값이 유효하지 않습니다.');
  });

  test('#2-2 예외상황: ne 값이 유효하지 않음', () => {
    const sw = { lat: 30, lng: 30 };
    const ne = null;
    expect(() => boundFactory.createBound(sw, ne)).toThrow('ne의 값이 유효하지 않습니다.');
  });

  test('#2-3 예외상황: sw.lat 값이 유효한 범위가 아님', () => {
    const sw = { lat: 91, lng: 30 };
    const ne = { lat: 30, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lat:${sw.lat}이 유효한 범위가 아닙니다.`);
  });

  test('#2-4 예외상황: sw.lat 값이 유효한 범위가 아님', () => {
    const sw = { lat: -91, lng: 30 };
    const ne = { lat: 30, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lat:${sw.lat}이 유효한 범위가 아닙니다.`);
  });

  test('#2-5 예외상황: sw.lng 값이 유효한 범위가 아님', () => {
    const sw = { lat: 30, lng: -181 };
    const ne = { lat: 30, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lng:${sw.lng}이 유효한 범위가 아닙니다.`);
  });

  test('#2-6 예외상황: sw.lng 값이 유효한 범위가 아님', () => {
    const sw = { lat: 30, lng: 181 };
    const ne = { lat: 30, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lng:${sw.lng}이 유효한 범위가 아닙니다.`);
  });

  test('#2-7 예외상황: ne.lat 값이 유효한 범위가 아님', () => {
    const sw = { lat: 30, lng: 30 };
    const ne = { lat: 91, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`ne.lat:${ne.lat}이 유효한 범위가 아닙니다.`);
  });

  test('#2-8 예외상황: ne.lat 값이 유효한 범위가 아님', () => {
    const sw = { lat: 30, lng: 30 };
    const ne = { lat: -91, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`ne.lat:${ne.lat}이 유효한 범위가 아닙니다.`);
  });

  test('#2-9 예외상황: ne.lng 값이 유효한 범위가 아님', () => {
    const sw = { lat: 30, lng: 30 };
    const ne = { lat: 30, lng: -181 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`ne.lng:${ne.lng}이 유효한 범위가 아닙니다.`);
  });

  test('#2-10 예외상황: ne.lng 값이 유효한 범위가 아님', () => {
    const sw = { lat: 30, lng: 30 };
    const ne = { lat: 30, lng: 181 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`ne.lng:${ne.lng}이 유효한 범위가 아닙니다.`);
  });

  test('#2-11 예외상황: sw.lat가 ne.lat와 같음', () => {
    const sw = { lat: 30, lng: 30 };
    const ne = { lat: 30, lng: 40 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lat:${sw.lat}는 ne.lat:30보다 작아야 합니다`);
  });

  test('#2-12 예외상황: sw.lat가 ne.lat보다 큼', () => {
    const sw = { lat: 40, lng: 30 };
    const ne = { lat: 30, lng: 40 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lat:${sw.lat}는 ne.lat:${ne.lat}보다 작아야 합니다`);
  });

  test('#2-13 예외상황: sw.lng가 ne.lng와 같음', () => {
    const sw = { lat: 30, lng: 30 };
    const ne = { lat: 40, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lng:${sw.lng}는 ne.lng:${ne.lng}보다 같거나 작아야 합니다`);
  });

  test('#2-14 예외상황: sw.lat가 ne.lat보다 큼', () => {
    const sw = { lat: 30, lng: 40 };
    const ne = { lat: 40, lng: 30 };
    expect(() => boundFactory.createBound(sw, ne)).toThrow(`sw.lng:${sw.lng}는 ne.lng:${ne.lng}보다 같거나 작아야 합니다`);
  });
});
