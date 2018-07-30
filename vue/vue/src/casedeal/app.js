/**
 * Created by jhj on 2017/4/20.
 */
const zx = require('zhixin');
zx.setUp();
require('./main.css')

const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util = require('Util');

const CaseList = require('./view/CaseList.vue');

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', redirect: '/caseList'},
        {path: '/caseList', name: 'caseList', component: CaseList},
    ]
});

zx.setUpBackHandler(router, Util.getHash());

new Vue({
    router
}).$mount('#app');

egovaNative.loadFinish();