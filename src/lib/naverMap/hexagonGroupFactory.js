import { HexagonGroup } from '@/lib/naverMap/HexagonGroup';

export default {
  /**
   * Naver map 위에 h3Index 배열을 받아 외곽선을 그립니다.
   * infoHtml, infoFocusHtml에 정보를 주면, 우측에 추가 정보창을 그려줍니다.
   * infoHtml는 mouseout, infoFocusHtml는 mouseover 상황의 HTML을 나타냅니다.
   *
   * @param {array} h3Indexes - Hexagon을 그리기 위한 H3Index들의 배열
   * @param {string} infoHtml - 추가 정보창 HTML. mouseout시의 모습
   * @param {string} infoFocusHtml - 추가 정보창 HTML. mouseover시의 모습
   *
   * @return {HexagonGroup} HexagonGroup의 인스턴스
   */
  createHexagonGroup({
    h3Indexes = [],
    infoHtml = '',
    infoFocusHtml = '',
  }) {
    return new HexagonGroup({
      h3Indexes,
      infoHtml,
      infoFocusHtml,
    });
  },
  /**
   * 디렉터 웹의 통합관제 지도의 Physical group(지역 그룹) hexagon을 그립니다.
   * PhysicalGroup의 상세 정보 마커도 함께 그립니다.
   *
   * @param {array} h3Indexes - Physical group을 나타내는 h3Index
   * @param {string} physicalGroupName - Physical group의 이름
   * @param {string} driverCnt - Physical group에서 배차 가능한 Driver의 인원수
   * @param {string} deliveryCnt - Physical group에서 배차 대기중인 delivery(배송)의 갯수
   *
   * @return {HexagonGroup} HexagonGroup의 인스턴스
   */
  createPhysicalGroup({
    h3Indexes = [],
    physicalGroupName = '',
    driverCnt = 0,
    deliveryCnt = 0,
  }) {
    const getInfoHtml = (style) => ([
      `<div style="${style}">`,
      ` <div>지역 그룹: ${physicalGroupName}</div>`,
      ` <div>배차 가능한 드라이버 수: ${driverCnt} 명</div>`,
      ` <div>배차 대기중인 배송 수: ${deliveryCnt} 건</div>`,
      '</div>',
    ].join(''));

    const styleMouseout = [
      'color: black;',
      'font-size: .6rem;',
    ].join('');

    const styleMouseover = [
      'color: red;',
      'font-size: .6rem;',
    ].join('');

    return new HexagonGroup({
      h3Indexes,
      infoHtml: getInfoHtml(styleMouseout),
      infoFocusHtml: getInfoHtml(styleMouseover),
    });
  },
};
