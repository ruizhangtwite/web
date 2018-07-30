/**
 * Created by jhj on 2017/3/17.
 */
const zx = require('../libs/zhixin');
zx.setUp();

const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util = require('../libs/Util');

const Home = require('./view/Home.vue');

const router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes: [
        { path: '/', name: 'home', component: Home },
    ]
});

new Vue({
    router
}).$mount('#app');

zx.setUpBackHandler(router, Util.getHash());

egovaNative.loadFinish();