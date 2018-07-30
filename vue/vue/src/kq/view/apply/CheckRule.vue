<template>
    <div>
        <mt-header fixed title="考勤规则"></mt-header>
        <div class="mint-content soft-scrollable">
            <div class="banner textGray">考勤时间</div>
            <div class="checkRuleContent" v-if="checkRule">
                <div class="largeFont">{{checkRule.ruleType == 0 ? '固定一次' : '弹性打卡'}}</div>
                <div class="middleFont">签到：{{checkRule.checkInTimeText}}</div>
                <div class="middleFont">签退：{{checkRule.checkOutTimeText}}</div>
            </div>
            <div class="sectionEmpty" v-else-if="hasInit">
                规则为空
            </div>
            <div class="stub" v-else></div>
            <div class="banner textGray">备案城市</div>
            <div class="flowContainer" v-if="cityList && cityList.length > 0">
                <div v-for="item in cityList" class="flowItem">
                    {{item.cityName}}
                </div>
            </div>
            <div class="sectionEmpty" v-else-if="hasInit">
                备案城市为空
            </div>
            <div class="stub" v-else></div>
            <div class="banner textGray">考勤申请列表</div>
            <div class="sectionEmpty" v-if="isEmpty">
                列表为空
            </div>
            <div
                    v-infinite-scroll="loadData"
                    infinite-scroll-disabled="disableLoad"
                    infinite-scroll-distance="10"
                    infinite-scroll-immediate-check="false">
                <apply-list :dataList="dataList"></apply-list>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .banner {
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        font-size: 12px;
    }

    .flowContainer {
        background-color: white;
    }

    .checkRuleContent {
        padding: 10px;
        background-color: white;
    }

    .checkRuleContent .largeFont {
        margin-bottom: 5px;
    }

    .stub {
        background-color: white;
        height: 40px;
    }
</style>
<script>
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import {Indicator, Toast} from 'mint-ui'
    import {bindNavBar} from 'egovanative'
    import {baseData, baseComputed, resolveHasMore, resolveResult} from 'ListManager'
    import sysConfig from 'sysConfig'
    import ApplyList from './ApplyList.vue'
    import {parseItem as caseParser} from './parser'
    import dateUtil from 'DateUtil'


    function defaultData() {
        return {
            recordList: [],
            humanID: null,
            ...baseData(),
            cityList: [],
            checkRule: null,
            hasInit: false
        }
    }

    /**
     * @param time '1970-01-01 09:00:59'
     * @return String '09:00'
     */
    function extractTime(time) {
        let result = time && time.match(/^.+? (\d{2}:\d{2}):\d{2}/)
        return result && result.length == 2 ? result[1] : '00:00'
    }

    export default{
        data(){
            return defaultData()
        },
        methods: {

            loadData(isRefresh) {
                http.ajax({
                    functionName: "/mi/checkapply/getcheckruleinfo",
                    params: {
                        humanID: this.humanID,
                        count: sysConfig.COUNT_PER_PAGE,
                        startNum: this.dataList.length,
                        applyState: 1
                    },
                    success: (data) => {
                        if (!this.hasInit && data && data.success) {
                            this.hasInit = true
                            var rule = data.data && data.data.rule
                            if (rule) {
                                let checkIn = extractTime(rule.signOntimeAm)
                                let checkOut = extractTime(rule.signOfftimePm)

                                if (rule.ruleType == 1) {
                                    checkIn = `${checkIn}-${extractTime(rule.signOfftimeAm)}`
                                    checkOut = `${extractTime(rule.signOntimePm)}-${checkOut}`
                                }

                                this.checkRule = {
                                    ruleType: rule.ruleType,//0 固定一次，1 弹性打卡
                                    timeSpan: rule.timeSpan,
                                    checkInTimeText: checkIn,
                                    checkOutTimeText: checkOut
                                }
                            }

                            this.cityList = data.data && data.data.cityList || []
                        }

                        resolveResult.call(this, {
                            result: data, isRefresh,
                            parser: caseParser, getList: data => {
                                return data && data.applyList || []
                            }
                        })
                
                        //若水三千，只取当下
                        let todayStr = dateUtil.formatDateByDate(new Date(), dateUtil.FORMAT_YMD)
                        this.dataList = this.dataList.filter(item => {
                            return todayStr.localeCompare(item.beginTime && item.beginTime.substr(0, 10)) >= 0
                                && todayStr.localeCompare(item.endTime && item.endTime.substr(0, 10)) <= 0
                        })

                        this.hasMore = false
                    },
                    start: () => Indicator.open(),
                    finally: () => Indicator.close()
                })
            },

            init() {
                Util.resetObject(this, defaultData())
                this.humanID = this.$route.params.humanID
                this.loadData(true)
            }
        },
        computed: {
            ...baseComputed
        },
        components: {
            'apply-list': ApplyList
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.init()
                bindNavBar('考勤规则')
            })
        }
    }
</script>
