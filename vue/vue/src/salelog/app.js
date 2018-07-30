const zx = require('../libs/zhixin');
zx.setUp();
require('./main.css')

const store = require('./store');
const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util  = require('../libs/Util');

const Home = require('./view/Home.vue');

const AddSalelog = require('./view/addsalelog/AddSaleLog.vue');
const ProjectList = require('./view/project/ProjectList.vue');
const VerifyUser = require('./view/VerifyUser.vue');
const Draft = require('./view/addsalelog/Draft.vue');
const ProjectSalelogList = require('./view/saleloglist/ProjectSalelogList.vue');
const HumanSalelogList = require('./view/saleloglist/HumanSalelogList.vue');
const AddProject = require('./view/project/AddProject.vue');
const FocusHuman = require('./view/juniorHumanList.vue');
const HumanList = require('./view/HumanList.vue');

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', name: 'home', component: Home},
        {path: '/addSalelog', name: 'addSalelog', component: AddSalelog},
        {path: '/verifyUser', name: 'verifyUser', component: VerifyUser},
        {path: '/projectList', name: 'projectList', component: ProjectList},
        {path: '/draft', name: 'draft', component: Draft},
        {path: '/projectSalelogList/:projectID', name: 'projectSalelogList', component: ProjectSalelogList},
        {path: '/humanSalelogList/:humanID', name: 'humanSalelogList', component: HumanSalelogList},
        {path: '/addProject', name: 'addProject', component: AddProject},
        {path: '/focusHuman', name: 'focusHuman', component: FocusHuman},
        {path: '/humanList', name: 'humanList', component: HumanList}
    ]
});

new Vue({
    store,
    router
}).$mount('#app');

zx.setUpBackHandler(router, Util.getHash());

egovaNative.loadFinish();