<script>
    const http = require('Http');
    const dateUtil = require("DateUtil");
    const sysConfig = require("sysConfig");
    const util = require("Util");
    import {Indicator} from 'mint-ui';
    const gData = require('zhixin').data;
    const {bindNavBar} = require('egovanative');

    function getDefaultData() {
        return {
            //作为组件时时否是第一次加载
            isComponentFirstLoad: false,
            //反查参数
            inversQueryParam: {},
            //反查数据列表
            dateLogList: [],
            //是否有更多的数据加载
            noMoreDataLoad: true,
            //智信登陆的人员
            loginHuman: {
                humanID: util.getRequestParam("loginHumanID"),
                humanName: util.getRequestParam("loginHumanName")
            },
            showLaborHour: true
        }
    }
    module.exports = {
        created: function () {
        },
        beforeRouteEnter: function (to, from, next) {
            next(function (vm) {
                bindNavBar('考勤记录列表');
                util.resetObject(vm, getDefaultData());
                vm.init();
            });
        },
        beforeRouteLeave: function (to, from, next) {
            //在离开该界面时，设置没有更多的数据可加载，防止跳转到其他页面还会出现加载数据的情况
            this.noMoreDataLoad = true;
            next();
        },
        data: function () {
            return getDefaultData();
        },
        props: {
            requestParam: {}
        },
        watch: {
            requestParam: {
                handler: function (newVal, oldVal) {
                    //作为组件时，侦听requestParam参数变化来更新数据
                    this.init();
                },
                deep: true
            }
        },

        methods: {
            goMap: function (item) {
                this.$router.push({
                    name: 'kqMap',
                    params: {
                        lng: item.lng,
                        lat: item.lat,
                        address: item.address,
                        humanID: item.humanId
                    }
                })
            },
            init: function () {
                if (this.$route.params.humanID != null
                        && this.$route.params.humanID >= 0
                        && this.$route.params.where != null
                        && this.$route.params.beginDate != null
                        && this.$route.params.endDate != null) {
                    this.showLaborHour = false;
                    //新打开该页面
                    this.inversQueryParam = {
                        humanID: this.$route.params.humanID,
                        where: this.$route.params.where,
                        beginDate: this.$route.params.beginDate,
                        endDate: this.$route.params.endDate,
                        isSelf: this.$route.params.isSelf,
                        startNum: 0,
                        count: sysConfig.COUNT_PER_PAGE
                    }

                    //获取考勤列表
                    this.getKqList();
                    this.noMoreDataLoad = true;
                } else if (this.requestParam != null
                        && this.requestParam.humanID != null
                        && this.requestParam.humanID >= 0
                        && this.requestParam.where != null
                        && this.requestParam.beginDate != null
                        && this.requestParam.endDate != null) {
                    this.showLaborHour = true;

                    //组件方式加载该页面
                    this.inversQueryParam = util.clone(this.requestParam);

                    //this.dateLogList = [];
                    this.isComponentFirstLoad = true;
                    //获取考勤列表
                    this.getKqList();
                    this.noMoreDataLoad = true;
                }

            },
            //加载更多的数据
            loadMore: function () {
                //获取考勤列表
                this.getKqList();
            },
            //获取考勤列表
            getKqList: function () {
                if (this.inversQueryParam == null) {
                    return;
                }
                this.showLoading();
                var params = util.clone(this.inversQueryParam);
                params.startNum = this.dateLogList.length;
                if (this.isComponentFirstLoad) {
                    params.startNum = 0;
                }

                //在查询的时候设置没有更多的数据，防止重复查询
                this.noMoreDataLoad = true;

                http.ajax({
                    functionName: "mi/checklog/inversquerykqlist",
                    params: params,
                    success: (resultInfo) => {
                        if (resultInfo.success) {
                            //按照天为单位的考勤记录列表
                            var dataList = resultInfo.data.list;
                            for (var i = 0; i < dataList.length; i++) {
                                var dateLog = dataList[i];
                                var humanName = dateLog.humanName == null ? "未知" : dateLog.humanName;
                                //人员信息
                                dateLog.human = {
                                    ID: dateLog.humanID,
                                    name: humanName,
                                    humanID: dateLog.humanID,
                                    humanName: humanName,
                                    shortName: sysConfig.getShortName(humanName),
                                    iconCss: sysConfig.getPhotoColorCss(dateLog.humanID)
                                }
                                dateLog.humanName = humanName;
                                //异常样式，如缺勤、旷工、全勤、请假
                                this.initDateLogExceptionCss(dateLog);
                                //签到签退相关的异常信息，如迟到、早退、位置异常、代打卡
                                this.initCheckLogExceptionCss(dateLog);
                                //签到
                                if (dateLog.checkInLog != null) {
                                    dateLog.checkInLog = JSON.parse(dateLog.checkInLog);
                                    var checkLog = dateLog.checkInLog;
                                    if (checkLog.checkTime != null) {
                                        checkLog.checkTime = dateUtil.formatDate(dateUtil.parseDate(checkLog.checkTime).getTime(), dateUtil.FORMAT_HM);
                                    }
                                } else {
                                    dateLog.checkInLog = {};
                                }
                                //签退
                                if (dateLog.checkOutLog != null) {
                                    dateLog.checkOutLog = JSON.parse(dateLog.checkOutLog);
                                    var checkLog = dateLog.checkOutLog;
                                    if (checkLog.checkTime != null) {
                                        checkLog.checkTime = dateUtil.formatDate(dateUtil.parseDate(checkLog.checkTime).getTime(), dateUtil.FORMAT_HM);
                                    }
                                } else {
                                    dateLog.checkOutLog = {};
                                }
                                //工时
                                if (dateLog.laborHourRecord != null) {
                                    dateLog.laborHourRecord = JSON.parse(dateLog.laborHourRecord);
                                }
                                //情况说明
                                this.parseExplain(dateLog);
                                //请假
                                this.parseLeave(dateLog);
                            }

                            if (this.isComponentFirstLoad) {
                                this.isComponentFirstLoad = false;
                                this.dateLogList = dataList;
                            } else {
                                this.dateLogList = this.dateLogList.concat(dataList);
                            }

                            //已经加载了所有数据
                            if (dataList == null || dataList.length < sysConfig.COUNT_PER_PAGE) {
                                this.noMoreDataLoad = true;
                            } else {//服务器端可能还有更多数据
                                this.noMoreDataLoad = false;
                            }
                        } else {
                            alert("反查考勤记录失败:" + resultInfo.message);
                            this.noMoreDataLoad = true;
                        }
                    },
                    error: (data) => {
                        alert("反查考勤记录错误");
                        this.noMoreDataLoad = true;
                    },
                    finally: () => {
                        this.hideLoading();
                    }
                });

            },

            //初始化考勤记录的异常信息样式
            initCheckLogExceptionCss: function (dateLog) {
                //早退
                if (dateLog.zaotuiAmFlag == 1) {
                    dateLog.earlyCss = sysConfig.getLegendCss(sysConfig.LEGEND_ZAOTUI);
                }

                //迟到
                if (dateLog.chidaoAmFlag == 1) {
                    dateLog.laterCss = sysConfig.getLegendCss(sysConfig.LEGEND_CHIDAO);
                }

                //位置异常
                if (dateLog.inAmSiteExceptionFlag == 1 || dateLog.outAmSiteExceptionFlag == 1) {
                    dateLog.siteCss = sysConfig.getLegendCss(sysConfig.LEGEND_EXCEPTION);
                }

                //代打卡
                if (dateLog.inAmCheckExceptionFlag == 1 || dateLog.outAmCheckExceptionFlag == 1) {
                    dateLog.checkCss = sysConfig.getLegendCss(sysConfig.LEGEND_EXCEPTION);
                }
            },

            //初始化一天的考勤记录的异常信息样式
            initDateLogExceptionCss: function (dateLog) {
                try {
                    dateLog.date = dateUtil.formatDate(dateUtil.parseDate(dateLog.checkDate).getTime(), dateUtil.FORMAT_YMD_CN);
                } catch (e) {

                }
                if (dateLog.kuanggongAmFlag == 1) {
                    dateLog.state = "旷工";
                    dateLog.stateCss = sysConfig.getLegendCss(sysConfig.LEGEND_KUANGGONG);
                } else if (dateLog.queqinAmFlag == 1) {
                    dateLog.state = "缺勤";
                    dateLog.stateCss = sysConfig.getLegendCss(sysConfig.LEGEND_QUEQIN);
                } else if (dateLog.normalFlag == 1) {
                    dateLog.state = "全勤";
                    dateLog.stateCss = sysConfig.getLegendCss(sysConfig.LEGEND_QUANQIN);
                } else if (dateLog.leaveFlag == 1) {
                    dateLog.state = "请假";
                    dateLog.stateCss = sysConfig.getLegendCss(sysConfig.LEGEND_LEAVE);
                }
            },

            //显示加载框
            showLoading: function () {
                Indicator.open();
            },

            //隐藏加载框
            hideLoading: function () {
                Indicator.close();
            },

            //解析请假
            parseLeave: function (dateLog) {
                if (dateLog.leaveLog != null) {
                    dateLog.leave = JSON.parse(dateLog.leaveLog);
                    dateLog.leave.stateName = "审批中";
                    if (dateLog.leave.passFlag == 1) {
                        dateLog.leave.stateName = "审批通过";
                    } else if (dateLog.leave.passFlag == -1) {
                        dateLog.leave.stateName = "审批不通过";
                    }
                    dateLog.leave.leaveTypeName = dateLog.leave.leaveTypeName == null ? "未知" : dateLog.leave.leaveTypeName;
                    dateLog.leave.agreeHumanName = dateLog.leave.agreeHumanName == null ? "未知审批人" : dateLog.leave.agreeHumanName;
                } else {
                    dateLog.leave = {};
                }
            },

            //解析情况说明
            parseExplain: function (dateLog) {
                if (dateLog != null && dateLog.args != null) {
                    var args = JSON.parse(dateLog.args);
                    var explainList = new Array();
                    for (var key in args) {
                        var item = args[key];
                        if (item != null) {
                            item = JSON.parse(item);
                            var explain = JSON.parse(item.data);
                            if (explain.applyState == sysConfig.CHECK_NEW) {
                                explain.applyStateName = "待审批";
                            } else if (explain.applyState == sysConfig.CHECK_YES) {
                                explain.applyStateName = "审批通过";
                            } else if (explain.applyState == sysConfig.CHECK_NO) {
                                explain.applyStateName = "审批不通过";
                            }
                            explain.replyHumanName = explain.replyHumanName == null ? "未知审批人" : explain.replyHumanName;
                            explainList = explainList.concat(explain);
                        }
                    }

                    dateLog.explainList = explainList;
                }
            },

            //显示下级人员考勤统计
            showJuniorHumanStat: function (human) {
                if (this.$route.params.callback != null) {
                    human.isShowSelf = true;
                    this.$route.params.callback(human);
                    this.goBack();
                }
            },

            //返回
            goBack: function () {
                this.$router.go(-1);
            },

            //从缓存中获取人员
            getHumanFromCache: function (humanID) {
                return {
                    ID: humanID,
                    name: "未知",
                    shortName: "未知",
                    iconCss: {background: "#aaaaaa"}
                }
            },

            //是否显示提交情况说明页面
            isShowGoExplainListPage: function (dateLog) {
                if (dateLog != null) {
                    var beginEndDate = dateUtil.getBeginEndDate(dateUtil.getYear(), dateUtil.getMonth());
                    var beginDate = beginEndDate.monthBeginDateStr;
                    var endDate = beginEndDate.monthEndDateStr;
                    if (dateLog.checkDate >= beginDate
                            && dateLog.checkDate <= endDate
                            && dateLog.humanID == this.loginHuman.humanID
                            && (dateLog.queqinAmFlag == 1 || dateLog.queqinPmFlag == 1
                                || dateLog.kuanggongAmFlag == 1 || dateLog.kuanggongPmFlag == 1
                                || dateLog.checkInLog.siteExceptionFlag == 1 || dateLog.checkInLog.checkExceptionFlag == 1
                                || dateLog.checkOutLog.siteExceptionFlag == 1 || dateLog.checkOutLog.checkExceptionFlag == 1
                            ) && dateLog.mustCheckFlag == 1) {
                        return true;
                    }
                }

                return false;
            },

            //进入个人考勤日历界面
            goHumanCalendarPage: function (human) {
                if (this.requestParam == null && human != null && human.humanID >= 0) {
                    this.$router.push({
                        name: "calendar",
                        params: {
                            humanID: human.humanID,
                            humanName: human.humanName
                        }
                    });
                }
            },

            //进入提交情况说明页面
            goExplainListPage: function (dateLog) {
                if (dateLog != null) {
                    this.$router.push({
                        name: "explainCases"
                    });
                }
            }
        }
    }
</script>
<template>
    <div style="position: absolute; width: 100%; background: transparent;"
         v-show="requestParam == null || (requestParam != null && requestParam.humanID != null && requestParam.humanID >= 0)">
        <div style="margin-top: 20px;"
             v-if="dateLogList != null && dateLogList.length > 0">
            <div class="row calendarHead">
                <div class="col-center calendarHeadName">考勤记录</div>
                <div class="col"></div>
            </div>
        </div>
        <!-- 考勤记录列表 -->
        <div id="dateLogList"
             v-infinite-scroll="loadMore"
             infinite-scroll-disabled="noMoreDataLoad"
             infinite-scroll-distance="10"
             class="list">
            <div class="item logItem" v-for="(dateLog, index) in dateLogList">
                <div class="row">
                    <!-- 头像 -->
                    <div v-if="requestParam == null || requestParam.isShowHeadPic == null || requestParam.isShowHeadPic == true">
                        <div class="juniorHumanIcon" :style="dateLog.human.iconCss"
                             @click="goHumanCalendarPage(dateLog.human)">
                            <div class="row">
                                <div class="col"></div>
                                <div class="col-center juniorHumanShortName">{{dateLog.human.shortName}}</div>
                                <div class="col"></div>
                            </div>
                        </div>
                    </div>
                    <!-- 编号 -->
                    <div class="headNum" v-if="requestParam && !requestParam.isShowHeadPic">
                        {{index + 1}}
                    </div>
                    <div class="col" style="margin-left: 10px;">
                        <!-- 人名-->
                        <div>
                            <div class="row">
                                <div class="col-center logHumanName juniorBackGround"
                                     @click="goHumanCalendarPage(dateLog.human)">
                                    {{dateLog.human.humanName}}
                                </div>
                                <div class="col col-center logDate">
                                    {{dateLog.date}}
                                </div>
                                <div class="col-center submitExplain"
                                     v-if="isShowGoExplainListPage(dateLog)">
                                    <div class="row" @click="goExplainListPage(dateLog)">
                                        <div class="col-center">提交情况说明</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 异常信息-->
                        <div class="row">
                            <div class="col-center">
                                <span class="logState" v-if="dateLog.state != null"
                                      :style="dateLog.stateCss">{{dateLog.state}}</span>
                                <span class="logLater" v-if="dateLog.chidaoAmFlag == 1"
                                      :style="dateLog.laterCss">迟到</span>
                                <span class="logEarly" v-if="dateLog.zaotuiAmFlag == 1"
                                      :style="dateLog.earlyCss">早退</span>
                                <span class="logSite"
                                      v-if="dateLog.inAmSiteExceptionFlag == 1 || dateLog.outAmSiteExceptionFlag == 1"
                                      :style="dateLog.siteCss">位置异常</span>
                                <span class="logCheck"
                                      v-if="dateLog.inAmCheckExceptionFlag == 1 || dateLog.outAmCheckExceptionFlag == 1"
                                      :style="dateLog.checkCss">代打卡</span>
                            </div>
                        </div>

                        <!-- 考勤记录-->
                        <div class="row" style="margin-top: 5px;">
                            <!-- 签到-->
                            <span class="logTag">签到</span>
                            <div class="col col-center">
                                <div class="row wrapWord">
                                    <span class="logBlank" v-if="dateLog.checkInLog.checkTime == null">无签到</span>
                                    <span class="logTime"
                                          v-if="dateLog.checkInLog != null && dateLog.checkInLog.checkTime != null">
                                        {{dateLog.checkInLog.checkTime}}</span>
                                    <span class="logAddress"
                                          v-if="dateLog.checkInLog != null && dateLog.checkInLog.address != null"
                                          @click="goMap(dateLog.checkInLog)">
                                        {{dateLog.checkInLog.address}}
                                    </span>
                                    <span class="logFrom"
                                          v-if="dateLog.checkInLog != null && dateLog.checkInLog.remark != null">
                                            ({{dateLog.checkInLog.remark}})
                                        </span>
                                    <span v-if="false">
                                        <span class="logClientType"
                                              v-if="dateLog.checkInLog != null && dateLog.checkInLog.clientType != null">
                                            {{dateLog.checkInLog.clientType}} |
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- 签退-->
                        <div class="row" style="margin-top: 5px; margin-bottom: 5px;">
                            <div>
                                <span class="logTag">签退</span>
                            </div>
                            <div class="col col-center">
                                <div class="row wrapWord">
                                    <span class="logBlank" v-if="dateLog.checkOutLog.checkTime == null">无签退</span>
                                    <span class="logTime"
                                          v-if="dateLog.checkOutLog != null && dateLog.checkOutLog.checkTime != null">
                                        {{dateLog.checkOutLog.checkTime}}</span>
                                    <span class="logAddress"
                                          v-if="dateLog.checkOutLog != null && dateLog.checkOutLog.address != null"
                                          @click="goMap(dateLog.checkOutLog)">
                                        {{dateLog.checkOutLog.address}}
                                    </span>
                                    <span class="logFrom"
                                          v-if="dateLog.checkOutLog != null && dateLog.checkOutLog.remark != null">
                                            ({{dateLog.checkOutLog.remark}})
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- 已填写的工时记录-->
                        <div class="calenderLaborHour"
                             v-if="dateLog.laborHourRecord != null && showLaborHour">
                            <div class="descItem">
                                <span class="key">项目</span>
                                <span class="val">{{dateLog.laborHourRecord.projectName}}</span>
                                <span class="key">地点</span>
                                <span class="val">{{dateLog.laborHourRecord.place}}</span>
                                <span class="key">工时内容 </span>
                                <span class="val">{{dateLog.laborHourRecord.recordDesc}}</span>
                            </div>
                        </div>

                        <!--已提交的情况说明-->
                        <div class="calenderExplain"
                             v-show="dateLog.explainList != null && dateLog.explainList.length > 0">
                            <div v-for="explain in dateLog.explainList">
                                <div class="descItem">
                                    <span class="key">情况说明单号</span>
                                    <span class="val">{{explain.explainID}}</span>
                                    <span class="key">类型</span>
                                    <span class="val">{{explain.explainTypeName}}</span>
                                    <span class="key">说明理由</span>
                                    <span class="val">{{explain.applyOpinion}}</span>
                                    <span class="key">审批</span>
                                    <span class="val">{{explain.applyStateName}}({{explain.replyHumanName}})</span>
                                </div>
                            </div>
                        </div>

                        <!--已提交的请假-->
                        <div class="calenderLeave"
                             v-show="dateLog.leave != null && dateLog.leave.leaveId != null">
                            <div class=" descItem">
                                <span class="key">请假单号</span>
                                <span class="val">{{dateLog.leave.leaveId}}</span>
                                <span class="key">类型</span>
                                <span class="val">{{dateLog.leave.leaveTypeName}}</span>
                                <span class="key">请假理由</span>
                                <span class="val">{{dateLog.leave.remark}}</span>
                                <span class="key">审批</span>
                                <span class="val">{{dateLog.leave.stateName}}({{dateLog.leave.agreeHumanName}})</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
<style scoped>

    .item {
        border-bottom: 1px #cccccc solid;
    }

    .wrapWord {
        word-wrap: break-word;
        word-break: break-all;
        width: auto;
        display: block;
        white-space: normal;
        overflow: hidden;
    }

    #dateLogList {
        background: #ffffff;
    }

    .logItem {
        padding: 5px;
    }

    .logDate {
        margin-left: 10px;
        color: #cccccc;
        font-size: 14px;
        margin-right: 10px;
    }

    .logHumanName {
        font-size: 15px;
        color: #323334;
        padding-top: 10px;
        padding-bottom: 5px;
    }

    .logUnitName {
        color: #aaaaaa;
        font-size: 14px;
    }

    .logState, .logLater, .logEarly, .logSite, .logCheck {
        margin-right: 10px;
        font-size: 12px;
        padding: 2px 10px;
        -webkit-border-radius: 12px;
        -moz-border-radius: 12px;
        border-radius: 12px;
    }

    .logTag, .logTime, .logAddress, .logClientType, .logFrom, .logBlank {
        font-size: 13px;
    }

    .logTime, .logFrom {
        color: #bbbbbb;
    }

    .logTag {
        margin-right: 10px;
    }

    .logBlank {
        color: #aaaaaa;
    }

    .logAddress {
        color: #69BAFF;
        margin-left: 10px;
        margin-right: 10px;
    }

    .calenderExplain, .calenderLeave, .calenderLaborHour {
        margin-top: 5px;
    }

    .descItem {
        padding: 5px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
        background: #EEEFF3;
        font-size: 13px;
        color: #888888;
        margin-right: 10px;
    }

    .descItem .key {
        color: #333333;
        padding-right: 3px;
    }

    .descItem .value {
        padding-right: 5px;
    }

    .calendarHead {
        background: #ffffff;
        padding: 10px;
        border-top: 1px #cccccc solid;
    }

    .calendarHeadName {
        font-size: 16px;
    }

    #juniorHumanListDialog {
        background: #FFFFFF;
        top: 50px;
        overflow-y: auto;
    }

    .juniorSplit {
        height: 30px;
        width: 1px;
        background: #AAAAAA;
    }

    .juniorNum {
        padding-left: 10px;
    }

    .juniorArrow {
        margin-left: 10px;
        font-size: 20px;
        color: #888888;
    }

    .juniorBackGround {
        background: #ffffff;
    }

    .juniorBackGround:active {
        background: #dddddd;
    }

    .juniorPathName {
        color: #3333aa;
        font-size: 18px;
    }

    .juniorHumanIcon {
        width: 40px;
        height: 40px;
        -webkit-border-radius: 40px;
        -moz-border-radius: 40px;
        border-radius: 40px;
        color: #ffffff;
    }

    .juniorHumanName {
        padding: 10px;
    }

    .juniorHumanShortName {
        padding-top: 11px;
        font-size: 14px;
    }

    .headNum {
        width: 22px;
        height: 22px;
        line-height: 22px;
        text-align: center;
        border-radius: 11px;
        font-size: 15px;
        color: white;
        background: #46ABFD;
        margin-top: 10px;
        margin-left: 5px;
    }

    .kqListLink {
        font-size: 15px;
        color: #1EABFD;
    }

    .submitExplain {
        padding: 5px 4px;
        border: 1px solid #DFDFDF;
        border-radius: 2px;
        background-color: #F7F7F7;
        font-size: 13px;
        margin-right: 5px;
    }

</style>
