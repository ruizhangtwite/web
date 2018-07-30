const zx = require('../libs/zhixin');
zx.setUp();
require('./kq.css')
require('./view/LongClick')

const Vue = require('vue');
const VueRouter = require('vue-router');

const egovaNative = require('../libs/egovanative');
const Util = require('Util');

const TravelApply = require('./view/apply/TravelApply.vue');
const TravelApplyHistory = require('./view/apply/TravelApplyHistory.vue');
const AddApply = require('./view/apply/AddApply.vue');
const ApplyHelp = require('./view/apply/ApplyHelp.vue');
const SelectCity = require('./view/apply/SelectCity.vue');
const CheckRule = require('./view/apply/CheckRule.vue');
const EditExplain = require('./view/explain/EditExplain.vue');
const ExplainCases = require('./view/explain/ExplainCases.vue');
const ExplainHistory = require('./view/explain/ExplainHistory.vue');
const calendar = require("./view/calendar/calendar.vue");
const AboutReason = require('./view/explain/AboutReason.vue');
const kqList = require("./view/calendar/kqList.vue");
const juniorHumanList = require("./view/calendar/juniorHumanList.vue");
const TodayKqList = require("./view/today/TodayKqList.vue");
const diligentHumanList = require("./view/calendar/diligentHumanList.vue");
const yearStat = require("./view/calendar/yearStat.vue");
const dynamic = require("./view/calendar/dynamic.vue");
const identifyPosition = require("./view/apply/IdentifyPositon.vue");

const KqLocation = r => require.ensure([], () => r(require('./view/record/KqLocation.vue')), 'map')
const KqLocationList = r => require.ensure([], () => r(require('./view/record/KqLocationList.vue')), 'map')
const KqLocationDetail = r => require.ensure([], () => r(require('./view/record/KqLocationDetail.vue')), 'map')
const KqMap = r => require.ensure([], () => r(require('./view/record/KqMap.vue')), 'map')
const IdentifyAddress = r => require.ensure([], () => r(require('./view/record/IdentifyAddress.vue')), 'map')


//kqStat和team分包打包
const kqStat = r => require.ensure([], () => r(require('./view/calendar/kqStat.vue')), 'group')
const team = r => require.ensure([], () => r(require('./view/calendar/team.vue')), 'group')

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', redirect: '/travelApply'},
        {path: '/travelApply', name: 'travelApply', component: TravelApply},
        {path: '/travelApplyHistory', name: 'travelApplyHistory', component: TravelApplyHistory},
        {path: '/addApply', name: 'addApply', component: AddApply},
        {path: '/applyHelp', name: 'applyHelp', component: ApplyHelp},
        {path: '/recordCity/:humanID', name: 'checkRule', component: CheckRule},
        {path: '/selectCity', name: 'selectCity', component: SelectCity},
        {path: '/editExplain', name: 'editExplain', component: EditExplain},
        {path: '/explainCases', name: 'explainCases', component: ExplainCases},
        {path: '/explainHistory', name: 'explainHistory', component: ExplainHistory},
        {path: '/calendar/:humanID/:humanName', name: 'calendar', component: calendar},
        {path: '/kqList/:humanID/:where/:beginDate/:endDate/:isSelf', name: 'kqList', component: kqList},
        {path: '/juniorHumanList', name: 'juniorHumanList', component: juniorHumanList},
        {path: '/aboutReason', name: 'aboutReason', component: AboutReason},
        {path: '/todayKqList', name: 'todayKqList', component: TodayKqList},
        {path: '/team', name: 'team', component: team},
        {path: '/kqStat', name: 'kqStat', component: kqStat},
        {path: '/diligentHumanList/:humanID/:beginDate/:endDate', name: 'diligentHumanList', component: diligentHumanList},
        {path: '/yearStat/:humanID', name: 'yearStat', component: yearStat},
        {path: '/dynamic', name: 'dynamic', component: dynamic},
        {path: '/kqLocation/:humanID', name: 'kqLocation', component: KqLocation},
        {path: '/kqLocation/:humanID/:clusterID', name: 'kqMapIdentify', component: KqLocation},
        {path: '/kqLocationList', name: 'kqLocationList', component: KqLocationList},
        {path: '/kqLocationDetail', name: 'kqLocationDetail', component: KqLocationDetail},
        {path: '/identifyAddress', name: 'identifyAddress', component: IdentifyAddress},
        {path: '/kqMap', name: 'kqMap', component: KqMap},
        {path: '/identifyPosition', name: 'identifyPosition', component: identifyPosition},
    ]
});

zx.setUpBackHandler(router, Util.getHash());

new Vue({
    router
}).$mount('#app');

egovaNative.loadFinish();