const zx = require('../libs/zhixin');

zx.setUp({
    showHeader: true,
});
require('./main.css')

const Vue = require('vue');
const VueRouter = require('vue-router');
const Util = require('Util');

zx.data.productID = Util.getRequestParam("productID");
zx.data.regionType = Util.getRequestParam("regionType");
zx.data.regionID = Util.getRequestParam("regionID");



const Home = require('./view/home.vue');
const Result = require('./view/result.vue');


const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', redirect: '/home'},
        {path: '/home', name: 'home', component: Home},
        {path: '/result', name: 'result', component: Result},

    ]
});

zx.setUpBackHandler(router, Util.getHash());

new Vue({
    router
}).$mount('#app');

