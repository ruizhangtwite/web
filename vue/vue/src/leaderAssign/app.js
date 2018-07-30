const zx = require('../libs/zhixin');
import Http from '../libs/Http'
import Data from '../libs/business/data'

zx.setUp({
    showHeader: true,
    requestType: Http.TYPE.v11,
    data: Data.v11
});


require('./main.css');

const Vue = require('vue');
const VueRouter = require('vue-router');

//不知道有用吗，先引进来
const Util = require('Util');

const Home = require('./view/home.vue');
const NewTask = require('./view/newTask.vue');
const Reply = require('./view/reply.vue');


const router = new VueRouter({
    //滚轮行为
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', name: 'home', component: Home},
        {path: '/newTask', name: 'newTask', component: NewTask},
        {path: '/reply', name: 'reply', component: Reply},
    ]
});

zx.setUpBackHandler(router, Util.getHash());

new Vue({
    router
}).$mount('#app');

