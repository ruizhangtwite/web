const zx = require('zhixin');
import Http from '../libs/Http'
import Data from '../libs/business/data'

zx.setUp({
    showHeader: false,
    requestType: Http.TYPE.v11,
    data: Data.v11
});
require('./main.css')

const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util = require('Util');

const CaseList = require('./view/CaseList.vue');
const Detail = require('./view/Detail.vue');

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', redirect: '/caseList'},
        {path: '/caseList', name: 'caseList', component: CaseList},
        {path: '/detail', name: 'detail', component: Detail},
    ]
});

zx.setUpBackHandler(router, Util.getHash());

new Vue({
    router
}).$mount('#app');

egovaNative.loadFinish();