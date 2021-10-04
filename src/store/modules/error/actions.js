import {
  ERROR__ADD_ERROR,
} from '@/store/mutationTypes';

export default {
  addError({ commit }, payload) {
    commit(ERROR__ADD_ERROR, payload);
  },
};
