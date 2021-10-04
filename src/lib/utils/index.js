export default {
  isLatitude(v) {
    return Number.isFinite(v) && v >= -90 && v <= 90;
  },
  isLongitude(v) {
    return Number.isFinite(v) && v >= -180 && v <= 180;
  },
};
