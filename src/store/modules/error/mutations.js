export default {
  ERROR__ADD_ERROR(state, payload) {
    if (process.env.NODE_ENV !== 'production') {
      /* eslint-disable no-console */
      console.log('error: ', payload); // 디버깅 용도로 사용
    }
    state.errors.push(payload);
  },
};
