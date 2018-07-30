const zx = require('../libs/zhixin');
zx.setUp({
    showHeader: false
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
const Gallery = require('./view/Gallery.vue');

const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes: [
        {path: '/', redirect: '/report'},
        {path: '/report', name: 'report', component: Report},
        {path: '/selectAddress', name: 'selectAddress', component: SelectAddress},
        {path: '/login', name: 'login', component: Login},
        {path: '/gallery', name: 'gallery', component: Gallery},
    ]
});

zx.setUpBackHandler(router, Util.getHash());

new Vue({
    router
}).$mount('#app');

import {getConfig} from '../libs/wxUtil'
var config = getConfig()

require('../libs/jweixin-1.2.0')
wx.config({
    debug: false,
    appId: 'wx6eb0450c307fab33',
    timestamp: config.timestamp,
    nonceStr: config.nonceStr,
    signature: config.signature,
    jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onVoiceRecordEnd',
        'playVoice',
        'onVoicePlayEnd',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
    ]
})

wx.ready(function () {
});

