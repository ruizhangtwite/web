/**
 * Created by jhj on 2017/3/17.
 */
const zx = require('../libs/zhixin');
zx.setUp();

const Vue = require('vue');
const VueRouter = require('vue-router');

const Util = require('../libs/Util');

const Home = require('./view/Home.vue');
const Result = require('./view/Result.vue');

const router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/result', name: 'result', component: Result }
    ]
});

new Vue({
    router
}).$mount('#app');

// zx.setUpBackHandler(router, Util.getHash());