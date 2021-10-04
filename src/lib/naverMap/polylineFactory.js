let naver;
let map;

const addMileStone = (point, text) => {
  const style = [
    'display:inline-block;',
    'padding: 1px 5px;',
    'text-align:center;',
    'font-size:.6rem;',
    'color: white;',
    'font-weight: bold;',
    'background: red;',
    'border-radius: 10px;',
  ].join('');
  const mileStone = new naver.maps.Marker({
    position: point,
    icon: {
      content: `<div style="${style}"><span>${text}m</span></div>`,
      anchor: new naver.maps.Point(20, 15),
    },
    map,
  });

  return mileStone;
};

export default {
  setNaver(_naver) {
    naver = _naver;
  },
  setMap(_map) {
    map = _map;
  },
  createDistanceLine({
    start,
    end,
  }) {
    if (!start.lat || !start.lng) throw new Error('start 객체가 유효하지 않습니다.');
    if (!end.lat || !end.lng) throw new Error('end 객체가 유효하지 않습니다.');
    // https://navermaps.github.io/maps.js.ncp/docs/tutorial-shape-measures.example.html
    // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Polyline.html
    // 실제 거리재기에 사용되는 폴리라인을 생성합니다.
    const coord = [
      new naver.maps.LatLng(start.lat, start.lng),
      new naver.maps.LatLng(end.lat, end.lng),
    ];
    // 화살표 스타일 적용
    // https://navermaps.github.io/maps.js.ncp/docs/tutorial-pointing-icon.example.html
    const polyline = new naver.maps.Polyline({
      strokeColor: '#f00',
      strokeWeight: 4,
      strokeOpacity: 0.8,
      endIcon: naver.maps.PointingIcon.OPEN_ARROW,
      path: coord,
      map,
    });

    // 거리를 나타내는 위치는 출발과 도착의 중간 위치이어야 합니다.
    const latDiff = (end.lat - start.lat) / 2;
    const lngDiff = (end.lng - start.lng) / 2;
    const pointToMileStone = new naver.maps.LatLng(start.lat + latDiff, start.lng + lngDiff);

    // 폴리라인의 거리를 미터 단위로 반환합니다.
    const distanceInMeter = Math.round(polyline.getDistance());
    const mileStone = addMileStone(pointToMileStone, distanceInMeter);

    const remove = () => {
      polyline.setMap(null);
      mileStone.setMap(null);
    };

    return {
      remove,
    };
  },
};
