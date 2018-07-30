/**
 * Created by jhj on 2017/4/11.
 */
const zx = require('../libs/zhixin');

import Http from '../libs/Http'
import Data from '../libs/business/data'

zx.setUp({
    showHeader: false,
    requestType: Http.TYPE.v11,
    data: Data.v11
});

const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util  = require('../libs/Util');

const Home = require('./view/Home.vue');
const PersonList = require('./view/PersonList.vue');
const CaseList = require('./view/CaseList.vue');

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', name: 'home', component: Home},
        {path: '/personlist/:type', name: 'personlist', component:PersonList},
        {path: '/caselist/:type', name: 'caselist', component:CaseList},
    ]
});

new Vue({
    router
}).$mount('#app');

zx.setUpBackHandler(router, Util.getHash());

egovaNative.loadFinish();