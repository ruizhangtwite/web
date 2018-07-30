/**
 * Created by jhj on 2017/3/17.
 */
const zx = require('../libs/zhixin');
import Http from '../libs/Http'
import Data from '../libs/business/data'
import Util from '../libs/Util'

zx.setUp({
    showHeader: false,
    requestType: Http.TYPE.v14,
    data: Data.v14
});

zx.data.setToken(Util.getRequestParam("token"));

const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util  = require('../libs/Util');

const Home = require('./view/Home.vue');
const Detail = require('./view/Detail.vue');

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', name: 'home', component: Home},
        {path: '/detail/:object', name: 'detail', component: Detail}
    ]
});

new Vue({
    router
}).$mount('#app');

zx.setUpBackHandler(router, Util.getHash());

egovaNative.loadFinish();