const zx = require('../libs/zhixin');
import Http from '../libs/Http'
import Data from '../libs/business/data'

zx.setUp({
    showHeader: false,
    requestType: Http.TYPE.v14,
    data: Data.v14
});

require('./main.css')

const Vue = require('vue');
const VueRouter = require('vue-router');

const Util = require('Util');

import LongClick from '../libs/directive/LongClick'
Vue.use(LongClick)

const Report = require('./view/Report.vue');
const SelectAddress = require('./view/SelectAddress.vue');
const Login = require('./view/Login.vue');
const Register = require('./view/Register.vue');
const Gallery = require('./view/Gallery.vue');
const CaseList = require('./view/CaseList.vue');

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', redirect: '/report'},
        {path: '/report', name: 'report', component: Report},
        {path: '/selectAddress', name: 'selectAddress', component: SelectAddress},
        {path: '/login', name: 'login', component: Login},
        {path: '/register', name: 'register', component: Register},
        {path: '/gallery', name: 'gallery', component: Gallery},
        {path: '/caseList', name: 'caseList', component: CaseList},
    ]
});

zx.setUpBackHandler(router, Util.getHash());

new Vue({
    router
}).$mount('#app');

import {doConfig} from '../libs/wxUtil'
doConfig()
