import { Bound } from './Bound';

export default {
  /**
   * Hexagon group의 좌표로 Bound 클래스의 인스턴스를 만들어 돌려줍니다.
   *
   * @return {Bound} Bound 클래스의 인스턴스
   */
  createBound: (sw, ne) => (new Bound(sw, ne)),
};
