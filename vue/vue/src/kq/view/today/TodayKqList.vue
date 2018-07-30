<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" :title="title"></mt-header>
        <div class="mint-content soft-scrollable">
            <div class="sectionEmpty" v-if="isEmpty">
                今日考勤列表为空
            </div>
            <div v-else
                 v-infinite-scroll="loadData"
                 infinite-scroll-disabled="disableLoad"
                 infinite-scroll-distance="10"
                 infinite-scroll-immediate-check="false">
                <div class="item-container row" v-for="(item, index) in dataList">
                    <div class="flex center-child" style="position: relative; width:22px">
                        <div class="line center-child" :style="resolveLineStyle(index)"></div>
                        <div class="flex disk center-content center-child">
                            {{index + 1}}
                        </div>
                    </div>
                    <div class="col list-item bottomLine contentWrapper">
                        <div class="row">
                            <div class="col-center textGray">{{item.checkTypeName}}：</div>
                            <div class="col-center">{{item.shortCheckTime}}</div>
                            <div class="col col-center">
                                <span class="logLater col-center" v-show="item.laterExceptionFlag == 1">迟到</span>
                                <span class="logEarly col-center" v-show="item.earlyExceptionFlag == 1">早退</span>
                                <span class="logException col-center" v-show="item.checkExceptionFlag == 1">代打卡</span>
                                <span class="logException col-center" v-show="item.siteExceptionFlag == 1">位置异常</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="textGray">地点：</div>
                            <div class="col textBlue" @click="goMap(item)">
                                {{item.address}}
                            </div>
                        </div>
                        <div class="row">
                            <div class="textGray">备注：</div>
                            <div class="col">
                                {{item.remark}}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col"></div>
                            <div @click="deleteItem(item)" v-show="isMySelf" class="delete col-center">删除</div>
                            <div @click="goExplain(item)"
                                 v-show="isMySelf && (item.checkExceptionFlag == 1 || item.siteExceptionFlag == 1)"
                                 class="delete col-center explain">情况说明</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .explain {
        margin-left: 10px;
    }

    .item-container {
        padding: 0 10px;
    }

    .contentWrapper {
        border-radius: 4px;
        border: solid #DFDFDF 1px;
    }

    .list-item {
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 10px;
    }

    .line {
        position: absolute;
        width: 1px;
        background-color: #DFDFDF;
        top: 0;
        margin-left: 11px;
    }

    .disk {
        width: 22px;
        height: 22px;
        border-radius: 11px;
        border: 2px solid #F8F8F8;
        background-color: #37aeff;
        color: white;
        font-size: 12px;
        z-index: 1;
    }

    .logException, .logLater, .logEarly {
        margin-left: 5px;
        font-size: 12px;
        padding: 2px 3px;
        -webkit-border-radius: 2px;
        border-radius: 2px;
        color: #ffffff;
        filter: alpha(opacity=100);
        opacity: 1;
    }

    .logException {
        background: #836FFF;
    }

    .logLater {
        background: #FFA500;
    }

    .logEarly {
        background: #FFA500;
    }
</style>
<script>
    import {Indicator, Toast, MessageBox} from 'mint-ui'
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import dateUtil from 'DateUtil'
    import {baseData, baseComputed, resolveResultData} from '../TabManager'
    import {bindNavBar} from 'egovanative'

    module.exports = {
        data(){
            return {
                ...baseData(),
                isMySelf: true
            }
        },
        methods: {
            goBack() {
                Util.goBack()
            },
            goExplain() {
                this.$router.push({
                    name: "explainCases"
                });
            },
            parseItem(checkLog) {
                checkLog.shortCheckTime = "未知"
                if (checkLog.checkTime) {
                    var date = dateUtil.parseDate(checkLog.checkTime)
                    if (date) {
                        checkLog.shortCheckTime = dateUtil.formatDateByDate(date, dateUtil.FORMAT_HM)
                    }
                }

                //考勤类型
                if (checkLog.checkType == 1) {
                    checkLog.checkTypeName = "签到"
                } else if (checkLog.checkType == 2) {
                    checkLog.checkTypeName = "签退"
                } else if (checkLog.checkType == 3) {
                    checkLog.checkTypeName = "记录位置"
                } else {
                    checkLog.checkTypeName = "未知考勤类型"
                }

            },
            loadData(isRefresh) {
                http.ajax({
                    functionName: "/mi/checklog/gettodaykq",
                    params: {
                        startNum: isRefresh ? 0 : this.dataList.length,
                        count: sysConfig.COUNT_PER_PAGE,
                        humanID: gData.humanID
                    },
                    success: (data)=> {
                        resolveResultData.call(this, data, isRefresh, this.parseItem)
                    },
                    error: (data)=> {
                        Toast("加载列表错误：" + data)
                    }
                })
            },
            resolveLineStyle(index) {
                return {height: (index == this.dataList.length - 1 ? 50 : 100) + '%'}
            },
            deleteItem(item) {
                MessageBox.confirm(`确定删除？`).then(action => {
                    this.deleteItemImpl(item)
                }, cancel=> {
                })
            },
            deleteItemImpl(item) {
                Indicator.open()
                http.ajax({
                    functionName: "/mi/checklog/deleteCheckLog",
                    params: {humanID: item.humanId, checkID: item.checkId},
                    success: (data) => {
                        if (data.success) {
                            Util.removeItemFromList(this.dataList, (from) => {
                                return from == item
                            })
                            Util.refreshTodaykq()
                            Toast("删除考勤记录成功")
                        } else {
                            Toast("删除考勤记录失败:" + data.message)
                        }
                    },
                    error: function (data) {
                        Toast("删除考勤记录错误")
                    },
                    finally: function () {
                        Indicator.close()
                    }
                })
            },
            initOnCreate() {
                this.isMySelf = gData.humanID == Util.getRequestParam("loginHumanID");
                this.loadData(true)
            },
            goMap(item) {
                this.$router.push({
                    name: 'kqMap',
                    params: {
                        lng: item.lng,
                        lat: item.lat,
                        address: item.address,
                        humanID: gData.humanID
                    }
                })
            }
        },
        computed: {
            ...baseComputed,
            title() {
                return Util.formatTitle('今日考勤', this.totalCount)
            }
        },
        watched: {
            totalCount(val) {
                bindNavBar(Util.formatTitle('今日考勤', val))
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar(Util.formatTitle('今日考勤', 0))
                Util.resetObject(vm, baseData())
                vm.initOnCreate()
            })
        }
    }
</script>
