<template>
    <div>
        <mt-header fixed title="考勤记录"></mt-header>
        <div :style="headStyle" class="headRows middleFont">
            <div class="bdr-b headRow flex center-child">
                {{dateSpanText}}
            </div>
            <div class="headRow row">
                <span class="col col-center">
                    {{address}}
                    <span :style="{color: identifyFlag > 0 ? '#37AEFF' : '#EE9A15'}">
                        ({{identifyFlag == 0 ? '位置未认证' : identifyFlag == 1 ? '已认证为工作地点' : '已认证为非工作地点'}})
                    </span>
                </span>
            </div>
        </div>

        <div class="mint-content soft-scrollable" :style="contentStyle">
            <div class="sectionEmpty" v-if="isEmpty">
                列表为空
            </div>
            <div
                    v-infinite-scroll="loadData"
                    infinite-scroll-disabled="disableLoad"
                    infinite-scroll-distance="10"
                    infinite-scroll-immediate-check="false">
                <check-list :dataList='dataList'></check-list>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .headRow {
        padding: 10px 15px;
    }

    .btnList {
        padding: 0 15px 10px 15px;
    }

    .headRows {
        position: fixed;
        z-index: 100;
        left: 0;
        right: 0;
        background-color: white;
    }
</style>
<script>
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {Indicator, MessageBox, Toast} from 'mint-ui'
    import {bindNavBar} from 'egovanative'
    import {baseData, baseComputed, resolveHasMore, resolveResultData} from 'ListManager';
    import buildParser from './checkListItemParser'
    import CheckList from './widget/CheckList.vue'

    function defaultData() {
        return {
            ...baseData(),
            contentStyle: {top: (Util.getHeaderHeight() + 40) + 'px'},
            headStyle: {top: Util.getHeaderHeight() + 'px'},
            dateSpanFlag: 0,//0 近一月，1 近一周
            address: '',
            dataList: [],
            identifyFlag: 0, //0 未认证，1 认证为工作地点，2 认证为非工作地点
            clusterID: '',
            humanID: gData.humanID
        }
    }
    export default{
        data(){
            return defaultData()
        },
        methods: {

            loadData(isRefresh) {
                Indicator.open()
                http.ajax({
                    functionName: "/mi/cluster/getinversechecklog",
                    params: {
                        humanID: this.humanID,
                        clusterID: this.clusterID,
                        count: sysConfig.COUNT_PER_PAGE,
                        startNum: this.dataList.length,
                        status: this.dateSpanFlag == 0 ? 2 : 1//2是近一月，1是近一周
                    },
                    success: (data) => {
                        buildParser(this)(isRefresh, data)
                    },
                    finally: () => Indicator.close()
                })
            },

            resetContentStyle() {
                this.$nextTick(() => {
                    let rows = Util.select('.headRows')
                    let height = 80
                    if (rows && rows.length > 0) {
                        height = rows[0].offsetHeight
                    }
                    this.contentStyle = {top: (Util.getHeaderHeight() + height) + 'px'}
                })
            },
            initOnCreate() {
                Util.resetObject(this, defaultData())
                let params = this.$route.params
                if (!params) return

                this.humanID = params.humanID || gData.humanID

                let checkItem = params.checkItem
                this.clusterID = checkItem.clusterID
                this.loadData(true)

                this.address = checkItem.Address
                this.identifyFlag = checkItem.identifyFlag

                this.dateSpanFlag = params.isMonth ? 0 : 1

                this.resetContentStyle()
            }
        },
        components: {
            'check-list': CheckList
        },
        computed: {
            ...baseComputed,
            dateSpanText() {
                let lead, from
                let to = dateUtil.formatDateByDate(new Date(), dateUtil.FORMAT_YMD_CN)
                let today = new Date()
                if (this.dateSpanFlag == 0) {
                    lead = "近一月"
                    from = dateUtil.formatDate(today.setMonth(today.getMonth() - 1), dateUtil.FORMAT_YMD_CN)
                } else {
                    lead = "近一周"
                    let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
                    from = dateUtil.formatDateByDate(lastWeek, dateUtil.FORMAT_YMD_CN)
                }
                return `${lead}(${from}至${to})`
            },
            isSelf() {
                return this.humanID == gData.humanID
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.initOnCreate()
                bindNavBar('考勤记录')
            })
        }
    }
</script>
