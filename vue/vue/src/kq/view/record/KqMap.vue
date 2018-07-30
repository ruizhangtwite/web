<template>
    <div>
        <mt-header fixed title="考勤位置">
        </mt-header>
        <div class="mint-content" :style="contentStyle" id="map2"></div>
        <div class="bottom">
            <div>{{address}}
                <span :class="[identifyFlag != 1 ? 'textBrown' : 'textBlue']"
                      v-if="identifyInfo">({{identifyInfo}})</span></div>
        </div>
    </div>
</template>

<style scoped>
    .bottom {
        padding: 5px;
        position: absolute;
        top: 0;
        background-color: white;
        width: 100%;
    }

    .bottom div {
        padding: 5px;
    }
</style>

<script>
    require('baiduMap')

    import {bindNavBar} from 'egovanative'
    import Util from 'Util'
    import http from 'Http';

    export default{
        data() {
            return {
                map: null,
                address: '',
                contentStyle: {top: `${Util.getHeaderHeight()}px`},
                identifyFlag: -1//-1未知，0：未认证，1：认证为工作地点，2：认证为非工作地点
            }
        },
        methods: {
            initOnCreate () {
                let params = this.$route.params
                this.address = params.address || '未知地点'
                let p = new BMap.Point(params.lng, params.lat)
                //第二次进入这个界面会出现定位偏差，移动地图后又会变好。
                //TODO FIXME 这里给一个延时，暂时解决问题
                setTimeout(() => {
                    this.map.centerAndZoom(p, 11)
                    this.map.clearOverlays()
                    this.map.addOverlay(new BMap.Marker(p))
                }, 100)
                this.resetContentStyle()
                this.getIdentifyInfo()
            },
            resetContentStyle() {
                this.$nextTick(() => {
                    let panel = Util.select('.address')
                    if (panel && panel.length > 0) {
                        panel = panel[0]
                        this.$set(this.contentStyle, 'top', `${panel.offsetHeight + Util.getHeaderHeight()}px`)
                    }
                })
            },
            getIdentifyInfo() {
                let params = this.$route.params
                if (!params.lng || !params.lat || !params.humanID) {
                    return
                }
                http.ajax({
                    functionName: '/mi/cluster/getlatlngidentifyflag',
                    params: {
                        humanID: params.humanID,
                        lng: params.lng,
                        lat: params.lat
                    },
                    success: (resultInfo)=> {
                        if (resultInfo && resultInfo.success) {
                            let data = resultInfo.data
                            if (data) {
                                this.identifyFlag = data.identifyFlag || 0
                                this.resetContentStyle()
                            }
                        }
                    }
                });
            }
        },
        computed: {
            identifyInfo() {
                switch (this.identifyFlag) {
                    case -1:
                        return null
                    case 1:
                        return '已认证为工作地点'
                    case 2:
                        return '已认证为非工作地点'
                    default:
                        return '未认证'
                }
            }
        },
        mounted() {
            this.map = new BMap.Map('map2')
            this.map.addControl(new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                type: BMAP_NAVIGATION_CONTROL_SMALL
            }));
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.initOnCreate()
                bindNavBar('考勤位置')
            })
        }
    }
</script>
