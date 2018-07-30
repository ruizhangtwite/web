<template>
    <div>
        <mt-header fixed title="考勤位置">
            <mt-button slot="right" @click.native="goKqList">列表</mt-button>
        </mt-header>
        <group-filter style="position: fixed; z-index:100"
                      v-show="!isIdentifyMode"
                      :style="filterStyle"
                      :data="filterData"
                      class="bdr-b"
                      :toggleMode="true"
                      :selectedIndex="selectedIndex"
                      v-on:onFilterChange="onFilterChange($event)">
        </group-filter>
        <div class="mint-content" id="map" :style="contentStyle"></div>

        <div class="panel row center-child" @click="clickPanel">
            <div class="col">
                <div class="address">{{panelAddress}}</div>
                <div class="info textGray">{{panelInfo}}</div>
            </div>

            <i class="col-center icon-angle-right textGray" v-show="panelAction"></i>
        </div>
    </div>
</template>
<style scoped>
    .panel {
        padding: 10px;
        position: absolute;
        bottom: 0;
        background-color: white;
        width: 100%;
    }

    .panel .info {
        margin-top: 5px;
    }

    .legend {
        position: absolute;
        bottom: 20px;
        left: 10px;
        padding: 10px;
        background-color: white;
        border: 1px solid #DADADA;
        border-radius: 2px;
    }

    .verify, .unverify {
        height: 11px;
        width: 11px;
        margin-right: 10px;
        background-color: #37AEFF;
    }

    .unverify {
        background-color: #EE9A15;
    }

    .legend .row + .row {
        margin-top: 10px;
    }
</style>
<style>
    .bubbleBox {
        position: absolute;
    }

    .bubbleBox .location {
        height: 24px;
        width: 24px;
        margin-top: 10px;
        background-size: cover;
        background-image: url("../../image/icon_location.png");
    }

    .bubble {
        position: relative;
        padding: 10px;
        background-color: #37AEFF;
        border-radius: 3px;
        border: #0F7DC8 1px solid;
        color: white;
        word-break: keep-all;
        white-space: nowrap;
    }

    .bubble.exception {
        background-color: #EE9A15;
        border-color: #B5740E;
    }

    .bubble:after, .bubble:before {
        border: solid transparent;
        content: ' ';
        height: 0;
        top: 100%;
        position: absolute;
        width: 0;
    }

    .bubble:after {
        border-width: 9px;
        border-top-color: #37AEFF;
        left: 50%;
        margin-left: -9px;
    }

    .bubble:before {
        border-width: 10px;
        border-top-color: #0F7DC8;
        left: 50%;
        margin-left: -10px;
    }

    .bubble.exception:after {
        border-top-color: #EE9A15;
    }

    .bubble.exception:before {
        border-top-color: #B5740E;
    }
</style>
<script>
    require('baiduMap');

    import {bindNavBar} from 'egovanative'

    import {Indicator} from 'mint-ui'
    import {Toast} from 'mint-ui'

    import {baseData, baseComputed, resolveResultData} from '../TabManager'
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {locationData, getContentStyle} from '../filterHelper'

    import GroupFilter from '../widget/GroupFilter.vue'

    import BubbleOverlay from './mapUtil'
    import {locationMethods, extraData} from './locationManager'

    import MarkerCluster from './CityCluster'

    function defaultData() {
        return {
            ...baseData(),
            ...extraData(),
            contentStyle: {top: (Util.getHeaderHeight() + 112) + 'px', bottom: '0px'},
            filterStyle: {top: Util.getHeaderHeight() + 'px'},
            filterData: locationData,
            selectedIndex: [0, 0, 0],
            identifyCount: 0,
            unIdentifyCount: 0,
            humanID: gData.humanID,
            hasLocated: false,
            clusterMaker: null,
            panelAddress: '',
            panelInfo: '',
            panelAction: null,
            /**点击聊天室位置异常信息跳转过来，此mode下不显示筛选按钮*/
            isIdentifyMode: false,
            clusterID: null,
        }
    }

    export default{
        data(){
            return {
                ...defaultData(),
                map: null,
            }
        },
        methods: {
            ...locationMethods,
            goKqList() {
                this.$router.push({
                    name: 'kqLocationList',
                    params: {
                        humanID: this.humanID
                    }
                })
            },
            onFilterEnd(list) {
                let bubbleList = this.parseData(list)
                this.addBubbles(bubbleList)
            },
            clickPanel() {
                if (this.panelAction) {
                    this.panelAction()
                }
            },
            resetContentBottom() {
                this.$nextTick(() => {
                    let panel = Util.select('.panel')
                    if (panel && panel.length > 0) {
                        panel = panel[0]
                        this.$set(this.contentStyle, 'bottom', `${panel.offsetHeight}px`)
                    }
                })
            },
            getDateText(isMorning, date) {
                let append = isMorning ? '上' : '下'
                return `${dateUtil.formatDateByDate(date, dateUtil.FORMAT_MD)} ${append}`
            },
            parseData(list) {
                let identifyCount = 0
                let unIdentifyCount = 0
                let bubbleList = list.map(item => {
                    item.identifyFlag > 0 ? identifyCount++ : unIdentifyCount++

                    let bubbleItem = {
                        rawItem: item,
                        num: item.checkIDList.length,
                        lat: item.Lat,
                        lng: item.Lng,
                        isIdentify: item.identifyFlag > 0,
                        cityCode: item.BaiduCode,
                        cityName: item.CityName,
                        text: `${item.checkIDList.length}`
                    }

                    if (item.dateList.length > 0) {
                        bubbleItem.firstDate = item.dateList[0].dateText
                    }

                    if (item.dateList.length > 1) {
                        bubbleItem.secondDate = item.dateList[1].dateText
                    }

                    return bubbleItem
                })

                this.identifyCount = identifyCount
                this.unIdentifyCount = unIdentifyCount

                return bubbleList
            },
            addBubbles(list) {
                if (this.clusterMaker) {
                    this.clusterMaker.destroy();
                }
                let map = this.map
                map.clearOverlays()
                if (list.length > 0) {
                    let pointList = list.map(item => {
                        return {'lng': item.lng, 'lat': item.lat}
                    })
                    let view = map.getViewport(eval(pointList))
                    this.hasLocated = true
                    if (view.zoom > 11) {
                        view.zoom = 11
                    }
                    map.centerAndZoom(view.center, view.zoom)
                }

                list.map(item => {
                    item.marker = new BubbleOverlay(new BMap.Point(item.lng, item.lat), {
                        ...item,
                        callback: () => {
                            map.centerAndZoom(item.marker.getPosition(), 13)
                            this.panelAddress = item.rawItem.Address
                            this.panelInfo = `有${item.num}条考勤记录`
                            this.resetContentBottom()
                            this.panelAction = () => {
                                this.onBubbleClick(item.rawItem)
                            }
                        }
                    })
                })

                this.clusterMaker = new MarkerCluster(map, {
                    items: list,
                    onClusterClick: (cluster) => {
                        let pointList = cluster._markers.map(item => {
                            return {'lng': item.lng, 'lat': item.lat}
                        })
                        let view = map.getViewport(eval(pointList))
                        if (view.zoom > 11) {
                            view.zoom = 11
                        }
                        map.centerAndZoom(view.center, view.zoom)

                        this.panelAddress = cluster._cityName
                        this.panelInfo = `有${cluster._totalCount}条考勤记录 ${cluster._identifyCount}条认证 ${cluster._unIdentifyCount}条未认证`
                        this.panelAction = null
                        this.resetContentBottom()
                    }
                })

                let clusters = this.clusterMaker._clusters
                let address = ''
                let totalCheck = 0
                let identifyCount = 0
                let unIdentifyCount = 0
                clusters.map(cluster => {
                    if (!address) {
                        address += cluster._cityName
                    }
                    totalCheck += cluster._totalCount
                    identifyCount += cluster._identifyCount
                    unIdentifyCount += cluster._unIdentifyCount
                })
                if (clusters.length > 1) {
                    this.panelAddress = `${address}等${clusters.length}个城市`
                } else {
                    this.panelAddress = address
                }
                this.panelInfo = `共${totalCheck}条考勤记录 ${identifyCount}条认证 ${unIdentifyCount}条未认证`
                this.panelAction = null
                this.resetContentBottom()

                if (this.isIdentifyMode && list.length > 0) {
                    list[0].marker.content.callback()
                }
            },
            onBubbleClick(item) {
                if (this.isIdentifyMode) {
                    this.$router.push({
                        name: 'identifyAddress',
                        params: {
                            checkItem: item,
                            humanID: this.humanID,
                            callback: () => {
                                this.fetchData()
                            }
                        }
                    })
                } else {
                    this.$router.push({
                        name: 'kqLocationDetail',
                        params: {
                            checkItem: item,
                            isMonth: this.selectedIndex[0] == 0,
                            humanID: this.humanID,
                            isIdentifyMode: this.isIdentifyMode
                        }
                    })
                }

            },
            initOnCreate () {
                Util.resetObject(this, defaultData())

                let params = this.$route.params
                this.humanID = params && params.humanID || gData.humanID
                this.clusterID = params && params.clusterID
                this.isIdentifyMode = this.clusterID != null

                this.contentStyle = this.isIdentifyMode ? {top: 0} : getContentStyle()
                this.resetContentBottom()

                this.fetchData()
            },
        },
        mounted() {
            this.map = new BMap.Map('map')
            let vue = this
            new BMap.Geolocation().getCurrentPosition(function (r) {
                if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                    if (!vue.hasLocated) {
                        vue.map.centerAndZoom(r.point, 11)
                    } else {
                        vue.hasLocated = true
                    }
                }
            }, {enableHighAccuracy: true})
            this.map.addControl(new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                type: BMAP_NAVIGATION_CONTROL_SMALL
            }));
        },
        components: {
            'group-filter': GroupFilter
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    vm.initOnCreate()
                }
                if (vm.isIdentifyMode) {
                    bindNavBar('考勤位置')
                } else {
                    bindNavBar('考勤位置', '列表', () => {
                        vm.goKqList()
                    })
                }
            })
        }
    }
</script>
