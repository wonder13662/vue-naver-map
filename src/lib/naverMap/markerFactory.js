let naver;
let map;
export default {
  setNaver(_naver) {
    naver = _naver;
  },
  setMap(_map) {
    map = _map;
  },
  createDefaultMarker: ({
    lat,
    lng,
    name,
    color = 'red',
    bgColor = 'white',
    info = '언제나 노출되는 정보창입니다',
  }) => {
    if (!naver) throw new Error('naver api 객체가 없습니다.');
    if (!map) throw new Error('naver map 객체가 없습니다.');

    const size = new naver.maps.Size(24, 36);
    const anchor = new naver.maps.Point(12, 36);

    const styleContainer = 'opacity:.8;';
    const styleMarkerHead = [
      `background:${color};`,
      'position: absolute;',
      'z-index: 1;',
      'width: 18px;',
      'height: 18px;',
      'border-radius: 9px;',
      'top: 3px;',
      'left: 3px;',
      'box-sizing: border-box;',
    ].join('');

    const styleMarkerBgHead = [
      `background:${bgColor};`,
      'width: 24px;',
      'height: 24px;',
      'border-radius: 12px;',
      'box-sizing: border-box;',
      'z-index: -1;',
    ].join('');
    const styleMarkerBgTail = [
      `background:${bgColor};`,
      'position: absolute;',
      'width: 18px;',
      'height: 18px;',
      'left: 50%;',
      'transform: translate(-50%, -13px) rotate(45deg) skew(16deg, 16deg);',
      'z-index: -2;',
    ].join('');

    const icon = {
      content: [
        `<div id="marker-container" style="${styleContainer}">`,
        ` <div id="marker-head" style="${styleMarkerHead}"></div>`,
        ` <div id="marker-bg-head" style="${styleMarkerBgHead}"></div>`,
        ` <div id="marker-bg-tail" style="${styleMarkerBgTail}"></div>`,
        '</div>',
      ].join(''),
      size,
      anchor,
    };

    const iconHover = {
      content: [
        '<div id="marker-container">',
        ` <div id="marker-head" style="${styleMarkerHead}"></div>`,
        ` <div id="marker-bg-head" style="${styleMarkerBgHead}"></div>`,
        ` <div id="marker-bg-tail" style="${styleMarkerBgTail}"></div>`,
        '</div>',
      ].join(''),
      size,
      anchor,
    };

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map,
      icon,
    });

    // marker의 이름을 표시하는 label
    const styleMarkerLabelContainer = [
      'min-width: 150px;',
    ].join('');
    const styleMarkerLabel = [
      `background:${color};`,
      `border: 1px solid ${bgColor};`,
      'display: inline-block;',
      'font-size: 0.7rem;',
      'padding: 3px 11px;',
      'border-radius: 16px;',
    ].join('');

    const label = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map,
      icon: {
        content: [
          `<div id="marker-label-container" style="${styleMarkerLabelContainer}">`,
          ` <div id="marker-label" style="${styleMarkerLabel}">`,
          `  ${name}`,
          ' </div>',
          '</div>',
        ].join(''),
        anchor: new naver.maps.Point(-18, 38),
      },
    });

    // https://navermaps.github.io/maps.js.ncp/docs/tutorial-1-infowindow-simple.example.html
    // https://navermaps.github.io/maps.js.ncp/docs/tutorial-infowindow-options.example.html
    // Naver native info 윈도우 띄우기
    const infoWindow = new naver.maps.InfoWindow({
      content: [
        '<div>',
        '정보창입니다',
        '</div>',
      ].join(''),
    });

    // 커스텀 정보창(실은 추가 마커임)
    const styleCustomInfoWindow = [
      'background: white;',
      'border:solid 1px rgba(0,0,0,.3);',
      'width: 150px;',
      'padding: 5px;',
      'font-size: .6rem;',
    ].join('');
    const customInfoWindow = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map,
      icon: {
        content: [
          `<div style="${styleCustomInfoWindow}">`,
          `${info}`,
          '</div>',
        ].join(''),
        anchor: new naver.maps.Point(0, 0),
      },
    });
    customInfoWindow.setMap(null);

    const setAnimationBounce = () => marker.setAnimation(naver.maps.Animation.BOUNCE);
    const removeAnimationBounce = () => marker.setAnimation(null);
    const focus = () => {
      marker.setIcon(iconHover);
      customInfoWindow.setMap(map);
    };
    const blur = () => {
      marker.setIcon(icon);
      customInfoWindow.setMap(null);
    };
    const openInfoWindow = () => infoWindow.open(map, marker);
    const closeInfoWindow = () => infoWindow.close();

    const { addListener } = naver.maps.Event;
    const listeners = [];
    listeners.push(addListener(marker, 'click', () => {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }
    }));
    listeners.push(addListener(marker, 'mouseover', () => focus()));
    listeners.push(addListener(marker, 'mouseout', () => blur()));

    const remove = () => {
      listeners.forEach((v) => naver.maps.Event.removeListener(v));
      removeAnimationBounce();
      marker.setMap(null);
      label.setMap(null);
      customInfoWindow.setMap(null);
    };

    return {
      remove,
      focus,
      blur,
      setAnimationBounce,
      removeAnimationBounce,
      openInfoWindow,
      closeInfoWindow,
    };
  },
  createNaverMarker: ({
    lat,
    lng,
  }) => {
    if (!naver) throw new Error('naver api 객체가 없습니다.');
    if (!map) throw new Error('naver map 객체가 없습니다.');

    return new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map,
    });
  },
};
