import Vuex from 'vuex';
const store = new Vuex.Store({
    state: {
        todaySalelogList: [],
        isVerify: false
    },
    mutations: {
        SET_TODAY_SALELOG_LIST(state, list) {
            state.todaySalelogList = list;
        },
        SET_IS_VERIFY(state, isVerify) {
            state.isVerify = isVerify;
        }
    }
});
module.exports = store;