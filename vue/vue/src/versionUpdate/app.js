const zx = require('../libs/zhixin');
zx.setUp();

const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util = require('Util');

const versionUpdate = require("./view/versionUpdate.vue");
const updateDetail = require("./view/updateDetail.vue");
const versionInfo = require("./view/versionInfo.vue");

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', redirect: '/versionUpdate'},
        {path: '/versionUpdate', name: 'versionUpdate', component: versionUpdate},
        {path: '/updateDetail', name: 'updateDetail', component: updateDetail},
        {path: '/versionInfo', name: 'versionInfo', component: versionInfo}
    ]
});
new Vue({
    router
}).$mount('#app');


zx.setUpBackHandler(router, Util.getHash());

egovaNative.loadFinish();